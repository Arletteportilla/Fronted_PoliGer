import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Notification } from '@/types';
import type { getColors } from '@/utils/colors';
type ThemeColors = ReturnType<typeof getColors>;

interface RecordatoriosModalProps {
  visible: boolean;
  onClose: () => void;
  alerts: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onVerTodas?: () => void;
  onCambiarEstado?: (alert: Notification) => void;
}

// ─── Detalle enriquecido ───────────────────────────────────────────────────
interface Detalle {
  tipo: 'germinacion' | 'polinizacion';
  codigo: string;
  descripcion: string;
  diasTranscurridos: number | null;
  nombrePlanta: string;
  genero: string | null;
  madreCodigo: string | null;
  madreEspecie: string | null;
  padreCodigo: string | null;
  padreEspecie: string | null;
  fechaRegistro: string | null;
  fechaEstimada: string | null;
  ubicacion: string | null;
  progreso: number | null;
  estadoActual: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO' | null;
}

function estadoToLabel(estado?: string | null): string {
  switch (estado) {
    case 'INICIAL': return 'FASE INICIAL';
    case 'EN_PROCESO_TEMPRANO': return 'EN PROCESO';
    case 'EN_PROCESO_AVANZADO': return 'PROCESO AVANZADO';
    case 'FINALIZADO': return 'FINALIZADO';
    default: return 'REVISIÓN PENDIENTE';
  }
}

function estadoToProgress(estado?: string | null): number {
  switch (estado) {
    case 'INICIAL': return 10;
    case 'EN_PROCESO_TEMPRANO': return 40;
    case 'EN_PROCESO_AVANZADO': return 70;
    case 'FINALIZADO': return 100;
    default: return 0;
  }
}

function fmtFecha(s?: string | null): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    const hoy = new Date();
    const diff = Math.round((d.getTime() - hoy.getTime()) / 86400000);
    if (diff === 0) return '¡Hoy!';
    if (diff === 1) return '¡Mañana!';
    if (diff === -1) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
}

// ─── Hook: carga los datos reales ─────────────────────────────────────────
function useDetalle(alert: Notification | undefined): { detalle: Detalle | null; loading: boolean } {
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alert) return;
    let cancelled = false;
    setLoading(true);
    setDetalle(null);

    (async () => {
      const isGerminacion = !!(alert.germinacion_id || alert.detalles?.germinacion_id);
      const id = (alert.germinacion_id || alert.detalles?.germinacion_id
        || alert.polinizacion_id || alert.detalles?.polinizacion_id) as number | undefined;
      const dias = alert.detalles?.dias_transcurridos ?? null;
      const codigoFallback = alert.detalles?.codigo || '';

      try {
        if (isGerminacion && id) {
          const { germinacionService } = await import('@/services/germinacion.service');
          const g = await germinacionService.getById(id);
          if (cancelled) return;
          const ubicacion = [g.percha, g.nivel, g.clima_lab].filter(Boolean).join(' · ') || null;
          setDetalle({
            tipo: 'germinacion',
            codigo: g.codigo || codigoFallback,
            descripcion: `Esta germinación lleva ${dias ?? '?'} días desde su siembra. Se recomienda verificar el estado del proceso.`,
            diasTranscurridos: dias,
            nombrePlanta: g.especie_variedad || g.especie || g.codigo || codigoFallback,
            genero: g.genero || null,
            madreCodigo: null,
            madreEspecie: null,
            padreCodigo: null,
            padreEspecie: null,
            fechaRegistro: g.fecha_siembra || g.fecha_polinizacion || null,
            fechaEstimada: g.prediccion_fecha_estimada || g.fecha_germinacion_estimada || null,
            ubicacion,
            progreso: g.progreso_germinacion ?? null,
            estadoActual: g.estado_germinacion ?? null,
          });
        } else if (!isGerminacion && id) {
          const { polinizacionService } = await import('@/services/polinizacion.service');
          const p = await polinizacionService.getById(id);
          if (cancelled) return;
          const ubicacion = [
            p.vivero ? `Vivero ${p.vivero}` : null,
            p.mesa ? `Mesa ${p.mesa}` : null,
            p.pared ? `Pared ${p.pared}` : null,
          ].filter(Boolean).join(' · ') || p.nueva_clima || null;
          setDetalle({
            tipo: 'polinizacion',
            codigo: p.codigo || p.nueva_codigo || codigoFallback,
            descripcion: `La polinización lleva ${dias ?? '?'} días desde su registro. Es momento de revisar su desarrollo y estado de maduración.`,
            diasTranscurridos: dias,
            nombrePlanta: p.nueva_especie || p.especie_variedad || p.especie || codigoFallback,
            genero: null,
            madreCodigo: p.madre_codigo || null,
            madreEspecie: p.madre_especie || p.madre_variedad || null,
            padreCodigo: p.padre_codigo || null,
            padreEspecie: p.padre_especie || p.padre_variedad || null,
            fechaRegistro: p.fechapol || null,
            fechaEstimada: p.fecha_maduracion_predicha || p.fechamad || null,
            ubicacion,
            progreso: p.progreso_polinizacion ?? null,
            estadoActual: p.estado_polinizacion ?? null,
          });
        } else {
          setDetalle({
            tipo: isGerminacion ? 'germinacion' : 'polinizacion',
            codigo: codigoFallback,
            descripcion: alert.message,
            diasTranscurridos: dias,
            nombrePlanta: alert.title,
            genero: null,
            madreCodigo: null, madreEspecie: null, padreCodigo: null, padreEspecie: null,
            fechaRegistro: null, fechaEstimada: null, ubicacion: null, progreso: null,
            estadoActual: null,
          });
        }
      } catch {
        if (!cancelled) {
          setDetalle({
            tipo: isGerminacion ? 'germinacion' : 'polinizacion',
            codigo: codigoFallback,
            descripcion: alert.message,
            diasTranscurridos: dias,
            nombrePlanta: alert.title,
            genero: null,
            madreCodigo: null, madreEspecie: null, padreCodigo: null, padreEspecie: null,
            fechaRegistro: null, fechaEstimada: null, ubicacion: null, progreso: null,
            estadoActual: null,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [alert?.id]);

  return { detalle, loading };
}

// ─── Estilos dinámicos ─────────────────────────────────────────────────────
function createInfoRowStyles(c: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
    texts: { flex: 1 },
    label: { fontSize: 10, color: c.text.disabled, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 14, color: c.text.primary, fontWeight: '600', marginTop: 1 },
  });
}

function createCardStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.background.primary,
      borderRadius: 20,
      overflow: 'hidden',
      maxHeight: Dimensions.get('window').height * 0.85,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 14,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandIcon: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    brandName: { fontSize: 14, fontWeight: '700', color: c.text.primary },
    brandSub: { fontSize: 10, color: c.text.disabled, fontWeight: '600', letterSpacing: 0.5 },
    counter: { fontSize: 13, color: c.text.disabled, fontWeight: '600' },

    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginHorizontal: 20,
      marginBottom: 14,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

    loadingWrap: { alignItems: 'center', padding: 40, gap: 12 },
    loadingText: { fontSize: 14, color: c.text.tertiary },

    scrollArea: { maxHeight: Dimensions.get('window').height * 0.45 },

    titlePrefix: {
      fontSize: 14,
      color: c.text.tertiary,
      fontWeight: '500',
      marginHorizontal: 20,
    },
    titleCode: {
      fontSize: 22,
      fontWeight: '800',
      marginHorizontal: 20,
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    description: {
      fontSize: 13,
      color: c.text.tertiary,
      lineHeight: 20,
      marginHorizontal: 20,
      marginBottom: 16,
    },

    panelsRow: {
      flexDirection: 'row',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 14,
    },
    panel: {
      flex: 1,
      backgroundColor: c.background.secondary,
      borderRadius: 12,
      padding: 12,
    },
    panelTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 10,
    },

    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
      padding: 16,
    },
    statusBarLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 0.8 },
    statusBarValue: { fontSize: 18, color: '#fff', fontWeight: '800', marginTop: 2 },
    statusBarRight: { alignItems: 'flex-end' },
    progressNum: { fontSize: 28, color: 'rgba(255,255,255,0.95)', fontWeight: '900', lineHeight: 30 },
    progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.8 },

    actions: {
      paddingHorizontal: 20,
      gap: 10,
      marginBottom: 10,
    },
    btnPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
    },
    btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
    btnSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.border.default,
      backgroundColor: c.background.secondary,
    },
    btnSecondaryTxt: { color: c.text.tertiary, fontSize: 15, fontWeight: '600' },
    btnLink: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 5,
      paddingVertical: 8,
    },
    btnLinkTxt: { color: c.text.disabled, fontSize: 13, fontWeight: '500' as const },

    footerNote: {
      fontSize: 11,
      color: c.text.disabled,
      textAlign: 'center',
      paddingHorizontal: 24,
      paddingBottom: 20,
      lineHeight: 16,
    },
  });
}

function createOuterStyles(c: ThemeColors) {
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = Math.min(width - 40, 520);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.background.modal,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    wrapper: {
      width: CARD_WIDTH,
      alignItems: 'stretch',
      gap: 12,
    },

    closeFloating: {
      alignSelf: 'flex-end',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },

    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    navBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    navBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
    navBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },

    dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    dot: {
      width: 7, height: 7, borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dotActive: {
      width: 20, height: 7, borderRadius: 4,
      backgroundColor: '#fff',
    },

    globalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    verTodasTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' },
    limpiarTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },

    emptyCard: {
      backgroundColor: c.background.primary,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: c.text.primary },
    emptySub: { fontSize: 14, color: c.text.tertiary, textAlign: 'center' },
    emptyBtn: {
      marginTop: 8,
      backgroundColor: c.status.success,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
}

// ─── Fila de información ───────────────────────────────────────────────────
function InfoRow({ icon, label, value, accent, iconComponent }: {
  icon?: string; label: string; value: string; accent: string; iconComponent?: React.ReactNode;
}) {
  const { colors: c } = useTheme();
  const s = createInfoRowStyles(c);
  return (
    <View style={s.row}>
      {iconComponent ?? <Ionicons name={icon as any} size={14} color={accent} />}
      <View style={s.texts}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.value} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Tarjeta de una alerta ─────────────────────────────────────────────────
function AlertCard({
  alert,
  onDismiss,
  onClose,
  onCambiarEstado,
  index,
  total,
}: {
  alert: Notification;
  onDismiss: (id: string) => void;
  onClose: () => void;
  onCambiarEstado?: (alert: Notification) => void;
  index: number;
  total: number;
}) {
  const { colors: c } = useTheme();
  const s = createCardStyles(c);
  const { detalle, loading } = useDetalle(alert);

  // Auto-dismiss si el item ya está FINALIZADO (fue completado por otro flujo)
  useEffect(() => {
    if (!loading && detalle?.estadoActual === 'FINALIZADO') {
      onDismiss(alert.id);
    }
  }, [loading, detalle?.estadoActual, alert.id, onDismiss]);

  const isGerminacion = detalle?.tipo === 'germinacion';
  const accent = isGerminacion ? c.module.germinacion.primary : c.module.polinizacion.primary;
  const accentLight = isGerminacion ? c.module.germinacion.light : c.module.polinizacion.light;
  const accentDark = isGerminacion ? c.module.germinacion.icon : c.module.polinizacion.icon;

  const badgeLabel = isGerminacion ? 'REVISIÓN DE GERMINACIÓN' : 'ALERTA DE MADURACIÓN';
  const tipoLabel = isGerminacion ? 'Germinación' : 'Polinización';
  const iconName = isGerminacion ? 'leaf' : 'flower';

  return (
    <View style={s.card}>

      {/* ── Header de la tarjeta ── */}
      <View style={s.cardHeader}>
        <View style={s.brandRow}>
          <View style={[s.brandIcon, { backgroundColor: accent }]}>
            <Ionicons name={iconName} size={16} color="#fff" />
          </View>
          <View>
            <Text style={s.brandName}>Sistema Botánico</Text>
            <Text style={s.brandSub}>GESTIÓN DE CULTIVOS</Text>
          </View>
        </View>
        {total > 1 && (
          <Text style={s.counter}>{index + 1}/{total}</Text>
        )}
      </View>

      {/* ── Badge tipo ── */}
      <View style={[s.badge, { backgroundColor: accentLight }]}>
        <Ionicons name="alarm" size={12} color={accentDark} />
        <Text style={[s.badgeText, { color: accentDark }]}>{badgeLabel}</Text>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={s.loadingText}>Cargando información...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={s.scrollArea}>

          {/* ── Título + código ── */}
          <Text style={s.titlePrefix}>Recordatorio de {tipoLabel}:</Text>
          <Text style={[s.titleCode, { color: accent }]} numberOfLines={1}>
            {detalle?.codigo || '—'}
          </Text>

          {/* ── Descripción ── */}
          <Text style={s.description}>{detalle?.descripcion}</Text>

          {/* ── Paneles de info ── */}
          <View style={s.panelsRow}>
            {/* Panel izquierdo */}
            <View style={s.panel}>
              <Text style={[s.panelTitle, { color: accent }]}>
                {isGerminacion ? 'PLANTA' : 'PARENTESCO'}
              </Text>
              {isGerminacion ? (
                <>
                  <InfoRow icon="leaf-outline" label="Especie" value={detalle?.nombrePlanta || '—'} accent={accent} />
                  {detalle?.genero && (
                    <InfoRow icon="flower-outline" label="Género" value={detalle.genero} accent={accent} />
                  )}
                  {detalle?.ubicacion && (
                    <InfoRow icon="location-outline" label="Ubicación" value={detalle.ubicacion} accent={accent} />
                  )}
                </>
              ) : (
                <>
                  <InfoRow
                    icon="arrow-up-circle-outline"
                    label="Planta Madre"
                    value={[detalle?.madreCodigo, detalle?.madreEspecie].filter(Boolean).join(' · ') || detalle?.nombrePlanta || '—'}
                    accent={accent}
                  />
                  <InfoRow
                    icon="arrow-down-circle-outline"
                    label="Planta Padre"
                    value={[detalle?.padreCodigo, detalle?.padreEspecie].filter(Boolean).join(' · ') || '—'}
                    accent={accent}
                  />
                  {detalle?.ubicacion && (
                    <InfoRow icon="location-outline" label="Ubicación" value={detalle.ubicacion} accent={accent} />
                  )}
                </>
              )}
            </View>

            {/* Panel derecho */}
            <View style={s.panel}>
              <Text style={[s.panelTitle, { color: accent }]}>CRONOLOGÍA</Text>
              <InfoRow
                icon="calendar-outline"
                label={isGerminacion ? 'Fecha de Siembra' : 'Fecha de Polinización'}
                value={fmtFecha(detalle?.fechaRegistro)}
                accent={accent}
              />
              <InfoRow
                icon="hourglass-outline"
                label={isGerminacion ? 'Germinación Estimada' : 'Cosecha Estimada'}
                value={fmtFecha(detalle?.fechaEstimada)}
                accent={accent}
              />
            </View>
          </View>

          {/* ── Barra de estado ── */}
          <View style={[s.statusBar, { backgroundColor: accent }]}>
            <View>
              <Text style={s.statusBarLabel}>ESTADO ACTUAL</Text>
              <Text style={s.statusBarValue}>
                {estadoToLabel(detalle?.estadoActual)}
              </Text>
            </View>
            <View style={s.statusBarRight}>
              <Text style={s.progressNum}>{estadoToProgress(detalle?.estadoActual)}%</Text>
              <Text style={s.progressLabel}>AVANCE</Text>
            </View>
          </View>

        </ScrollView>
      )}

      {/* ── Botones de acción ── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: accent }]}
          onPress={() => onCambiarEstado ? onCambiarEstado(alert) : onClose()}
        >
          <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
          <Text style={s.btnPrimaryTxt}>Cambiar Estado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnLink}
          onPress={onClose}
        >
          <Ionicons name="time-outline" size={15} color={c.text.disabled} />
          <Text style={s.btnLinkTxt}>Recordarme más tarde</Text>
        </TouchableOpacity>
      </View>

      {/* ── Nota footer ── */}
      <Text style={s.footerNote}>
        Esta acción marcará la notificación como leída y la removerá del panel de recordatorios.
      </Text>

    </View>
  );
}

// ─── Modal principal con navegación ───────────────────────────────────────
export const RecordatoriosModal: React.FC<RecordatoriosModalProps> = ({
  visible,
  onClose,
  alerts,
  onDismiss,
  onDismissAll,
  onVerTodas,
  onCambiarEstado,
}) => {
  const { colors: c } = useTheme();
  const s = createOuterStyles(c);
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(index, Math.max(0, alerts.length - 1));
  const currentAlert = alerts[safeIndex];

  const handleDismiss = (id: string) => {
    onDismiss(id);
    if (safeIndex >= alerts.length - 1 && safeIndex > 0) {
      setIndex(safeIndex - 1);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.wrapper}>

          {/* Botón cerrar flotante */}
          <TouchableOpacity style={s.closeFloating} onPress={onClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          {alerts.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="checkmark-circle" size={64} color={c.status.success} />
              <Text style={s.emptyTitle}>¡Todo al día!</Text>
              <Text style={s.emptySub}>No tienes recordatorios pendientes.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={onClose}>
                <Text style={s.emptyBtnTxt}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {currentAlert && (
                <AlertCard
                  key={currentAlert.id}
                  alert={currentAlert}
                  onDismiss={handleDismiss}
                  onClose={onClose}
                  {...(onCambiarEstado && { onCambiarEstado })}
                  index={safeIndex}
                  total={alerts.length}
                />
              )}

              {alerts.length > 1 && (
                <View style={s.navRow}>
                  <TouchableOpacity
                    style={[s.navBtn, safeIndex === 0 && s.navBtnDisabled]}
                    onPress={() => setIndex(i => Math.max(0, i - 1))}
                    disabled={safeIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={20} color={safeIndex === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
                    <Text style={[s.navBtnTxt, safeIndex === 0 && { color: 'rgba(255,255,255,0.3)' }]}>Anterior</Text>
                  </TouchableOpacity>

                  <View style={s.dots}>
                    {alerts.map((_, i) => (
                      <TouchableOpacity key={i} onPress={() => setIndex(i)}>
                        <View style={[s.dot, i === safeIndex && s.dotActive]} />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[s.navBtn, safeIndex === alerts.length - 1 && s.navBtnDisabled]}
                    onPress={() => setIndex(i => Math.min(alerts.length - 1, i + 1))}
                    disabled={safeIndex === alerts.length - 1}
                  >
                    <Text style={[s.navBtnTxt, safeIndex === alerts.length - 1 && { color: 'rgba(255,255,255,0.3)' }]}>Siguiente</Text>
                    <Ionicons name="chevron-forward" size={20} color={safeIndex === alerts.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={s.globalActions}>
                {onVerTodas && (
                  <TouchableOpacity onPress={onVerTodas}>
                    <Text style={s.verTodasTxt}>Ver todas en notificaciones →</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onDismissAll}>
                  <Text style={s.limpiarTxt}>Marcar todas como leídas</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

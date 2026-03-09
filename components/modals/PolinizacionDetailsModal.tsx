import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { Polinizacion } from '@/types/index';

export interface PolinizacionDetailsModalProps {
  visible: boolean;
  polinizacion: Polinizacion | null;
  onClose: () => void;
}

const TIPO_COLORS: Record<string, string> = {
  self: '#3B82F6',
  sibling: '#8B5CF6',
  híbrida: '#F59E0B',
  hibrida: '#F59E0B',
  replante: '#10B981',
};

const ESTADO_COLORS: Record<string, string> = {
  INGRESADO: '#6B7280',
  EN_PROCESO: '#F59E0B',
  COMPLETADO: '#10B981',
  FINALIZADO: '#10B981',
  CANCELADO: '#EF4444',
};

function getTipoColor(tipo: string) {
  return TIPO_COLORS[tipo?.toLowerCase()] ?? '#3B82F6';
}

function getEstadoColor(estado: string) {
  return ESTADO_COLORS[estado?.toUpperCase()] ?? '#6B7280';
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[localStyles.badge, { backgroundColor: color }]}>
      <Text style={localStyles.badgeText}>{label}</Text>
    </View>
  );
}

function SectionCard({
  icon,
  title,
  children,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[localStyles.sectionCard, { backgroundColor: colors.background.primary, borderColor: colors.border?.default || '#E5E7EB' }]}>
      <View style={[localStyles.sectionHeader, { borderBottomColor: colors.border?.default || '#E5E7EB' }]}>
        <Ionicons name={icon} size={16} color={colors.primary.main} style={{ marginRight: 6 }} />
        <Text style={[localStyles.sectionTitle, { color: colors.primary.main }]}>{title}</Text>
      </View>
      <View style={localStyles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({ label, value, full, colors }: { label: string; value?: string | number | null; full?: boolean; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[localStyles.field, full && localStyles.fieldFull]}>
      <Text style={[localStyles.fieldLabel, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[localStyles.fieldValue, { color: colors.text.primary }]} numberOfLines={full ? undefined : 2}>
        {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
      </Text>
    </View>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <View style={localStyles.fieldRow}>{children}</View>;
}

function fmt(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES');
}

export function PolinizacionDetailsModal({
  visible,
  polinizacion,
  onClose,
}: PolinizacionDetailsModalProps) {
  const { colors } = useTheme();
  const { height } = Dimensions.get('window');

  const containerStyle = useMemo(
    () => [
      localStyles.container,
      {
        backgroundColor: colors.background.secondary,
        maxHeight: height * 0.88,
      },
    ],
    [colors, height]
  );

  const isSelf = polinizacion?.tipo_polinizacion?.toLowerCase() === 'self';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={localStyles.overlay}>
        <View style={containerStyle}>
          {/* Header */}
          <View style={[localStyles.header, { borderBottomColor: colors.border?.default || '#E5E7EB', backgroundColor: colors.background.primary }]}>
            <View style={localStyles.headerLeft}>
              <Ionicons name="leaf-outline" size={20} color={colors.primary.main} style={{ marginRight: 8 }} />
              <Text style={[localStyles.headerTitle, { color: colors.text.primary }]}>Detalles de Polinización</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={localStyles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Top info strip */}
          {polinizacion && (
            <View style={[localStyles.topStrip, { backgroundColor: colors.background.tertiary || colors.background.secondary }]}>
              <View style={localStyles.topStripLeft}>
                <Text style={[localStyles.codigoLabel, { color: colors.text.secondary }]}>Código</Text>
                <Text style={[localStyles.codigoValue, { color: colors.text.primary }]}>{polinizacion.codigo || '—'}</Text>
              </View>
              <View style={localStyles.topStripRight}>
                <Badge label={polinizacion.tipo_polinizacion || 'SELF'} color={getTipoColor(polinizacion.tipo_polinizacion || 'self')} />
                <View style={{ width: 8 }} />
                <Badge label={polinizacion.estado || 'INGRESADO'} color={getEstadoColor(polinizacion.estado || 'INGRESADO')} />
              </View>
            </View>
          )}

          <ScrollView
            style={localStyles.scrollView}
            contentContainerStyle={localStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {polinizacion && (
              <>
                {/* Planta Madre */}
                <SectionCard icon="flower-outline" title="Planta Madre" colors={colors}>
                  <FieldRow>
                    <Field label="Género" value={polinizacion.madre_genero} colors={colors} />
                    <Field label="Código" value={polinizacion.madre_codigo} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Especie" value={polinizacion.madre_especie} colors={colors} full />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Clima" value={polinizacion.madre_clima} colors={colors} />
                  </FieldRow>
                </SectionCard>

                {/* Planta Padre — solo si no es SELF */}
                {!isSelf && (
                  <SectionCard icon="git-branch-outline" title="Planta Padre" colors={colors}>
                    <FieldRow>
                      <Field label="Género" value={polinizacion.padre_genero} colors={colors} />
                      <Field label="Código" value={polinizacion.padre_codigo} colors={colors} />
                    </FieldRow>
                    <FieldRow>
                      <Field label="Especie" value={polinizacion.padre_especie} colors={colors} full />
                    </FieldRow>
                    <FieldRow>
                      <Field label="Clima" value={polinizacion.padre_clima} colors={colors} />
                    </FieldRow>
                  </SectionCard>
                )}

                {/* Nueva Planta */}
                <SectionCard icon="leaf-outline" title="Nueva Planta" colors={colors}>
                  <FieldRow>
                    <Field label="Género" value={polinizacion.nueva_genero || polinizacion.genero || polinizacion.madre_genero} colors={colors} />
                    <Field label="Código" value={polinizacion.nueva_codigo || polinizacion.madre_codigo} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Especie" value={polinizacion.nueva_especie || polinizacion.especie || polinizacion.madre_especie} colors={colors} full />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Clima" value={polinizacion.nueva_clima || polinizacion.madre_clima} colors={colors} />
                  </FieldRow>
                </SectionCard>

                {/* Fechas */}
                <SectionCard icon="calendar-outline" title="Fechas" colors={colors}>
                  <FieldRow>
                    <Field label="Polinización" value={fmt(polinizacion.fechapol)} colors={colors} />
                    <Field label="Maduración" value={fmt(polinizacion.fechamad)} colors={colors} />
                  </FieldRow>
                  {polinizacion.prediccion_fecha_estimada && (
                    <FieldRow>
                      <Field label="Fecha Estimada (ML)" value={fmt(polinizacion.prediccion_fecha_estimada)} colors={colors} />
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Ubicación */}
                <SectionCard icon="location-outline" title="Ubicación" colors={colors}>
                  <FieldRow>
                    <Field label="Vivero" value={polinizacion.vivero} colors={colors} />
                    <Field label="Mesa" value={polinizacion.mesa} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Pared" value={polinizacion.pared} colors={colors} />
                    {polinizacion.ubicacion && <Field label="Ubicación General" value={polinizacion.ubicacion} colors={colors} />}
                  </FieldRow>
                </SectionCard>

                {/* Cantidades */}
                <SectionCard icon="layers-outline" title="Cantidades" colors={colors}>
                  <FieldRow>
                    <Field label="Cápsulas" value={polinizacion.cantidad_capsulas ?? 0} colors={colors} />
                    <Field label="Solicitada" value={polinizacion.cantidad_solicitada ?? 0} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Disponible" value={polinizacion.cantidad_disponible ?? 0} colors={colors} />
                  </FieldRow>
                </SectionCard>

                {/* Predicción ML */}
                {(polinizacion.dias_maduracion_predichos || polinizacion.metodo_prediccion) && (
                  <SectionCard icon="analytics-outline" title="Predicción de Maduración" colors={colors}>
                    <FieldRow>
                      <Field
                        label="Días Predichos"
                        value={polinizacion.dias_maduracion_predichos ? `${polinizacion.dias_maduracion_predichos} días` : undefined}
                        colors={colors}
                      />
                      <Field
                        label="Confianza"
                        value={polinizacion.confianza_prediccion ? `${polinizacion.confianza_prediccion}%` : undefined}
                        colors={colors}
                      />
                    </FieldRow>
                    <FieldRow>
                      <Field
                        label="Fecha Estimada"
                        value={fmt(polinizacion.fecha_maduracion_predicha || polinizacion.prediccion_fecha_estimada)}
                        colors={colors}
                      />
                      <Field label="Método" value={polinizacion.metodo_prediccion} colors={colors} />
                    </FieldRow>
                  </SectionCard>
                )}

                {/* Información Adicional */}
                <SectionCard icon="information-circle-outline" title="Información Adicional" colors={colors}>
                  <FieldRow>
                    <Field
                      label="Responsable"
                      value={typeof polinizacion.responsable === 'string' ? polinizacion.responsable : polinizacion.responsable?.username}
                      colors={colors}
                    />
                  </FieldRow>
                  {polinizacion.observaciones && (
                    <FieldRow>
                      <Field label="Observaciones" value={polinizacion.observaciones} full colors={colors} />
                    </FieldRow>
                  )}
                </SectionCard>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[localStyles.footer, { borderTopColor: colors.border?.default || '#E5E7EB', backgroundColor: colors.background.primary }]}>
            <TouchableOpacity
              style={[localStyles.closeButton, { backgroundColor: colors.primary.main }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={localStyles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  topStripLeft: {
    flex: 1,
  },
  topStripRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  codigoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 10,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionBody: {
    padding: 12,
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  fieldFull: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

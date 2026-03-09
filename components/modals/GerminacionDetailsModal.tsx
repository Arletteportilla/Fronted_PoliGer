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
import type { Germinacion } from '@/types/index';

export interface GerminacionDetailsModalProps {
  visible: boolean;
  germinacion: Germinacion | null;
  onClose: () => void;
  onCambiarEtapa?: (id: number, etapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO', fecha?: string) => Promise<void>;
  onOpenFinalizar?: (germinacion: Germinacion) => void;
}

const ESTADO_COLORS: Record<string, string> = {
  INGRESADO: '#6B7280',
  EN_PROCESO: '#F59E0B',
  COMPLETADO: '#10B981',
  FINALIZADO: '#10B981',
  CANCELADO: '#EF4444',
};

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

function Field({ label, value, full, colors }: { label: string; value?: string | number | null | boolean; full?: boolean; colors: ReturnType<typeof useTheme>['colors'] }) {
  let display: string;
  if (value === undefined || value === null || value === '') {
    display = '—';
  } else if (typeof value === 'boolean') {
    display = value ? 'Sí' : 'No';
  } else {
    display = String(value);
  }
  return (
    <View style={[localStyles.field, full && localStyles.fieldFull]}>
      <Text style={[localStyles.fieldLabel, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[localStyles.fieldValue, { color: colors.text.primary }]} numberOfLines={full ? undefined : 2}>
        {display}
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

export function GerminacionDetailsModal({
  visible,
  germinacion,
  onClose,
}: GerminacionDetailsModalProps) {
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
              <Ionicons name="flask-outline" size={20} color={colors.primary.main} style={{ marginRight: 8 }} />
              <Text style={[localStyles.headerTitle, { color: colors.text.primary }]}>Detalles de Germinación</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={localStyles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Top info strip */}
          {germinacion && (
            <View style={[localStyles.topStrip, { backgroundColor: colors.background.tertiary || colors.background.secondary }]}>
              <View style={localStyles.topStripLeft}>
                <Text style={[localStyles.codigoLabel, { color: colors.text.secondary }]}>Código</Text>
                <Text style={[localStyles.codigoValue, { color: colors.text.primary }]}>{germinacion.codigo || '—'}</Text>
              </View>
              <View style={localStyles.topStripRight}>
                <Badge
                  label={germinacion.etapa_actual || germinacion.estado_capsula || 'INGRESADO'}
                  color={getEstadoColor(germinacion.etapa_actual || germinacion.estado_capsula || 'INGRESADO')}
                />
              </View>
            </View>
          )}

          <ScrollView
            style={localStyles.scrollView}
            contentContainerStyle={localStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {germinacion && (
              <>
                {/* Información Botánica */}
                <SectionCard icon="leaf-outline" title="Información Botánica" colors={colors}>
                  <FieldRow>
                    <Field label="Género" value={germinacion.genero} colors={colors} />
                    <Field label="Clima" value={germinacion.clima} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Especie / Variedad" value={germinacion.especie_variedad} full colors={colors} />
                  </FieldRow>
                  {germinacion.tipo_polinizacion && (
                    <FieldRow>
                      <Field label="Tipo Polinización" value={germinacion.tipo_polinizacion} colors={colors} />
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Fechas */}
                <SectionCard icon="calendar-outline" title="Fechas" colors={colors}>
                  <FieldRow>
                    <Field label="Siembra" value={fmt(germinacion.fecha_siembra)} colors={colors} />
                    {germinacion.fecha_polinizacion && (
                      <Field label="Polinización" value={fmt(germinacion.fecha_polinizacion)} colors={colors} />
                    )}
                  </FieldRow>
                  {germinacion.prediccion_fecha_estimada && (
                    <FieldRow>
                      <Field label="Predicción (ML)" value={fmt(germinacion.prediccion_fecha_estimada)} colors={colors} />
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Ubicación */}
                <SectionCard icon="location-outline" title="Ubicación" colors={colors}>
                  <FieldRow>
                    {germinacion.percha && <Field label="Percha" value={germinacion.percha} colors={colors} />}
                    {germinacion.nivel && <Field label="Nivel" value={germinacion.nivel} colors={colors} />}
                  </FieldRow>
                  {germinacion.clima_lab && (
                    <FieldRow>
                      <Field label="Clima Laboratorio" value={germinacion.clima_lab} colors={colors} />
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Cantidades */}
                <SectionCard icon="layers-outline" title="Cantidades" colors={colors}>
                  <FieldRow>
                    <Field label="Solicitada" value={germinacion.cantidad_solicitada ?? 0} colors={colors} />
                    <Field label="Núm. Cápsulas" value={germinacion.no_capsulas ?? 0} colors={colors} />
                  </FieldRow>
                  <FieldRow>
                    {germinacion.disponibles !== undefined && (
                      <Field label="Disponibles" value={germinacion.disponibles} colors={colors} />
                    )}
                    {germinacion.cantidad_semilla && (
                      <Field label="Cant. Semilla" value={germinacion.cantidad_semilla} colors={colors} />
                    )}
                  </FieldRow>
                </SectionCard>

                {/* Estado */}
                <SectionCard icon="checkmark-circle-outline" title="Estado" colors={colors}>
                  <FieldRow>
                    <Field label="Estado Cápsula" value={germinacion.estado_capsula} colors={colors} />
                    {germinacion.estado_semilla && (
                      <Field label="Estado Semilla" value={germinacion.estado_semilla} colors={colors} />
                    )}
                  </FieldRow>
                  <FieldRow>
                    <Field label="Semilla en Stock" value={germinacion.semilla_en_stock} colors={colors} />
                    <Field label="Etapa Actual" value={germinacion.etapa_actual} colors={colors} />
                  </FieldRow>
                </SectionCard>

                {/* Información Adicional */}
                <SectionCard icon="information-circle-outline" title="Información Adicional" colors={colors}>
                  <FieldRow>
                    <Field label="Responsable" value={germinacion.responsable} colors={colors} />
                  </FieldRow>
                  {germinacion.observaciones && (
                    <FieldRow>
                      <Field label="Observaciones" value={germinacion.observaciones} full colors={colors} />
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

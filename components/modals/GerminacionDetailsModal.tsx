import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';
import type { Germinacion } from '@/types/index';

export interface GerminacionDetailsModalProps {
  visible: boolean;
  germinacion: Germinacion | null;
  onClose: () => void;
  onCambiarEtapa?: (id: number, etapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO', fecha?: string) => Promise<void>;
  onOpenFinalizar?: (germinacion: Germinacion) => void;
}

export function GerminacionDetailsModal({
  visible,
  germinacion,
  onClose,
  onCambiarEtapa,
  onOpenFinalizar
}: GerminacionDetailsModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleCambiarEtapa = (id: number, etapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO') => {
    if (onCambiarEtapa) {
      onCambiarEtapa(id, etapa);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Germinación</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {germinacion && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Código:</Text>
                  <Text style={styles.detailValue}>{germinacion.codigo || 'N/A'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Información Botánica</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Género:</Text>
                    <Text style={styles.detailValue}>{germinacion.genero || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Especie/Variedad:</Text>
                    <Text style={styles.detailValue}>{germinacion.especie_variedad || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Clima:</Text>
                    <Text style={styles.detailValue}>{germinacion.clima || 'N/A'}</Text>
                  </View>
                  {germinacion.tipo_polinizacion && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo Polinización:</Text>
                      <Text style={styles.detailValue}>{germinacion.tipo_polinizacion}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Fechas</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Siembra:</Text>
                    <Text style={styles.detailValue}>
                      {germinacion.fecha_siembra
                        ? new Date(germinacion.fecha_siembra).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </Text>
                  </View>
                  {germinacion.fecha_polinizacion && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Polinización:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(germinacion.fecha_polinizacion).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  )}
                  {germinacion.prediccion_fecha_estimada && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Predicción:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(germinacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ubicación</Text>
                  {germinacion.percha && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Percha:</Text>
                      <Text style={styles.detailValue}>{germinacion.percha}</Text>
                    </View>
                  )}
                  {germinacion.nivel && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nivel:</Text>
                      <Text style={styles.detailValue}>{germinacion.nivel}</Text>
                    </View>
                  )}
                  {germinacion.clima_lab && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Clima Lab:</Text>
                      <Text style={styles.detailValue}>{germinacion.clima_lab}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Cantidades</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cantidad Solicitada:</Text>
                    <Text style={styles.detailValue}>{germinacion.cantidad_solicitada || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Número de Cápsulas:</Text>
                    <Text style={styles.detailValue}>{germinacion.no_capsulas || 0}</Text>
                  </View>
                  {germinacion.disponibles !== undefined && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Disponibles:</Text>
                      <Text style={styles.detailValue}>{germinacion.disponibles}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Estado</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado Cápsula:</Text>
                    <Text style={styles.detailValue}>{germinacion.estado_capsula || 'N/A'}</Text>
                  </View>
                  {germinacion.estado_semilla && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado Semilla:</Text>
                      <Text style={styles.detailValue}>{germinacion.estado_semilla}</Text>
                    </View>
                  )}
                  {germinacion.cantidad_semilla && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cantidad Semilla:</Text>
                      <Text style={styles.detailValue}>{germinacion.cantidad_semilla}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Semilla en Stock:</Text>
                    <Text style={styles.detailValue}>{germinacion.semilla_en_stock ? 'Sí' : 'No'}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Información Adicional</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Responsable:</Text>
                    <Text style={styles.detailValue}>{germinacion.responsable || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Etapa Actual:</Text>
                    <Text style={styles.detailValue}>{germinacion.etapa_actual || 'N/A'}</Text>
                  </View>
                  {germinacion.observaciones && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Observaciones:</Text>
                      <Text style={styles.detailValue}>{germinacion.observaciones}</Text>
                    </View>
                  )}
                </View>

                {/* Sección de Gestión de Etapa */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Gestión de Etapa</Text>

                  {/* Estado actual con badge color */}
                  <View style={styles.estadoBadgeContainer}>
                    <Text style={styles.detailLabel}>Estado Actual:</Text>
                    <View style={[
                      styles.estadoBadge,
                      {
                        backgroundColor:
                          germinacion.estado_germinacion === 'FINALIZADO' ? '#D1FAE5' :
                            germinacion.estado_germinacion === 'EN_PROCESO' ? '#FEF3C7' :
                              '#E5E7EB'
                      }
                    ]}>
                      <Ionicons
                        name={
                          germinacion.estado_germinacion === 'FINALIZADO' ? 'checkmark-circle' :
                            germinacion.estado_germinacion === 'EN_PROCESO' ? 'time' :
                              'ellipse'
                        }
                        size={18}
                        color={
                          germinacion.estado_germinacion === 'FINALIZADO' ? '#059669' :
                            germinacion.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                              '#6B7280'
                        }
                      />
                      <Text style={[
                        styles.estadoBadgeText,
                        {
                          color:
                            germinacion.estado_germinacion === 'FINALIZADO' ? '#059669' :
                              germinacion.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                                '#6B7280'
                        }
                      ]}>
                        {germinacion.estado_germinacion === 'FINALIZADO' ? 'Finalizado' :
                          germinacion.estado_germinacion === 'EN_PROCESO' ? 'En Proceso' :
                            'Inicial'}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de cambio de estado */}
                  <View style={styles.etapaButtonsContainer}>
                    {germinacion.etapa_actual !== 'FINALIZADO' && (
                      <>
                        {(germinacion.etapa_actual === 'INGRESADO' || !germinacion.etapa_actual) && (
                          <TouchableOpacity
                            style={[styles.etapaButton, { backgroundColor: '#F59E0B' }]}
                            onPress={() => {
                              if (Platform.OS === 'web') {
                                if (confirm('¿Cambiar el estado a "En Proceso"?')) {
                                  handleCambiarEtapa(germinacion.id, 'EN_PROCESO');
                                }
                              } else {
                                Alert.alert(
                                  'Cambiar Estado',
                                  '¿Cambiar el estado a "En Proceso"?',
                                  [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                      text: 'Confirmar',
                                      onPress: () => handleCambiarEtapa(germinacion.id, 'EN_PROCESO')
                                    }
                                  ]
                                );
                              }
                            }}
                          >
                            <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.etapaButtonText}>Marcar como En Proceso</Text>
                          </TouchableOpacity>
                        )}

                        {germinacion.estado_germinacion === 'EN_PROCESO' && onOpenFinalizar && (
                          <TouchableOpacity
                            style={[styles.etapaButton, { backgroundColor: '#10B981' }]}
                            onPress={() => onOpenFinalizar(germinacion)}
                          >
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.etapaButtonText}>Finalizar Germinación</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}

                    {germinacion.etapa_actual === 'FINALIZADO' && (
                      <View style={styles.etapaCompletadaContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={styles.etapaCompletadaText}>
                          Germinación completada
                          {germinacion.fecha_germinacion &&
                            ` el ${new Date(germinacion.fecha_germinacion).toLocaleDateString('es-ES')}`
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

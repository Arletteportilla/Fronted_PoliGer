import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
}: GerminacionDetailsModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

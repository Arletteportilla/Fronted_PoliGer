import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/utils/Perfil/styles';
import type { Polinizacion } from '@/types/index';

export interface PolinizacionDetailsModalProps {
  visible: boolean;
  polinizacion: Polinizacion | null;
  onClose: () => void;
}

// Función auxiliar para color de tipo
const getTipoColor = (tipo: string): string => {
  const tipoLower = tipo?.toLowerCase() || '';
  if (tipoLower === 'self') return '#3B82F6';
  if (tipoLower === 'sibling') return '#8B5CF6';
  if (tipoLower === 'híbrida' || tipoLower === 'hibrida') return '#F59E0B';
  if (tipoLower === 'replante') return '#3b82f6';
  return '#3B82F6';
};

export function PolinizacionDetailsModal({
  visible,
  polinizacion,
  onClose
}: PolinizacionDetailsModalProps) {
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
            <Text style={styles.modalTitle}>Detalles de Polinización</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {polinizacion && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Código:</Text>
                  <Text style={styles.detailValue}>{polinizacion.codigo || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo:</Text>
                  <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(polinizacion.tipo_polinizacion || 'SELF') }]}>
                    <Text style={styles.tipoBadgeText}>{polinizacion.tipo_polinizacion || 'SELF'}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Planta Madre</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Género:</Text>
                    <Text style={styles.detailValue}>{polinizacion.madre_genero || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Especie:</Text>
                    <Text style={styles.detailValue}>{polinizacion.madre_especie || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{polinizacion.madre_codigo || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Clima:</Text>
                    <Text style={styles.detailValue}>{polinizacion.madre_clima || 'N/A'}</Text>
                  </View>
                </View>

                {polinizacion.tipo_polinizacion !== 'SELF' && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Planta Padre</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Género:</Text>
                      <Text style={styles.detailValue}>{polinizacion.padre_genero || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Especie:</Text>
                      <Text style={styles.detailValue}>{polinizacion.padre_especie || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Código:</Text>
                      <Text style={styles.detailValue}>{polinizacion.padre_codigo || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Clima:</Text>
                      <Text style={styles.detailValue}>{polinizacion.padre_clima || 'N/A'}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Nueva Planta</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Género:</Text>
                    <Text style={styles.detailValue}>{polinizacion.nueva_genero || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Especie:</Text>
                    <Text style={styles.detailValue}>{polinizacion.nueva_especie || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{polinizacion.nueva_codigo || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Clima:</Text>
                    <Text style={styles.detailValue}>{polinizacion.nueva_clima || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Fechas</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Polinización:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.fechapol
                        ? new Date(polinizacion.fechapol).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Maduración:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.fechamad
                        ? new Date(polinizacion.fechamad).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </Text>
                  </View>
                  {polinizacion.prediccion_fecha_estimada && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Predicción:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(polinizacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ubicación</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tipo:</Text>
                    <Text style={styles.detailValue}>{polinizacion.ubicacion_tipo || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nombre:</Text>
                    <Text style={styles.detailValue}>{polinizacion.ubicacion_nombre || 'N/A'}</Text>
                  </View>
                  {polinizacion.vivero && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vivero:</Text>
                      <Text style={styles.detailValue}>{polinizacion.vivero}</Text>
                    </View>
                  )}
                  {polinizacion.mesa && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mesa:</Text>
                      <Text style={styles.detailValue}>{polinizacion.mesa}</Text>
                    </View>
                  )}
                  {polinizacion.pared && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pared:</Text>
                      <Text style={styles.detailValue}>{polinizacion.pared}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Información Adicional</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cápsulas:</Text>
                    <Text style={styles.detailValue}>{polinizacion.cantidad_capsulas || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={styles.detailValue}>{polinizacion.estado || 'INGRESADO'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Responsable:</Text>
                    <Text style={styles.detailValue}>{polinizacion.responsable || 'N/A'}</Text>
                  </View>
                  {polinizacion.observaciones && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Observaciones:</Text>
                      <Text style={styles.detailValue}>{polinizacion.observaciones}</Text>
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

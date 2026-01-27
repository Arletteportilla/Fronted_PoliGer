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
                  <Text style={styles.sectionTitle}>Información General</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Género:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.nueva_genero || polinizacion.genero || polinizacion.madre_genero || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Especie:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.nueva_especie || polinizacion.especie || polinizacion.madre_especie || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.nueva_codigo || polinizacion.codigo || polinizacion.madre_codigo || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Clima:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.nueva_clima || polinizacion.madre_clima || 'N/A'}
                    </Text>
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
                    <Text style={styles.detailLabel}>Vivero:</Text>
                    <Text style={styles.detailValue}>{polinizacion.vivero || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mesa:</Text>
                    <Text style={styles.detailValue}>{polinizacion.mesa || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pared:</Text>
                    <Text style={styles.detailValue}>{polinizacion.pared || 'N/A'}</Text>
                  </View>
                  {polinizacion.ubicacion && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ubicación General:</Text>
                      <Text style={styles.detailValue}>{polinizacion.ubicacion}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Predicción de Maduración</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Días Predichos:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.dias_maduracion_predichos
                        ? `${polinizacion.dias_maduracion_predichos} días`
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha Estimada:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.fecha_maduracion_predicha
                        ? new Date(polinizacion.fecha_maduracion_predicha).toLocaleDateString('es-ES')
                        : polinizacion.prediccion_fecha_estimada
                        ? new Date(polinizacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Método:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.metodo_prediccion || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Confianza:</Text>
                    <Text style={styles.detailValue}>
                      {polinizacion.confianza_prediccion
                        ? `${polinizacion.confianza_prediccion}%`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Cantidades</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cápsulas:</Text>
                    <Text style={styles.detailValue}>{polinizacion.cantidad_capsulas || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cantidad Solicitada:</Text>
                    <Text style={styles.detailValue}>{polinizacion.cantidad_solicitada || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cantidad Disponible:</Text>
                    <Text style={styles.detailValue}>{polinizacion.cantidad_disponible || 0}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Información Adicional</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={styles.detailValue}>{polinizacion.estado || 'INGRESADO'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Responsable:</Text>
                    <Text style={styles.detailValue}>
                      {typeof polinizacion.responsable === 'string'
                        ? polinizacion.responsable
                        : polinizacion.responsable?.username || 'N/A'}
                    </Text>
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

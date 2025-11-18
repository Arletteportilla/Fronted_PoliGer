import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PrediccionPolinizacionData {
  dias_estimados: number;
  fecha_estimada_semillas?: string;
  confianza: number;
  tipo_prediccion: string;
  especie_info: {
    especie: string;
    tipo: string;
    clima_usado?: string;
    ubicacion_usada?: string;
    metodo: string;
    factores_considerados: string[];
  };
  parametros_usados: {
    especie: string;
    clima?: string;
    ubicacion?: string;
  };
}

interface PrediccionPolinizacionModalProps {
  visible: boolean;
  onClose: () => void;
  onAceptar: () => void;
  prediccionData: PrediccionPolinizacionData | null;
  loading: boolean;
  error: string | null;
}

export const PrediccionPolinizacionModal: React.FC<PrediccionPolinizacionModalProps> = ({
  visible,
  onClose,
  onAceptar,
  prediccionData,
  loading,
  error
}) => {
  const getConfianzaColor = (confianza: number) => {
    if (confianza >= 80) return '#28a745';
    if (confianza >= 60) return '#ffc107';
    return '#fd7e14';
  };

  const getConfianzaNivel = (confianza: number) => {
    if (confianza >= 80) return 'ALTA';
    if (confianza >= 60) return 'MEDIA';
    return 'BAJA';
  };

  const getConfianzaIcon = (confianza: number) => {
    if (confianza >= 80) return 'shield-checkmark';
    if (confianza >= 60) return 'shield-half';
    return 'shield-outline';
  };

  const getClimaDescripcion = (clima?: string): string => {
    const descripciones: Record<string, string> = {
      'I': 'Intermedio',
      'IW': 'Intermedio Caliente',
      'IC': 'Intermedio Frío',
      'W': 'Caliente',
      'C': 'Frío'
    };
    return descripciones[clima || 'I'] || 'Desconocido';
  };

  const formatearFecha = (fecha?: string): string => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
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
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="analytics" size={24} color="#e9ad14" />
              <Text style={styles.headerTitle}>Predicción de Polinización</Text>
              {prediccionData && (
                <View style={styles.metodoBadge}>
                  <Ionicons name="calculator" size={12} color="#fff" />
                  <Text style={styles.metodoText}>
                    {prediccionData.especie_info?.metodo === 'prediccion heuristica' ? 'Heurístico' : 'ML'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={48} color="#e9ad14" />
                <Text style={styles.loadingText}>Calculando predicción...</Text>
                <Text style={styles.loadingSubtext}>
                  Analizando datos de polinización
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
                <Text style={styles.errorText}>Error en la Predicción</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {prediccionData && !loading && !error && (
              <>
                {/* Resultado Principal */}
                <LinearGradient
                  colors={['#182d49', '#1a3654']}
                  style={styles.resultCard}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.fechaPrincipal}>
                      <Text style={styles.fechaLabel}>Tiempo estimado hasta semillas</Text>
                      <Text style={styles.diasEstimados}>
                        {prediccionData.dias_estimados || 0} días
                      </Text>
                      {prediccionData.fecha_estimada_semillas && (
                        <Text style={styles.fechaEstimada}>
                          {formatearFecha(prediccionData.fecha_estimada_semillas)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text style={styles.tipoPrediccion}>
                    Tipo: {prediccionData.tipo_prediccion || 'inicial'}
                  </Text>
                </LinearGradient>

                {/* Indicador Visual de Confianza */}
                <View style={styles.confianzaCard}>
                  <View style={styles.confianzaHeader}>
                    <Ionicons
                      name={getConfianzaIcon(prediccionData.confianza || 0)}
                      size={24}
                      color={getConfianzaColor(prediccionData.confianza || 0)}
                    />
                    <View style={styles.confianzaInfo}>
                      <Text style={styles.confianzaTitle}>
                        Nivel de Confianza: {getConfianzaNivel(prediccionData.confianza || 0)}
                      </Text>
                      <Text style={styles.confianzaDescripcion}>
                        {prediccionData.confianza >= 80 && 'Predicción muy confiable basada en datos históricos'}
                        {prediccionData.confianza >= 60 && prediccionData.confianza < 80 && 'Predicción moderada, considere factores adicionales'}
                        {prediccionData.confianza < 60 && 'Predicción estimativa, faltan datos específicos'}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de Confianza */}
                  <View style={styles.confianzaBarContainer}>
                    <View style={styles.confianzaBar}>
                      <View
                        style={[
                          styles.confianzaFill,
                          {
                            width: `${prediccionData.confianza || 0}%`,
                            backgroundColor: getConfianzaColor(prediccionData.confianza || 0)
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.confianzaPercentage}>
                      {prediccionData.confianza || 0}%
                    </Text>
                  </View>
                </View>

                {/* Parámetros Utilizados */}
                <View style={styles.parametrosCard}>
                  <Text style={styles.sectionTitle}>📊 Parámetros de Predicción</Text>
                  <View style={styles.parametrosList}>
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Especie:</Text>
                      <Text style={styles.parametroValue}>
                        {prediccionData.especie_info?.especie || prediccionData.parametros_usados?.especie || 'No especificado'}
                      </Text>
                    </View>
                    {prediccionData.especie_info?.clima_usado && (
                      <View style={styles.parametroRow}>
                        <Text style={styles.parametroLabel}>Clima:</Text>
                        <Text style={styles.parametroValue}>
                          {prediccionData.especie_info.clima_usado}
                          <Text style={styles.climaDescripcion}>
                            {' '}({getClimaDescripcion(prediccionData.especie_info.clima_usado)})
                          </Text>
                        </Text>
                      </View>
                    )}
                    {prediccionData.especie_info?.ubicacion_usada && (
                      <View style={styles.parametroRow}>
                        <Text style={styles.parametroLabel}>Ubicación:</Text>
                        <Text style={styles.parametroValue}>{prediccionData.especie_info.ubicacion_usada}</Text>
                      </View>
                    )}
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Método:</Text>
                      <Text style={styles.parametroValue}>{prediccionData.especie_info?.metodo || 'Heurístico'}</Text>
                    </View>
                  </View>
                </View>

                {/* Factores Considerados */}
                {prediccionData.especie_info?.factores_considerados && prediccionData.especie_info.factores_considerados.length > 0 && (
                  <View style={styles.factoresCard}>
                    <Text style={styles.sectionTitle}>✓ Factores Considerados</Text>
                    <View style={styles.factoresList}>
                      {prediccionData.especie_info.factores_considerados.map((factor, index) => (
                        <View key={index} style={styles.factorItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                          <Text style={styles.factorText}>{factor}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Recomendaciones */}
                <View style={styles.recomendacionesCard}>
                  <Text style={styles.sectionTitle}>💡 Recomendaciones</Text>
                  <View style={styles.recomendacionRow}>
                    <Text style={styles.recomendacionText}>
                      • Monitorear el desarrollo de las cápsulas regularmente
                    </Text>
                  </View>
                  <View style={styles.recomendacionRow}>
                    <Text style={styles.recomendacionText}>
                      • Mantener condiciones climáticas estables
                    </Text>
                  </View>
                  <View style={styles.recomendacionRow}>
                    <Text style={styles.recomendacionText}>
                      • Registrar la fecha real de maduración para mejorar futuras predicciones
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAceptar}>
              <Text style={styles.acceptButtonText}>Aceptar y Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#182d49',
    marginLeft: 12,
    flex: 1,
  },
  metodoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  metodoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#182d49',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fechaPrincipal: {
    alignItems: 'center',
  },
  fechaLabel: {
    fontSize: 14,
    color: '#e9ad14',
    fontWeight: '600',
    marginBottom: 12,
  },
  diasEstimados: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  fechaEstimada: {
    fontSize: 16,
    color: '#ccc',
  },
  tipoPrediccion: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  confianzaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confianzaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confianzaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  confianzaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 4,
  },
  confianzaDescripcion: {
    fontSize: 14,
    color: '#666',
  },
  confianzaBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confianzaBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 12,
  },
  confianzaFill: {
    height: '100%',
    borderRadius: 4,
  },
  confianzaPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
    minWidth: 40,
  },
  parametrosCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 12,
  },
  parametrosList: {
    gap: 8,
  },
  parametroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  parametroLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  parametroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182d49',
    flex: 2,
    textAlign: 'right',
  },
  climaDescripcion: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
  },
  factoresCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  factoresList: {
    gap: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#155724',
    textTransform: 'capitalize',
  },
  recomendacionesCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recomendacionRow: {
    marginBottom: 8,
  },
  recomendacionText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  acceptButton: {
    backgroundColor: '#e9ad14',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

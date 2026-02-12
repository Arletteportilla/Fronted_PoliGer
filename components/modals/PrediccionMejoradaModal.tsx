import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface PrediccionMejoradaData {
  prediccion: {
    dias_estimados: number;
    fecha_estimada: string;
    fecha_estimada_formatted: string;
    fecha_minima: string;
    fecha_minima_formatted: string;
    fecha_maxima: string;
    fecha_maxima_formatted: string;
    rango_dias: number;
    confianza: number;
    nivel_confianza: 'alta' | 'media' | 'baja';
    modelo_usado: 'ML' | 'HEURISTIC';
    dias_restantes: number;
    estado: string;
    mensaje_estado: string;
  };
  parametros_usados: {
    especie: string;
    genero: string;
    clima: string;
    fecha_siembra: string;
  };
  recomendaciones: string[];
  alertas_configuradas: boolean;
  rango_confianza: {
    descripcion: string;
    color: string;
    precision_esperada: string;
  };
}

interface PrediccionMejoradaModalProps {
  visible: boolean;
  onClose: () => void;
  onAceptar: () => void;
  prediccionData: PrediccionMejoradaData | null;
  loading: boolean;
  error: string | null;
}

export const PrediccionMejoradaModal: React.FC<PrediccionMejoradaModalProps> = ({
  visible,
  onClose,
  onAceptar,
  prediccionData,
  loading,
  error
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const getConfianzaColor = (nivel: string) => {
    switch (nivel) {
      case 'alta': return '#28a745';
      case 'media': return '#ffc107';
      case 'baja': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getConfianzaIcon = (nivel: string) => {
    switch (nivel) {
      case 'alta': return 'shield-checkmark';
      case 'media': return 'shield-half';
      case 'baja': return 'shield-outline';
      default: return 'help-circle-outline';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'hoy': return '#28a745';
      case 'muy_pronto': return '#17a2b8';
      case 'pronto': return '#ffc107';
      case 'vencida': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getModeloIcon = (modelo: string) => {
    return modelo === 'ML' ? 'bulb' : 'calculator';
  };

  const getModeloColor = (modelo: string) => {
    return modelo === 'ML' ? '#e9ad14' : '#6c757d';
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
              <Text style={styles.headerTitle}>Predicción Mejorada</Text>
              {prediccionData && (
                <View style={[styles.modeloBadge, { backgroundColor: getModeloColor(prediccionData.prediccion?.modelo_usado || 'HEURISTIC') }]}>
                  <Ionicons 
                    name={getModeloIcon(prediccionData.prediccion?.modelo_usado || 'HEURISTIC')} 
                    size={12} 
                    color="#fff" 
                  />
                  <Text style={styles.modeloText}>
                    {(prediccionData.prediccion?.modelo_usado || 'HEURISTIC') === 'ML' ? 'ML' : 'Heurístico'}
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
                <Text style={styles.loadingText}>Calculando predicción mejorada...</Text>
                <Text style={styles.loadingSubtext}>
                  Analizando con modelo germinacion.bin
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
                {/* Resultado Principal con Rango de Fechas */}
                <LinearGradient
                  colors={['#182d49', '#1a3654']}
                  style={styles.resultCard}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.fechaPrincipal}>
                      <Text style={styles.fechaLabel}>Fecha más probable</Text>
                      <Text style={styles.fechaEstimada}>
                        {prediccionData.prediccion?.fecha_estimada_formatted || 'Fecha no disponible'}
                      </Text>
                      <Text style={styles.diasEstimados}>
                        {prediccionData.prediccion?.dias_estimados || 0} días estimados
                      </Text>
                    </View>
                  </View>

                  {/* Estado de la Predicción */}
                  <Text
                    style={[
                      styles.mensajeEstado,
                      { color: getEstadoColor(prediccionData.prediccion?.estado || 'desconocido') }
                    ]}
                  >
                    {prediccionData.prediccion?.mensaje_estado || 'Estado no disponible'}
                  </Text>
                </LinearGradient>

                {/* Indicador Visual de Confianza */}
                <View style={styles.confianzaCard}>
                  <View style={styles.confianzaHeader}>
                    <Ionicons 
                      name={getConfianzaIcon(prediccionData.prediccion?.nivel_confianza || 'baja')} 
                      size={24} 
                      color={getConfianzaColor(prediccionData.prediccion?.nivel_confianza || 'baja')} 
                    />
                    <View style={styles.confianzaInfo}>
                      <Text style={styles.confianzaTitle}>
                        Nivel de Confianza: {(prediccionData.prediccion?.nivel_confianza || 'baja').toUpperCase()}
                      </Text>
                      <Text style={styles.confianzaDescripcion}>
                        {prediccionData.rango_confianza?.descripcion || 'Descripción no disponible'}
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
                            width: `${prediccionData.prediccion?.confianza || 0}%`,
                            backgroundColor: getConfianzaColor(prediccionData.prediccion?.nivel_confianza || 'baja')
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.confianzaPercentage}>
                      {prediccionData.prediccion?.confianza || 0}%
                    </Text>
                  </View>

                  <Text style={styles.precisionEsperada}>
                    Precisión esperada: {prediccionData.rango_confianza?.precision_esperada || 'No disponible'}
                  </Text>
                </View>

                {/* Parámetros Utilizados */}
                <View style={styles.parametrosCard}>
                  <Text style={styles.sectionTitle}>📊 Parámetros de Predicción</Text>
                  <View style={styles.parametrosList}>
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Especie:</Text>
                      <Text style={styles.parametroValue}>{prediccionData.parametros_usados?.especie || 'No especificado'}</Text>
                    </View>
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Género:</Text>
                      <Text style={styles.parametroValue}>{prediccionData.parametros_usados?.genero || 'No especificado'}</Text>
                    </View>
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Clima:</Text>
                      <Text style={styles.parametroValue}>
                        {prediccionData.parametros_usados?.clima || 'No especificado'} 
                        <Text style={styles.climaDescripcion}>
                          {' '}({getClimaDescripcion(prediccionData.parametros_usados?.clima || 'I')})
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.parametroRow}>
                      <Text style={styles.parametroLabel}>Fecha siembra:</Text>
                      <Text style={styles.parametroValue}>
                        {prediccionData.parametros_usados?.fecha_siembra ? 
                          new Date(prediccionData.parametros_usados.fecha_siembra).toLocaleDateString('es-ES') : 
                          'No especificada'
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recomendaciones Específicas por Especie */}
                {prediccionData.recomendaciones && prediccionData.recomendaciones.length > 0 && (
                  <View style={styles.recomendacionesCard}>
                    <Text style={styles.sectionTitle}>💡 Recomendaciones Específicas</Text>
                    {prediccionData.recomendaciones.map((recomendacion, index) => (
                      <View key={index} style={styles.recomendacionRow}>
                        <Text style={styles.recomendacionText}>{recomendacion}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Alertas Configuradas */}
                {prediccionData.alertas_configuradas && (
                  <View style={styles.alertasCard}>
                    <View style={styles.alertasHeader}>
                      <Ionicons name="notifications" size={20} color="#17a2b8" />
                      <Text style={styles.alertasTitle}>Alertas Configuradas</Text>
                    </View>
                    <Text style={styles.alertasText}>
                      Se han configurado alertas automáticas para monitorear esta germinación
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAceptar}>
              <Text style={styles.acceptButtonText}>Aceptar y Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

};

// Función auxiliar para obtener descripción del clima
const getClimaDescripcion = (clima: string): string => {
  const descripciones = {
    'I': 'Intermedio',
    'IW': 'Intermedio Caliente', 
    'IC': 'Intermedio Frío',
    'W': 'Caliente',
    'C': 'Frío'
  };
  return descripciones[clima as keyof typeof descripciones] || 'Desconocido';
};
const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
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
    borderBottomColor: colors.border.default,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  modeloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  modeloText: {
    color: colors.text.inverse,
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
    color: colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
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
    color: colors.status.error,
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
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
    marginBottom: 20,
  },
  fechaPrincipal: {
    alignItems: 'center',
  },
  fechaLabel: {
    fontSize: 14,
    color: '#e9ad14',
    fontWeight: '600',
    marginBottom: 8,
  },
  fechaEstimada: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: 4,
  },
  diasEstimados: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  rangoFechas: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  rangoTitle: {
    fontSize: 14,
    color: '#e9ad14',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  rangoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fechaRango: {
    alignItems: 'center',
    flex: 1,
  },
  fechaRangoLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.7,
    marginBottom: 4,
  },
  fechaRangoValue: {
    fontSize: 16,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  fechaRangoSeparator: {
    paddingHorizontal: 16,
  },
  mensajeEstado: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confianzaCard: {
    backgroundColor: colors.background.secondary,
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
    color: colors.text.primary,
    marginBottom: 4,
  },
  confianzaDescripcion: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  confianzaBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confianzaBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border.light,
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
    color: colors.text.primary,
    minWidth: 40,
  },
  precisionEsperada: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  parametrosCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
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
    color: colors.text.secondary,
    flex: 1,
  },
  parametroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  climaDescripcion: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: 'normal',
  },
  recomendacionesCard: {
    backgroundColor: colors.status.successLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recomendacionRow: {
    marginBottom: 8,
  },
  recomendacionText: {
    fontSize: 14,
    color: colors.status.success,
    lineHeight: 20,
  },
  alertasCard: {
    backgroundColor: colors.status.infoLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.info,
    marginLeft: 8,
  },
  alertasText: {
    fontSize: 14,
    color: colors.status.info,
    lineHeight: 18,
  },
  modeloInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  modeloInfoText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
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
    color: colors.text.inverse,
  },
});
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { germinacionMLService } from '@/services/germinacion-ml.service';
import type { PrediccionGerminacionMLRequest, PrediccionGerminacionMLResponse } from '@/services/germinacion-ml.service';
import { logger } from '@/services/logger';

interface PrediccionMLGerminacionProps {
  formData: {
    fecha_siembra?: string;
    especie?: string;
    clima?: string;
    estado_capsula?: string;
    cantidad_solicitada?: number;
    no_capsulas?: number;
  };
  onPrediccionComplete?: (resultado: PrediccionGerminacionMLResponse) => void;
  disabled?: boolean;
}

export function PrediccionMLGerminacion({
  formData,
  onPrediccionComplete,
  disabled = false
}: PrediccionMLGerminacionProps) {
  const [loading, setLoading] = useState(false);
  const [prediccion, setPrediccion] = useState<PrediccionGerminacionMLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>('');

  const realizarPrediccion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos mínimos requeridos
      if (!formData.fecha_siembra) {
        throw new Error('Fecha de siembra es requerida');
      }
      if (!formData.especie) {
        throw new Error('Especie es requerida');
      }
      if (!formData.clima) {
        throw new Error('Clima es requerido');
      }
      if (!formData.estado_capsula) {
        throw new Error('Estado de cápsula es requerido');
      }

      // Preparar request para la API ML
      const requestData: PrediccionGerminacionMLRequest = {
        fecha_siembra: formData.fecha_siembra,
        especie: formData.especie,
        clima: germinacionMLService.normalizarClima(formData.clima),
        estado_capsula: germinacionMLService.normalizarEstadoCapsula(formData.estado_capsula),
        s_stock: formData.cantidad_solicitada || 0,
        c_solic: formData.no_capsulas || 0,
        dispone: 0 // Default
      };

      // Crear firma única de la request para evitar duplicados
      const requestSignature = JSON.stringify(requestData);

      // Si es la misma request que la anterior, no hacer nada
      if (requestSignature === lastRequestRef.current) {
        return;
      }

      lastRequestRef.current = requestSignature;

      logger.info('🤖 Solicitando predicción ML automática de germinación:', requestData);

      const resultado = await germinacionMLService.predecir(requestData);

      logger.success(' Predicción ML de germinación recibida:', resultado);

      setPrediccion(resultado);

      if (onPrediccionComplete) {
        onPrediccionComplete(resultado);
      }

    } catch (err: any) {
      logger.error('❌ Error en predicción ML de germinación:', err);

      let mensajeError = 'Error al realizar la predicción ML de germinación';

      if (err.code === 'INVALID_INPUT') {
        mensajeError = err.message;
      } else if (err.code === 'UNAUTHORIZED') {
        mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (err.code === 'FORBIDDEN') {
        mensajeError = 'No tienes permisos para realizar predicciones de germinación';
      } else if (err.code === 'MODEL_NOT_LOADED') {
        mensajeError = 'El modelo ML de germinación no está disponible temporalmente';
      } else if (err.code === 'NETWORK_ERROR') {
        mensajeError = 'Error de conexión. Verifica tu internet.';
      } else if (err.code === 'TIMEOUT') {
        mensajeError = 'La predicción tardó demasiado. Intenta de nuevo.';
      } else if (err.message) {
        mensajeError = err.message;
      }

      setError(mensajeError);

    } finally {
      setLoading(false);
    }
  };

  // Efecto para realizar predicción automática cuando los datos estén completos
  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Verificar si tenemos los datos mínimos necesarios
    const tienesDatosMinimos = !!(
      formData.fecha_siembra &&
      formData.especie &&
      formData.clima &&
      formData.estado_capsula
    );

    if (tienesDatosMinimos && !disabled) {
      // Debounce de 800ms para evitar múltiples llamadas mientras el usuario escribe
      timeoutRef.current = setTimeout(() => {
        realizarPrediccion();
      }, 800);
    } else {
      // Si faltan datos, limpiar la predicción
      setPrediccion(null);
      setError(null);
      lastRequestRef.current = '';
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    formData.fecha_siembra,
    formData.especie,
    formData.clima,
    formData.estado_capsula,
    formData.cantidad_solicitada,
    formData.no_capsulas,
    disabled
  ]);

  const getNivelConfianza = (confianza?: number, nivelBackend?: string): 'alta' | 'media' | 'baja' => {
    // Si viene del backend, usarlo
    if (nivelBackend && (nivelBackend === 'alta' || nivelBackend === 'media' || nivelBackend === 'baja')) {
      return nivelBackend as 'alta' | 'media' | 'baja';
    }

    // Usar confianza por defecto si no viene
    const conf = confianza ?? 75;

    // Calcular basado en el porcentaje
    if (conf >= 85) return 'alta';
    if (conf >= 70) return 'media';
    return 'baja';
  };

  const getConfianzaColor = (nivel: 'alta' | 'media' | 'baja') => {
    return germinacionMLService.obtenerColorConfianza(nivel);
  };

  const calcularDiasRestantes = (fechaEstimada: string) => {
    return germinacionMLService.calcularDiasRestantes(fechaEstimada);
  };

  // Si no hay nada que mostrar, no renderizar nada
  if (!loading && !error && !prediccion) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Estado de carga */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4CAF50" size="small" />
          <Text style={styles.loadingText}>Calculando predicción ML de germinación...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Resultado de la predicción */}
      {prediccion && !loading && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.resultTitle}>Predicción de Germinación</Text>
          </View>

          {/* Días Estimados */}
          <View style={styles.mainResult}>
            <Text style={styles.mainResultLabel}>Días Estimados de Germinación</Text>
            <Text style={styles.mainResultValue}>{prediccion.dias_estimados} días</Text>
          </View>

          {/* Fechas */}
          <View style={styles.resultItem}>
            <View style={styles.resultItemIcon}>
              <Ionicons name="calendar" size={16} color="#666" />
            </View>
            <View style={styles.resultItemContent}>
              <Text style={styles.resultLabel}>Fecha de Siembra</Text>
              <Text style={styles.resultValue}>
                {germinacionMLService.formatearFecha(prediccion.fecha_siembra)}
              </Text>
            </View>
          </View>

          <View style={styles.resultItem}>
            <View style={styles.resultItemIcon}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
            </View>
            <View style={styles.resultItemContent}>
              <Text style={styles.resultLabel}>Fecha Estimada de Germinación</Text>
              <Text style={styles.resultValue}>
                {germinacionMLService.formatearFecha(prediccion.fecha_estimada_germinacion)}
              </Text>
            </View>
          </View>

          {/* Días Restantes */}
          <View style={styles.diasRestantes}>
            <Ionicons name="time" size={20} color="#2E7D32" />
            <Text style={styles.diasRestantesText}>
              {calcularDiasRestantes(prediccion.fecha_estimada_germinacion)} días restantes
            </Text>
          </View>

          {/* Confianza */}
          <View style={styles.confianzaContainer}>
            <View style={styles.confianzaHeader}>
              <Text style={styles.confianzaLabel}>Nivel de Confianza</Text>
              <View
                style={[
                  styles.confianzaBadge,
                  { backgroundColor: getConfianzaColor(getNivelConfianza(prediccion.confianza, prediccion.nivel_confianza)) }
                ]}
              >
                <Text style={styles.confianzaBadgeText}>
                  {prediccion.confianza ?? 75}% - {getNivelConfianza(prediccion.confianza, prediccion.nivel_confianza).toUpperCase()}
                </Text>
              </View>
            </View>

            {(prediccion.detalles.es_especie_nueva || getNivelConfianza(prediccion.confianza, prediccion.nivel_confianza) !== 'alta') && (
              <View style={styles.warningBox}>
                <Ionicons name="information-circle-outline" size={18} color="#FF9800" />
                <View style={styles.warningContent}>
                  {prediccion.detalles.es_especie_nueva && (
                    <Text style={styles.warningText}>
                      Especie no vista en entrenamiento (agrupada como "OTRAS")
                    </Text>
                  )}
                  <Text style={styles.warningExplanation}>
                    {germinacionMLService.obtenerExplicacionConfianza(
                      prediccion.confianza ?? 75,
                      prediccion.detalles.es_especie_nueva
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Detalles de entrada */}
          <View style={styles.detallesContainer}>
            <Text style={styles.detallesTitle}>Parámetros de Entrada</Text>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Especie:</Text>
              <Text style={styles.detalleValue}>{prediccion.detalles.especie_original}</Text>
            </View>
            {prediccion.detalles.es_especie_nueva && (
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>Agrupada como:</Text>
                <Text style={styles.detalleValue}>{prediccion.detalles.especie_agrupada}</Text>
              </View>
            )}
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Clima:</Text>
              <Text style={styles.detalleValue}>{prediccion.detalles.clima}</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Estado Cápsula:</Text>
              <Text style={styles.detalleValue}>{prediccion.detalles.estado_capsula}</Text>
            </View>
          </View>

          {/* Información del Modelo */}
          <View style={styles.modelInfo}>
            <Text style={styles.modelInfoTitle}>Información del Modelo</Text>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>Algoritmo:</Text>
              <Text style={styles.modelInfoValue}>{prediccion.modelo}</Text>
            </View>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>Features generadas:</Text>
              <Text style={styles.modelInfoValue}>{prediccion.detalles.features_generadas}</Text>
            </View>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>R² Score:</Text>
              <Text style={styles.modelInfoValue}>~85%</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#F44336',
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },
  resultContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  mainResult: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  mainResultLabel: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 4,
  },
  mainResultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultItemIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  resultItemContent: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  diasRestantes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  diasRestantesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 8,
  },
  confianzaContainer: {
    marginTop: 16,
  },
  confianzaHeader: {
    marginBottom: 8,
  },
  confianzaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  confianzaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  confianzaBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningContent: {
    flex: 1,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningExplanation: {
    fontSize: 11,
    color: '#856404',
    lineHeight: 16,
  },
  detallesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detallesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detalleLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detalleValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modelInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modelInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modelInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modelInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  modelInfoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { polinizacionMLService } from '@/services/polinizacion-ml.service';
import type { PrediccionMLRequest, PrediccionMLResponse } from '@/services/polinizacion-ml.service';
import { logger } from '@/services/logger';

interface PrediccionMLPolinizacionProps {
  formData: {
    fecha_polinizacion?: string;
    madre_genero?: string;
    madre_especie?: string;
    ubicacion_nombre?: string;
    responsable?: string;
    tipo_polinizacion?: string;
    cantidad_capsulas?: number;
    cantidad?: number;
    vivero?: string;
    mesa?: string;
    pared?: string;
  };
  onPrediccionComplete?: (resultado: PrediccionMLResponse) => void;
  disabled?: boolean;
}

export function PrediccionMLPolinizacion({
  formData,
  onPrediccionComplete,
  disabled = false
}: PrediccionMLPolinizacionProps) {
  const [loading, setLoading] = useState(false);
  const [prediccion, setPrediccion] = useState<PrediccionMLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>('');

  const realizarPrediccion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos mínimos requeridos
      if (!formData.fecha_polinizacion) {
        throw new Error('Fecha de polinización es requerida');
      }
      if (!formData.madre_genero) {
        throw new Error('Género de la madre es requerido');
      }
      if (!formData.madre_especie) {
        throw new Error('Especie de la madre es requerida');
      }

      // Construir ubicación
      let ubicacion = formData.ubicacion_nombre || '';
      if (formData.vivero) {
        ubicacion = formData.vivero;
        if (formData.mesa) ubicacion += ` - ${formData.mesa}`;
        if (formData.pared) ubicacion += ` - ${formData.pared}`;
      }

      // Preparar request para la API ML
      const requestData: PrediccionMLRequest = {
        fechapol: formData.fecha_polinizacion,
        genero: formData.madre_genero,
        especie: formData.madre_especie,
        ubicacion: ubicacion || 'No especificada',
        responsable: formData.responsable || 'Usuario',
        Tipo: formData.tipo_polinizacion || 'SELF',
        cantidad: formData.cantidad_capsulas || formData.cantidad || 1,
        disponible: 1
      };

      // Crear firma única de la request para evitar duplicados
      const requestSignature = JSON.stringify(requestData);

      // Si es la misma request que la anterior, no hacer nada
      if (requestSignature === lastRequestRef.current) {
        return;
      }

      lastRequestRef.current = requestSignature;

      const resultado = await polinizacionMLService.predecir(requestData);

      setPrediccion(resultado);

      if (onPrediccionComplete) {
        onPrediccionComplete(resultado);
      }

    } catch (err: any) {
      logger.error('❌ Error en predicción ML:', err);

      let mensajeError = 'Error al realizar la predicción ML';

      if (err.code === 'INVALID_INPUT') {
        mensajeError = err.message;
      } else if (err.code === 'UNAUTHORIZED') {
        mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (err.code === 'FORBIDDEN') {
        mensajeError = 'No tienes permisos para realizar predicciones';
      } else if (err.code === 'MODEL_NOT_LOADED') {
        mensajeError = 'El modelo ML no está disponible temporalmente';
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
      formData.fecha_polinizacion &&
      formData.madre_genero &&
      formData.madre_especie
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
    formData.fecha_polinizacion,
    formData.madre_genero,
    formData.madre_especie,
    formData.ubicacion_nombre,
    formData.responsable,
    formData.tipo_polinizacion,
    formData.cantidad_capsulas,
    formData.cantidad,
    formData.vivero,
    formData.mesa,
    formData.pared,
    disabled
  ]);

  const calcularDiasRestantes = (fechaEstimada: string) => {
    return polinizacionMLService.calcularDiasRestantes(fechaEstimada);
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
          <ActivityIndicator color="#2196F3" size="small" />
          <Text style={styles.loadingText}>Calculando predicción ML...</Text>
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
            <Text style={styles.resultTitle}>Resultado de la Predicción</Text>
          </View>

          {/* Días Estimados */}
          <View style={styles.mainResult}>
            <Text style={styles.mainResultLabel}>Días Estimados</Text>
            <Text style={styles.mainResultValue}>{prediccion.dias_estimados} días</Text>
          </View>

          {/* Fechas */}
          <View style={styles.resultItem}>
            <View style={styles.resultItemIcon}>
              <Ionicons name="calendar" size={16} color="#666" />
            </View>
            <View style={styles.resultItemContent}>
              <Text style={styles.resultLabel}>Fecha de Polinización</Text>
              <Text style={styles.resultValue}>
                {polinizacionMLService.formatearFecha(prediccion.fecha_polinizacion)}
              </Text>
            </View>
          </View>

          <View style={styles.resultItem}>
            <View style={styles.resultItemIcon}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
            </View>
            <View style={styles.resultItemContent}>
              <Text style={styles.resultLabel}>Fecha Estimada de Maduración</Text>
              <Text style={styles.resultValue}>
                {polinizacionMLService.formatearFecha(prediccion.fecha_estimada_maduracion)}
              </Text>
            </View>
          </View>

          {/* Días Restantes */}
          <View style={styles.diasRestantes}>
            <Ionicons name="time" size={20} color="#1976D2" />
            <Text style={styles.diasRestantesText}>
              {calcularDiasRestantes(prediccion.fecha_estimada_maduracion)} días restantes
            </Text>
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
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#1976D2',
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
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  mainResultLabel: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 4,
  },
  mainResultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
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
});

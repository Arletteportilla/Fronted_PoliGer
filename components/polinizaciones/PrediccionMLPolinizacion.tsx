import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { polinizacionMLService } from '@/services/polinizacion-ml.service';
import type { PrediccionMLRequest, PrediccionMLResponse } from '@/services/polinizacion-ml.service';
import { logger } from '@/services/logger';
import { useTheme } from '@/contexts/ThemeContext';
import { STATUS } from '@/utils/colors';

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

const calcularDiasRestantes = (fechaEstimada: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaEstimada);
  fecha.setHours(0, 0, 0, 0);
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

const calcularDiasTranscurridos = (fechaInicio: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);
  return Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
};

export function PrediccionMLPolinizacion({
  formData,
  onPrediccionComplete,
  disabled = false
}: PrediccionMLPolinizacionProps) {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [loading, setLoading] = useState(false);
  const [prediccion, setPrediccion] = useState<PrediccionMLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestRef = useRef<string>('');

  const realizarPrediccion = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.fecha_polinizacion) throw new Error('Fecha de polinización es requerida');
      if (!formData.madre_genero) throw new Error('Género de la madre es requerido');
      if (!formData.madre_especie) throw new Error('Especie de la madre es requerida');

      let ubicacion = formData.ubicacion_nombre || '';
      if (formData.vivero) {
        ubicacion = formData.vivero;
        if (formData.mesa) ubicacion += ` - ${formData.mesa}`;
        if (formData.pared) ubicacion += ` - ${formData.pared}`;
      }

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

      const requestSignature = JSON.stringify(requestData);
      if (requestSignature === lastRequestRef.current) return;
      lastRequestRef.current = requestSignature;

      const resultado = await polinizacionMLService.predecir(requestData);
      setPrediccion(resultado);
      if (onPrediccionComplete) onPrediccionComplete(resultado);

    } catch (err: any) {
      logger.error(' Error en predicción ML:', err);
      let mensajeError = 'Error al realizar la predicción ML';
      if (err.code === 'INVALID_INPUT') mensajeError = err.message;
      else if (err.code === 'UNAUTHORIZED') mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      else if (err.code === 'FORBIDDEN') mensajeError = 'No tienes permisos para realizar predicciones';
      else if (err.code === 'MODEL_NOT_LOADED') mensajeError = 'El modelo ML no está disponible temporalmente';
      else if (err.code === 'NETWORK_ERROR') mensajeError = 'Error de conexión. Verifica tu internet.';
      else if (err.code === 'TIMEOUT') mensajeError = 'La predicción tardó demasiado. Intenta de nuevo.';
      else if (err.message) mensajeError = err.message;
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const tienesDatosMinimos = !!(
      formData.fecha_polinizacion &&
      formData.madre_genero &&
      formData.madre_especie
    );

    if (tienesDatosMinimos && !disabled) {
      timeoutRef.current = setTimeout(() => { realizarPrediccion(); }, 800);
    } else {
      setPrediccion(null);
      setError(null);
      lastRequestRef.current = '';
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
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

  if (!loading && !error && !prediccion) return null;

  return (
    <View>
      {loading && (
        <View style={styles.prediccionLoading}>
          <ActivityIndicator size="small" color="#e9ad14" />
          <Text style={styles.prediccionLoadingText}>Calculando predicción...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color={themeColors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {prediccion && !loading && (() => {
        const diasRestantes = calcularDiasRestantes(prediccion.fecha_estimada_maduracion);
        const diasTranscurridos = calcularDiasTranscurridos(prediccion.fecha_polinizacion);
        const diasTotales = prediccion.dias_estimados || 182;
        const progreso = Math.min(Math.max((diasTranscurridos / diasTotales) * 100, 0), 100);

        return (
          <View style={styles.prediccionCard}>
            {/* Header con fecha */}
            <View style={styles.prediccionHeader}>
              <Ionicons name="calendar" size={24} color="#182d49" />
              <Text style={styles.prediccionTitle}>Fecha Estimada de Maduración</Text>
            </View>
            <Text style={styles.prediccionFecha}>
              {new Date(prediccion.fecha_estimada_maduracion).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>

            {/* Badge días restantes */}
            <View style={styles.diasFaltantesContainer}>
              <View style={[
                styles.diasFaltantesBadge,
                {
                  backgroundColor: diasRestantes < 0 ? '#FEE2E2'
                    : diasRestantes === 0 ? STATUS.successLight
                    : diasRestantes <= 14 ? '#FEF3C7'
                    : '#DBEAFE',
                }
              ]}>
                <Ionicons
                  name={diasRestantes < 0 ? 'alert-circle' : diasRestantes === 0 ? 'checkmark-circle' : diasRestantes <= 14 ? 'time' : 'hourglass'}
                  size={20}
                  color={diasRestantes < 0 ? '#EF4444' : diasRestantes === 0 ? STATUS.success : diasRestantes <= 14 ? '#F59E0B' : '#182d49'}
                />
                <Text style={[
                  styles.diasFaltantesText,
                  { color: diasRestantes < 0 ? '#EF4444' : diasRestantes === 0 ? STATUS.success : diasRestantes <= 14 ? '#F59E0B' : '#182d49' }
                ]}>
                  {diasRestantes < 0
                    ? `Vencida hace ${Math.abs(diasRestantes)} días`
                    : diasRestantes === 0
                    ? '¡Hoy es el día estimado!'
                    : `Faltan ${diasRestantes} días`}
                </Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progresoContainer}>
              <View style={styles.progresoHeader}>
                <Ionicons name="trending-up" size={16} color="#6B7280" />
                <Text style={styles.progresoLabel}>Progreso del ciclo:</Text>
                <Text style={styles.progresoTexto}>
                  {diasTranscurridos} de {diasTotales} días ({Math.round(progreso)}%)
                </Text>
              </View>
              <View style={styles.progresoBarContainer}>
                <View style={[
                  styles.progresoBarFill,
                  {
                    width: `${progreso}%`,
                    backgroundColor: progreso >= 100 ? STATUS.success : progreso >= 75 ? '#F59E0B' : progreso >= 50 ? '#182d49' : '#6B7280',
                  }
                ]} />
              </View>
            </View>

            {/* Info filas */}
            <View style={styles.prediccionInfo}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.prediccionInfoText}>
                Fecha de Polinización: {polinizacionMLService.formatearFecha(prediccion.fecha_polinizacion)}
              </Text>
            </View>
            <View style={[styles.prediccionInfo, { marginTop: 6 }]}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.prediccionInfoText}>
                Días estimados desde la polinización: {prediccion.dias_estimados} días
              </Text>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  prediccionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  prediccionLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.status.error,
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },
  prediccionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#182d49',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prediccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prediccionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182d49',
    marginLeft: 8,
  },
  prediccionFecha: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  diasFaltantesContainer: {
    marginBottom: 12,
  },
  diasFaltantesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  diasFaltantesText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  progresoContainer: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progresoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progresoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    marginRight: 8,
  },
  progresoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progresoBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progresoBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  prediccionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  prediccionInfoText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { polinizacionService } from '@/services/polinizacion.service';

interface EstadisticasPrediccionesPolinizacion {
  total_predicciones: number;
  predicciones_validadas: number;
  precision_promedio: number;
  confianza_promedio: number;
  especies_mas_predichas: Array<{
    especie: string;
    cantidad: number;
    precision_promedio?: number;
  }>;
  distribucion_por_tipo: {
    inicial: number;
    refinada: number;
    basica_con_fecha: number;
    validada: number;
  };
  distribucion_por_calidad: {
    excelente: number;
    buena: number;
    aceptable: number;
    regular: number;
    pobre: number;
  };
  tendencia_mensual: Array<{
    mes: string;
    predicciones: number;
    precision_promedio?: number;
  }>;
  modelo_version: string;
  modelo_precision: number;
  ultima_actualizacion: string;
}

interface EstadisticasPrecisionPolinizacionProps {
  onExportar?: () => void;
  mostrarCompleto?: boolean;
}

export const EstadisticasPrecisionPolinizacion: React.FC<EstadisticasPrecisionPolinizacionProps> = ({
  onExportar,
  mostrarCompleto = true
}) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPrediccionesPolinizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Cargando estadísticas de predicciones de polinización...');

      const data = await polinizacionService.obtenerEstadisticasPredicciones();
      setEstadisticas(data);

      console.log('✅ Estadísticas cargadas:', data);
    } catch (error: any) {
      console.error('❌ Error cargando estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas de predicciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const getPrecisionColor = useCallback((precision: number) => {
    if (precision >= 90) return '#10B981'; // Verde
    if (precision >= 80) return '#F59E0B'; // Amarillo
    if (precision >= 70) return '#EF4444'; // Rojo
    return '#6B7280'; // Gris
  }, []);

  const getCalidadColor = useCallback((calidad: string) => {
    switch (calidad) {
      case 'excelente': return '#10B981';
      case 'buena': return '#3B82F6';
      case 'aceptable': return '#F59E0B';
      case 'regular': return '#EF4444';
      case 'pobre': return '#6B7280';
      default: return '#6B7280';
    }
  }, []);

  const renderMetricaCard = useCallback((titulo: string, valor: string | number, subtitulo?: string, color?: string) => (
    <View style={[styles.metricCard, color && { borderLeftColor: color }]}>
      <Text style={styles.metricValue}>{valor}</Text>
      <Text style={styles.metricLabel}>{titulo}</Text>
      {subtitulo && <Text style={styles.metricSubtitle}>{subtitulo}</Text>}
    </View>
  ), []);

  const renderEspecieItem = useCallback((especie: any, index: number) => (
    <View key={index} style={styles.especieItem}>
      <View style={styles.especieInfo}>
        <Text style={styles.especieNombre}>{especie.especie}</Text>
        <Text style={styles.especieCantidad}>{especie.cantidad} predicciones</Text>
      </View>
      {especie.precision_promedio && (
        <View style={[styles.especiePrecision, { backgroundColor: getPrecisionColor(especie.precision_promedio) }]}>
          <Text style={styles.especiePrecisionText}>{especie.precision_promedio.toFixed(1)}%</Text>
        </View>
      )}
    </View>
  ), [getPrecisionColor]);

  const renderDistribucionCalidad = useCallback(() => {
    if (!estadisticas?.distribucion_por_calidad) return null;

    const total = Object.values(estadisticas.distribucion_por_calidad).reduce((sum, val) => sum + val, 0);

    return (
      <View style={styles.distribucionContainer}>
        <Text style={styles.sectionTitle}>Distribución por Calidad</Text>
        {Object.entries(estadisticas.distribucion_por_calidad).map(([calidad, cantidad]) => {
          const porcentaje = total > 0 ? (cantidad / total * 100) : 0;
          return (
            <View key={calidad} style={styles.distribucionItem}>
              <View style={styles.distribucionInfo}>
                <View style={[styles.distribucionColor, { backgroundColor: getCalidadColor(calidad) }]} />
                <Text style={styles.distribucionLabel}>{calidad.charAt(0).toUpperCase() + calidad.slice(1)}</Text>
              </View>
              <View style={styles.distribucionValores}>
                <Text style={styles.distribucionCantidad}>{cantidad}</Text>
                <Text style={styles.distribucionPorcentaje}>({porcentaje.toFixed(1)}%)</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [estadisticas, getCalidadColor]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!estadisticas) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={48} color="#6B7280" />
        <Text style={styles.emptyTitle}>No hay estadísticas disponibles</Text>
        <Text style={styles.emptySubtitle}>
          Las estadísticas aparecerán cuando haya predicciones de polinización
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#F59E0B']}
          tintColor="#F59E0B"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Estadísticas del Modelo</Text>
          <Text style={styles.subtitle}>Predicciones de Polinización</Text>
        </View>

        {onExportar && (
          <TouchableOpacity style={styles.exportButton} onPress={onExportar}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Métricas principales */}
      <View style={styles.metricsGrid}>
        {renderMetricaCard(
          'Precisión Promedio',
          `${estadisticas.precision_promedio.toFixed(1)}%`,
          'Modelo de polinización',
          getPrecisionColor(estadisticas.precision_promedio)
        )}

        {renderMetricaCard(
          'Total Predicciones',
          estadisticas.total_predicciones,
          `${estadisticas.predicciones_validadas} validadas`
        )}

        {renderMetricaCard(
          'Confianza Promedio',
          `${estadisticas.confianza_promedio.toFixed(1)}%`,
          'Nivel de confianza'
        )}

        {renderMetricaCard(
          'Versión del Modelo',
          estadisticas.modelo_version,
          `Precisión: ${estadisticas.modelo_precision.toFixed(1)}%`
        )}
      </View>

      {mostrarCompleto && (
        <>
          {/* Especies más predichas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especies Más Predichas</Text>
            {estadisticas.especies_mas_predichas.slice(0, 5).map(renderEspecieItem)}
          </View>

          {/* Distribución por tipo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribución por Tipo</Text>
            <View style={styles.tiposGrid}>
              {Object.entries(estadisticas.distribucion_por_tipo).map(([tipo, cantidad]) => (
                <View key={tipo} style={styles.tipoCard}>
                  <Text style={styles.tipoValor}>{cantidad}</Text>
                  <Text style={styles.tipoLabel}>{tipo.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Distribución por calidad */}
          {renderDistribucionCalidad()}

          {/* Tendencia mensual */}
          {estadisticas.tendencia_mensual.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tendencia Mensual</Text>
              {estadisticas.tendencia_mensual.slice(-6).map((mes, index) => (
                <View key={index} style={styles.tendenciaItem}>
                  <Text style={styles.tendenciaMes}>{mes.mes}</Text>
                  <View style={styles.tendenciaValores}>
                    <Text style={styles.tendenciaPredicciones}>{mes.predicciones} predicciones</Text>
                    {mes.precision_promedio && (
                      <Text style={[
                        styles.tendenciaPrecision,
                        { color: getPrecisionColor(mes.precision_promedio) }
                      ]}>
                        {mes.precision_promedio.toFixed(1)}%
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Footer con información del modelo */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Última actualización: {new Date(estadisticas.ultima_actualizacion).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  exportButton: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 150,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  especieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  especieInfo: {
    flex: 1,
  },
  especieNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  especieCantidad: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  especiePrecision: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  especiePrecisionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tiposGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  tipoValor: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  tipoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  distribucionContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distribucionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  distribucionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distribucionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  distribucionLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  distribucionValores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distribucionCantidad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  distribucionPorcentaje: {
    fontSize: 12,
    color: '#6B7280',
  },
  tendenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tendenciaMes: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tendenciaValores: {
    alignItems: 'flex-end',
  },
  tendenciaPredicciones: {
    fontSize: 14,
    color: '#6B7280',
  },
  tendenciaPrecision: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default EstadisticasPrecisionPolinizacion;
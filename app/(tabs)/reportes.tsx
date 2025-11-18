import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportesService } from '@/services/reportes.service';
import { TabNavigation } from '@/components/navigation';
import { BezierLineChartComponent, ProgressRingComponent } from '@/components/charts/ChartComponents';
import { ExportModal } from '@/components/export';
import { Colors } from '@/constants/Colors';
import { SimpleCalendarPicker } from '@/components/common';

export default function ReportesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gStats, setGStats] = useState<any>(null);
  const [pStats, setPStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  
  // Estados para filtros de fecha
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [filtrosActivos, setFiltrosActivos] = useState(false);

  // Forzar modo claro en reportes
  const colors = Colors['light'];

  const fetchStats = async (filtros?: { fecha_inicio?: string; fecha_fin?: string }) => {
    if (!refreshing) setLoading(true);
    setError('');
    try {
      // Verificar autenticación primero
      const token = await import('@/services/secureStore').then(m => m.secureStore.getItem('authToken'));
      
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const [germinacionesResult, polinizacionesResult] = await Promise.allSettled([
        reportesService.getEstadisticasGerminaciones(filtros),
        reportesService.getEstadisticasPolinizaciones(filtros),
      ]);
      
      // Procesar resultados de germinaciones
      if (germinacionesResult.status === 'fulfilled') {
        setGStats(germinacionesResult.value);
      } else {
        console.error('Error cargando estadísticas de germinaciones:', germinacionesResult.reason);
      }
      
      // Procesar resultados de polinizaciones
      if (polinizacionesResult.status === 'fulfilled') {
        const polStats = polinizacionesResult.value;
        console.log('📊 Estadísticas de polinizaciones recibidas:', polStats);
        console.log('📊 Datos por_mes:', polStats?.por_mes);
        setPStats(polStats);
      } else {
        console.error('Error cargando estadísticas de polinizaciones:', polinizacionesResult.reason);
      }
      
      // Si ambos fallan, mostrar error
      if (germinacionesResult.status === 'rejected' && polinizacionesResult.status === 'rejected') {
        setError('No se pudieron cargar las estadísticas. Verifique su conexión.');
      }
      
    } catch (e) {
      console.error('Error inesperado cargando estadísticas:', e);
      setError('Error inesperado cargando estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    const filtros = filtrosActivos ? { fecha_inicio: fechaInicio, fecha_fin: fechaFin } : undefined;
    fetchStats(filtros);
  };

  const validateFechas = (): boolean => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert('Campos requeridos', 'Por favor selecciona ambas fechas (Desde y Hasta)');
      return false;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Alert.alert('Error de validación', 'La fecha "Desde" no puede ser posterior a la fecha "Hasta"');
      return false;
    }
    
    return true;
  };

  const handleAplicarFiltros = () => {
    if (!validateFechas()) return;
    setFiltrosActivos(true);
    fetchStats({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltrosActivos(false);
    fetchStats();
  };

  const handleExportar = () => {
    if (filtrosActivos && !validateFechas()) return;
    setExportModalVisible(true);
  };

  // Obtener los últimos 3 meses para los gráficos (solo si no hay filtros activos)
  // Si hay filtros activos, mostrar todos los meses del rango filtrado
  const obtenerDatosParaGrafico = (data: any[]) => {
    if (!data || data.length === 0) return [];
    // Si hay filtros activos, mostrar todos los meses del rango
    if (filtrosActivos) {
      return data;
    }
    // Si no hay filtros, mostrar solo los últimos 3 meses
    return data.slice(-3);
  };

  const polMeses = obtenerDatosParaGrafico(pStats?.por_mes ?? []);
  const germMeses = obtenerDatosParaGrafico(gStats?.por_mes ?? []);
  
  // Debug: Log de datos para gráfico
  React.useEffect(() => {
    if (pStats) {
      console.log('📈 Datos para gráfico de polinizaciones:', polMeses);
      console.log('📈 Total de meses:', polMeses.length);
    }
  }, [pStats, polMeses]);

  // Formatear fecha para mostrar
  const formatDateRange = () => {
    if (!filtrosActivos || !fechaInicio || !fechaFin) return null;
    const inicio = new Date(fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const fin = new Date(fechaFin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${inicio} - ${fin}`;
  };

  if (loading && !refreshing) {
    return (
      <View style={[reportesStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#e9ad14" />
        <Text style={reportesStyles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  if (error && !gStats && !pStats) {
    return (
      <View style={[reportesStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={reportesStyles.errorText}>{error}</Text>
        <TouchableOpacity style={reportesStyles.retryButton} onPress={onRefresh}>
          <Text style={reportesStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (  
    <View style={[reportesStyles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Navegación con pestañas */}
      <TabNavigation currentTab="reportes" />
      
      <ScrollView 
        style={reportesStyles.container} 
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e9ad14"
            colors={['#e9ad14']}
          />
        }
      >
        {/* Header Section Mejorado */}
        <View style={reportesStyles.headerSection}>
          <View style={reportesStyles.headerContent}>
            <View style={reportesStyles.headerIconContainer}>
              <Ionicons name="analytics" size={32} color="#e9ad14" />
            </View>
            <View style={reportesStyles.headerTextContainer}>
              <Text style={reportesStyles.title}>Reportes y Estadísticas</Text>
              <Text style={reportesStyles.subtitle}>
                Análisis detallado de germinaciones y polinizaciones
              </Text>
            </View>
          </View>
          {filtrosActivos && formatDateRange() && (
            <View style={reportesStyles.activeFilterBadge}>
              <Ionicons name="calendar" size={14} color="#e9ad14" />
              <Text style={reportesStyles.activeFilterText}>{formatDateRange()}</Text>
            </View>
          )}
        </View>

        {/* Filtros de Fecha Mejorados */}
        <View style={reportesStyles.filtersContainer}>
          <View style={reportesStyles.filtersHeader}>
            <View style={reportesStyles.filtersTitleContainer}>
              <Ionicons name="filter" size={20} color="#374151" />
              <Text style={reportesStyles.filtersTitle}>Filtros de Fecha</Text>
            </View>
            {filtrosActivos && (
              <TouchableOpacity 
                style={reportesStyles.clearFiltersButton}
                onPress={handleLimpiarFiltros}
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
                <Text style={reportesStyles.clearFiltersText}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={reportesStyles.dateInputGroup}>
            <View style={reportesStyles.dateInputWrapper}>
              <View style={reportesStyles.dateLabelContainer}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={reportesStyles.dateLabel}>Desde</Text>
              </View>
              <SimpleCalendarPicker
                value={fechaInicio}
                onDateChange={setFechaInicio}
                placeholder="Seleccionar fecha"
                label=""
              />
            </View>
            
            <View style={reportesStyles.dateInputWrapper}>
              <View style={reportesStyles.dateLabelContainer}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={reportesStyles.dateLabel}>Hasta</Text>
              </View>
              <SimpleCalendarPicker
                value={fechaFin}
                onDateChange={setFechaFin}
                placeholder="Seleccionar fecha"
                label=""
              />
            </View>
          </View>

          <View style={reportesStyles.buttonsGroup}>
            <TouchableOpacity 
              style={[reportesStyles.actionButton, reportesStyles.applyButton]}
              onPress={handleAplicarFiltros}
              disabled={!fechaInicio || !fechaFin}
            >
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={reportesStyles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[reportesStyles.actionButton, reportesStyles.exportButton]}
              onPress={handleExportar}
            >
              <Ionicons name="download" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={reportesStyles.exportButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumen General */}
        {(gStats || pStats) && (
          <View style={reportesStyles.summaryCard}>
            <View style={reportesStyles.summaryHeader}>
              <Ionicons name="stats-chart" size={24} color="#e9ad14" />
              <Text style={reportesStyles.summaryTitle}>Resumen General</Text>
            </View>
            <View style={reportesStyles.summaryGrid}>
              <View style={reportesStyles.summaryItem}>
                <Text style={reportesStyles.summaryValue}>
                  {((pStats?.total || 0) + (gStats?.total || 0)).toLocaleString()}
                </Text>
                <Text style={reportesStyles.summaryLabel}>Total Registros</Text>
              </View>
              <View style={reportesStyles.summaryDivider} />
              <View style={reportesStyles.summaryItem}>
                <Text style={reportesStyles.summaryValue}>
                  {pStats?.total?.toLocaleString() || 0}
                </Text>
                <Text style={reportesStyles.summaryLabel}>Polinizaciones</Text>
              </View>
              <View style={reportesStyles.summaryDivider} />
              <View style={reportesStyles.summaryItem}>
                <Text style={reportesStyles.summaryValue}>
                  {gStats?.total?.toLocaleString() || 0}
                </Text>
                <Text style={reportesStyles.summaryLabel}>Germinaciones</Text>
              </View>
            </View>
          </View>
        )}

        {/* KPIs Polinizaciones */}
        <View style={reportesStyles.sectionHeader}>
          <View style={reportesStyles.sectionIconContainer}>
            <Ionicons name="flower" size={24} color="#e9ad14" />
          </View>
          <View style={reportesStyles.sectionTitleContainer}>
            <Text style={reportesStyles.sectionTitle}>Polinizaciones</Text>
            <Text style={reportesStyles.sectionSubtitle}>Métricas y tendencias</Text>
          </View>
        </View>

        {pStats ? (
          <>
            <View style={reportesStyles.kpiContainer}>
              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="flower" size={24} color="#e9ad14" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Total</Text>
                <Text style={reportesStyles.kpiValue}>{pStats?.total?.toLocaleString() ?? '-'}</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text style={reportesStyles.kpiTrendPositive}>Activo</Text>
                </View>
              </View>

              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Tasa de Éxito</Text>
                <Text style={reportesStyles.kpiValue}>{pStats?.tasa_exito ?? '-'}%</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="arrow-up" size={14} color="#10B981" />
                  <Text style={reportesStyles.kpiTrendPositive}>Excelente</Text>
                </View>
              </View>

              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="seed" size={24} color="#3B82F6" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Semillas/Fruto</Text>
                <Text style={reportesStyles.kpiValue}>{pStats?.promedio_semillas_fruto ?? '-'}</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="information-circle" size={14} color="#6b7280" />
                  <Text style={reportesStyles.kpiTrendNeutral}>Promedio</Text>
                </View>
              </View>
            </View>

            {/* Gráfico de línea tendencia mensual polinizaciones */}
            {polMeses.length > 0 ? (
              <BezierLineChartComponent
                data={polMeses}
                title={filtrosActivos 
                  ? "Tendencia de Polinizaciones" 
                  : "Tendencia de Polinizaciones (Últimos 3 meses)"
                }
              />
            ) : (
              <View style={reportesStyles.emptyState}>
                <Ionicons name="bar-chart-outline" size={48} color="#d1d5db" />
                <Text style={reportesStyles.emptyStateText}>
                  No hay datos de tendencia disponibles
                </Text>
                <Text style={[reportesStyles.emptyStateText, { fontSize: 13, marginTop: 4 }]}>
                  {pStats?.por_mes?.length === 0 
                    ? "No se encontraron polinizaciones con fecha de polinización (fechapol) en el rango seleccionado"
                    : "Asegúrate de que las polinizaciones tengan fecha de polinización registrada"
                  }
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={reportesStyles.emptyState}>
            <Ionicons name="flower-outline" size={48} color="#d1d5db" />
            <Text style={reportesStyles.emptyStateText}>No hay datos de polinizaciones</Text>
          </View>
        )}

        {/* KPIs Germinaciones */}
        <View style={reportesStyles.sectionHeader}>
          <View style={reportesStyles.sectionIconContainer}>
            <Ionicons name="leaf" size={24} color="#10B981" />
          </View>
          <View style={reportesStyles.sectionTitleContainer}>
            <Text style={reportesStyles.sectionTitle}>Germinaciones</Text>
            <Text style={reportesStyles.sectionSubtitle}>Métricas y tendencias</Text>
          </View>
        </View>

        {gStats ? (
          <>
            <View style={reportesStyles.kpiContainer}>
              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="leaf" size={24} color="#10B981" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Total</Text>
                <Text style={reportesStyles.kpiValue}>{gStats?.total?.toLocaleString() ?? '-'}</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text style={reportesStyles.kpiTrendPositive}>Activo</Text>
                </View>
              </View>

              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Tasa de Éxito</Text>
                <Text style={reportesStyles.kpiValue}>{gStats?.tasa_exito ?? '-'}%</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="arrow-up" size={14} color="#10B981" />
                  <Text style={reportesStyles.kpiTrendPositive}>Excelente</Text>
                </View>
              </View>

              <View style={reportesStyles.kpiCard}>
                <View style={[reportesStyles.kpiIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="time" size={24} color="#e9ad14" />
                </View>
                <Text style={reportesStyles.kpiLabel}>Días Promedio</Text>
                <Text style={reportesStyles.kpiValue}>{gStats?.promedio_dias_germinar ?? '-'}</Text>
                <Text style={reportesStyles.kpiSubLabel}>días</Text>
                <View style={reportesStyles.kpiTrendContainer}>
                  <Ionicons name="information-circle" size={14} color="#6b7280" />
                  <Text style={reportesStyles.kpiTrendNeutral}>Tiempo estimado</Text>
                </View>
              </View>
            </View>

            {/* Gráfico de Progreso - Germinaciones */}
            {gStats && (
              <ProgressRingComponent
                tasaExito={gStats.tasa_exito || 0}
                title="Progreso de Germinaciones"
              />
            )}

            {/* Gráfico de línea tendencia mensual germinaciones */}
            {germMeses.length > 0 && (
              <BezierLineChartComponent
                data={germMeses}
                title={filtrosActivos 
                  ? "Tendencia de Germinaciones" 
                  : "Tendencia de Germinaciones (Últimos 3 meses)"
                }
              />
            )}
          </>
        ) : (
          <View style={reportesStyles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
            <Text style={reportesStyles.emptyStateText}>No hay datos de germinaciones</Text>
          </View>
        )}

        {/* Modal de exportación */}
        <ExportModal
          visible={exportModalVisible}
          onClose={() => setExportModalVisible(false)}
          allowEntitySelection={true}
          title="Exportar Reporte"
          defaultFechaInicio={fechaInicio}
          defaultFechaFin={fechaFin}
        />
      </ScrollView>
    </View>
  );
}

const reportesStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#182d49',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateInputGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  dateInputWrapper: {
    flex: 1,
    minWidth: 150,
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginLeft: 4,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  buttonsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButton: {
    backgroundColor: '#182d49',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#e9ad14',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  kpiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  kpiSubLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  kpiTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  kpiTrendPositive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  kpiTrendNegative: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  kpiTrendNeutral: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

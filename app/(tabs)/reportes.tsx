import { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportesService } from '@/services/reportes.service';
import { ResponsiveLayout } from '@/components/layout';
import { ReportesHeader, MetricCard, GrowthChart, SpeciesDonutChart, MonthlyActivityChart, RecentRecordsTable } from '@/components/reportes';
import { useTheme } from '@/contexts/ThemeContext';

export default function ReportesScreen() {
  const { colors: themeColors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gStats, setGStats] = useState<any>(null);
  const [pStats, setPStats] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!refreshing) setLoading(true);
    setError('');
    try {
      const token = await import('@/services/secureStore').then(m => m.secureStore.getItem('authToken'));
      
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const [germinacionesResult, polinizacionesResult] = await Promise.allSettled([
        reportesService.getEstadisticasGerminaciones(),
        reportesService.getEstadisticasPolinizaciones(),
      ]);
      
      if (germinacionesResult.status === 'fulfilled') {
        setGStats(germinacionesResult.value);
      }
      
      if (polinizacionesResult.status === 'fulfilled') {
        setPStats(polinizacionesResult.value);
      }
      
      if (germinacionesResult.status === 'rejected' && polinizacionesResult.status === 'rejected') {
        setError('No se pudieron cargar las estadísticas. Verifique su conexión.');
      }
      
    } catch (e) {
      logger.error('Error inesperado cargando estadísticas:', e);
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
    fetchStats();
  };

  const reportesStyles = createStyles(themeColors);

  if (loading && !refreshing) {
    return (
      <View style={reportesStyles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={reportesStyles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  if (error && !gStats && !pStats) {
    return (
      <View style={reportesStyles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={themeColors.status.error} />
        <Text style={reportesStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (  
    <ResponsiveLayout 
      currentTab="reportes" 
      style={reportesStyles.mainContainer}
    >
      <ScrollView 
        style={reportesStyles.container} 
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary.main}
            colors={[themeColors.primary.main]}
          />
        }
      >
        {/* Header */}
        <ReportesHeader />

        {/* Métricas principales */}
        <View style={reportesStyles.metricsGrid}>
          <MetricCard
            title="POLINIZACIONES"
            value={pStats?.total?.toLocaleString() || '1,240'}
            icon="flower-outline"
            change="+12%"
            changeType="positive"
          />
          <MetricCard
            title="EFICIENCIA GERMINACIÓN"
            value={`${gStats?.tasa_exito || '85.4'}%`}
            icon="leaf-outline"
            change="+5%"
            changeType="positive"
          />
          <MetricCard
            title="LOTES ACTIVOS"
            value={gStats?.total?.toLocaleString() || '42'}
            icon="grid-outline"
            change="0%"
            changeType="neutral"
          />
          <MetricCard
            title="PÉRDIDAS"
            value="12"
            icon="alert-circle-outline"
            change="-2%"
            changeType="negative"
          />
        </View>

        {/* Gráficos superiores */}
        <View style={reportesStyles.chartsRow}>
          <View style={reportesStyles.chartLarge}>
            <GrowthChart data={gStats?.por_mes} />
          </View>
          <View style={reportesStyles.chartSmall}>
            <SpeciesDonutChart />
          </View>
        </View>

        {/* Gráficos inferiores */}
        <View style={reportesStyles.chartsRow}>
          <View style={reportesStyles.chartSmall}>
            <MonthlyActivityChart data={pStats?.por_mes} />
          </View>
          <View style={reportesStyles.chartLarge}>
            <RecentRecordsTable />
          </View>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.background.secondary,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  chartLarge: {
    flex: 2,
    minWidth: 400,
  },
  chartSmall: {
    flex: 1,
    minWidth: 300,
  },
});

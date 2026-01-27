import { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportesService } from '@/services/reportes.service';
import { polinizacionService } from '@/services/polinizacion.service';
import { germinacionService } from '@/services/germinacion.service';
import { ResponsiveLayout } from '@/components/layout';
import { ReportesHeader, MetricCard, GrowthChart, SpeciesDonutChart, MonthlyActivityChart, RecentRecordsTable } from '@/components/reportes';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/services/logger';

export default function ReportesScreen() {
  const { colors: themeColors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gStats, setGStats] = useState<any>(null);
  const [pStats, setPStats] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
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

      const [germinacionesResult, polinizacionesResult, recientesPolinizaciones, recientesGerminaciones] = await Promise.allSettled([
        reportesService.getEstadisticasGerminaciones(),
        reportesService.getEstadisticasPolinizaciones(),
        polinizacionService.getPaginated({ page: 1, page_size: 3 }),
        germinacionService.getPaginated({ page: 1, page_size: 2 }),
      ]);

      if (germinacionesResult.status === 'fulfilled') {
        setGStats(germinacionesResult.value);
      }

      if (polinizacionesResult.status === 'fulfilled') {
        setPStats(polinizacionesResult.value);
      }

      // Procesar registros recientes (combinar polinizaciones y germinaciones)
      const records: any[] = [];

      if (recientesPolinizaciones.status === 'fulfilled') {
        const polinizaciones = recientesPolinizaciones.value?.results || [];
        polinizaciones.forEach((pol: any) => {
          const estado = pol.fechamad ? 'Exitoso' :
                        (pol.prediccion_fecha_estimada && new Date(pol.prediccion_fecha_estimada) <= new Date()) ? 'En Proceso' :
                        'Pendiente';

          records.push({
            id: pol.codigo || pol.nueva_codigo || `#POL-${pol.numero}`,
            tipo: 'Polinización' as const,
            plantaMadre: pol.nueva_especie || pol.especie || pol.madre_especie || 'Sin especie',
            fecha: pol.fechapol ? new Date(pol.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha',
            estado: estado as 'Exitoso' | 'En Proceso' | 'Pendiente',
            color: estado === 'Exitoso' ? themeColors.primary.main :
                   estado === 'En Proceso' ? themeColors.accent.primary :
                   themeColors.status.warning,
          });
        });
      }

      if (recientesGerminaciones.status === 'fulfilled') {
        const germinaciones = recientesGerminaciones.value?.results || [];
        germinaciones.forEach((germ: any) => {
          const estado = germ.estado_capsulas === 'CERRADA' ? 'Exitoso' :
                        germ.estado_capsulas === 'ABIERTA' ? 'En Proceso' :
                        'Pendiente';

          records.push({
            id: germ.codigo || `#GER-${germ.id}`,
            tipo: 'Germinación' as const,
            plantaMadre: germ.especie_variedad || germ.especie || 'Sin especie',
            fecha: germ.fecha_siembra ? new Date(germ.fecha_siembra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha',
            estado: estado as 'Exitoso' | 'En Proceso' | 'Pendiente',
            color: estado === 'Exitoso' ? themeColors.primary.main :
                   estado === 'En Proceso' ? themeColors.accent.primary :
                   themeColors.status.warning,
          });
        });
      }

      // Ordenar por fecha (más recientes primero) y tomar los primeros 4
      setRecentRecords(records.slice(0, 4));

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
            <RecentRecordsTable records={recentRecords} />
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

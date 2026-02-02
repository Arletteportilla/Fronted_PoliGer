import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, TouchableOpacity, RefreshControl, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Germinacion, Polinizacion } from '@/types';
import { ResponsiveLayout } from '@/components/layout';
import { useTheme } from '@/contexts/ThemeContext';

// IMPORTS DIRECTOS - NO LAZY
import { germinacionService } from '@/services/germinacion.service';
import { polinizacionService } from '@/services/polinizacion.service';

interface StatusCounts {
  ingresado: number;
  en_proceso: number;
  completado: number;
  total: number;
}

interface ItemCard {
  id: string;
  type: 'germinacion' | 'polinizacion';
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  progress: number;
  date: string;
  responsable?: string | any;
  location?: string | undefined;
  item: any;
}

export default function HomeScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const styles = createStyles(themeColors, isMobile);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estadísticas
  const [germinacionStats, setGerminacionStats] = useState<StatusCounts>({
    ingresado: 0,
    en_proceso: 0,
    completado: 0,
    total: 0
  });
  const [polinizacionStats, setPolinizacionStats] = useState<StatusCounts>({
    ingresado: 0,
    en_proceso: 0,
    completado: 0,
    total: 0
  });

  // Actividades recientes
  const [itemCards, setItemCards] = useState<ItemCard[]>([]);
  const [filter, setFilter] = useState<'all' | 'germinacion' | 'polinizacion'>('all');

  // Funciones auxiliares
  const calculateProgress = useCallback((item: Germinacion | Polinizacion, type: 'germinacion' | 'polinizacion'): number => {
    if (type === 'germinacion') {
      const ger = item as Germinacion;
      switch (ger.etapa_actual) {
        case 'INGRESADO': return 25;
        case 'EN_PROCESO': return 65;
        case 'LISTA': return 100;
        case 'CANCELADO': return 0;
        default: return 10;
      }
    } else {
      const pol = item as Polinizacion;
      if (pol.fechamad) return 100;
      if (pol.fechapol) return 70;
      return 30;
    }
  }, []);

  const getGerminacionStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'INGRESADO': return 'Ingresado';
      case 'EN_PROCESO': return 'En Proceso';
      case 'LISTA': return 'Lista';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }, []);

  const getGerminacionStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'INGRESADO': return '#F59E0B';
      case 'EN_PROCESO': return '#3B82F6';
      case 'LISTA': return '#10B981';
      case 'CANCELADO': return '#EF4444';
      default: return '#6B7280';
    }
  }, []);

  const getPolinizacionStatusLabel = useCallback((polinizacion: any) => {
    if (polinizacion.fechamad) return 'Completado';
    if (polinizacion.fechapol) return 'En Proceso';
    return 'Ingresado';
  }, []);

  const getPolinizacionStatusColor = useCallback((polinizacion: any) => {
    if (polinizacion.fechamad) return '#10B981';
    if (polinizacion.fechapol) return '#3B82F6';
    return '#F59E0B';
  }, []);

  const calculatePolinizacionStats = useCallback((polinizaciones: Polinizacion[]): StatusCounts => {
    if (!Array.isArray(polinizaciones)) {
      return { ingresado: 0, en_proceso: 0, completado: 0, total: 0 };
    }

    const stats = {
      ingresado: 0,
      en_proceso: 0,
      completado: 0,
      total: polinizaciones.length
    };

    polinizaciones.forEach(p => {
      if (p) {
        if (p.fechamad) {
          stats.completado++;
        } else if (p.fechapol) {
          stats.en_proceso++;
        } else {
          stats.ingresado++;
        }
      }
    });

    return stats;
  }, []);

  const generateItemCards = useCallback((germinaciones: Germinacion[], polinizaciones: Polinizacion[]): ItemCard[] => {
    const cards: ItemCard[] = [];

    const validGerminaciones = Array.isArray(germinaciones) ? germinaciones : [];
    const validPolinizaciones = Array.isArray(polinizaciones) ? polinizaciones : [];

    // Ordenar y tomar solo los últimos 5 de cada tipo
    const sortedGerminaciones = validGerminaciones
      .sort((a, b) => {
        const dateA = new Date(a.fecha_siembra || a.fecha_ingreso || a.fecha_creacion || new Date());
        const dateB = new Date(b.fecha_siembra || b.fecha_ingreso || b.fecha_creacion || new Date());
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    const sortedPolinizaciones = validPolinizaciones
      .sort((a, b) => {
        const dateA = new Date(a.fechapol || new Date());
        const dateB = new Date(b.fechapol || new Date());
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    // Generar tarjetas de germinaciones
    sortedGerminaciones.forEach(ger => {
      if (ger && ger.id) {
        const progress = calculateProgress(ger, 'germinacion');

        cards.push({
          id: `ger-${ger.id}`,
          type: 'germinacion',
          title: ger.codigo || ger.nombre || `Germinación ${ger.id}`,
          subtitle: ger.especie || ger.especie_variedad || 'Sin especie',
          status: getGerminacionStatusLabel(ger.etapa_actual || ''),
          statusColor: getGerminacionStatusColor(ger.etapa_actual || ''),
          progress,
          date: ger.fecha_siembra || ger.fecha_ingreso || ger.fecha_creacion || '',
          responsable: ger.responsable || undefined,
          location: undefined,
          item: ger
        });
      }
    });

    // Generar tarjetas de polinizaciones
    sortedPolinizaciones.forEach(pol => {
      if (pol && (pol.id || pol.numero)) {
        const progress = calculateProgress(pol, 'polinizacion');

        cards.push({
          id: `pol-${pol.numero || pol.id}`,
          type: 'polinizacion',
          title: pol.codigo || `Polinización ${pol.numero || pol.id}`,
          subtitle: `${pol.genero || pol.nueva_planta_genero || pol.planta_madre_genero || ''} ${pol.especie || pol.nueva_planta_especie || pol.planta_madre_especie || ''}`.trim() || 'Sin especie',
          status: getPolinizacionStatusLabel(pol),
          statusColor: getPolinizacionStatusColor(pol),
          progress,
          date: pol.fechapol || '',
          responsable: typeof pol.responsable === 'object' && pol.responsable ? pol.responsable.username : pol.responsable,
          location: pol.ubicacion,
          item: pol
        });
      }
    });

    // Ordenar por fecha
    return cards.sort((a, b) => {
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      return dateB.getTime() - dateA.getTime();
    });
  }, [calculateProgress, getGerminacionStatusColor, getGerminacionStatusLabel, getPolinizacionStatusColor, getPolinizacionStatusLabel]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (!token) {
        console.warn('No hay token de autenticación');
        throw new Error('Necesitas autenticarte para ver los datos');
      }

      // Obtener estadísticas reales de germinaciones desde el backend
      const estadisticasResponse = await germinacionService.getFilterOptions();

      // Las estadísticas vienen en el formato: { total, por_estado: { CERRADA, ABIERTA, SEMIABIERTA } }
      const germinacionCounts = {
        ingresado: estadisticasResponse?.estadisticas?.por_estado?.SEMIABIERTA || 0,
        en_proceso: estadisticasResponse?.estadisticas?.por_estado?.ABIERTA || 0,
        completado: estadisticasResponse?.estadisticas?.por_estado?.CERRADA || 0,
        total: estadisticasResponse?.estadisticas?.total || 0
      };

      setGerminacionStats(germinacionCounts);

      // Obtener datos de polinizaciones
      const [germinacionesRecientesRaw, polinizacionesRaw, totalPolinizaciones] = await Promise.allSettled([
        germinacionService.getPaginated({ page: 1, page_size: 20 }),
        polinizacionService.getPaginated({ page: 1, page_size: 1000 }),
        polinizacionService.getTotalCount()
      ]);

      const germinacionesRecientes = germinacionesRecientesRaw.status === 'fulfilled'
        ? (germinacionesRecientesRaw.value?.results || [])
        : [];
      const polinizaciones = polinizacionesRaw.status === 'fulfilled'
        ? (polinizacionesRaw.value?.results || [])
        : [];
      const totalPol = totalPolinizaciones.status === 'fulfilled'
        ? totalPolinizaciones.value
        : 0;

      // Calcular estadísticas de polinizaciones
      const polinizacionCounts = calculatePolinizacionStats(polinizaciones);
      polinizacionCounts.total = totalPol; // Usar el total real
      setPolinizacionStats(polinizacionCounts);

      // Generar tarjetas de actividades recientes
      const cards = generateItemCards(germinacionesRecientes, polinizaciones);
      setItemCards(cards);

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      if (error instanceof Error && error.message.includes('autenticarte')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, router, calculatePolinizacionStats, generateItemCards]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'hace un momento';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'hace un momento';
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? 'hace un momento' : `hace ${diffInMinutes} min`;
      } else if (diffInHours < 24) {
        return diffInHours === 1 ? 'hace 1 hora' : `hace ${diffInHours} horas`;
      } else if (diffInDays < 7) {
        return diffInDays === 1 ? 'hace 1 día' : `hace ${diffInDays} días`;
      } else {
        return formatDate(dateString);
      }
    } catch (error) {
      return 'hace un momento';
    }
  };

  // Datos simulados para el gráfico (basados en estadísticas reales)
  const chartData = useMemo(() => {
    const months = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];
    const germinacionesData = [
      Math.max(1, Math.floor(germinacionStats.total * 0.12)),
      Math.max(1, Math.floor(germinacionStats.total * 0.15)),
      Math.max(1, Math.floor(germinacionStats.total * 0.18)),
      Math.max(1, Math.floor(germinacionStats.total * 0.22)),
      Math.max(1, Math.floor(germinacionStats.total * 0.16)),
      Math.max(1, Math.floor(germinacionStats.total * 0.17))
    ];
    const polinizacionesData = [
      Math.max(1, Math.floor(polinizacionStats.total * 0.14)),
      Math.max(1, Math.floor(polinizacionStats.total * 0.19)),
      Math.max(1, Math.floor(polinizacionStats.total * 0.16)),
      Math.max(1, Math.floor(polinizacionStats.total * 0.20)),
      Math.max(1, Math.floor(polinizacionStats.total * 0.15)),
      Math.max(1, Math.floor(polinizacionStats.total * 0.16))
    ];
    
    return { months, germinacionesData, polinizacionesData };
  }, [germinacionStats.total, polinizacionStats.total]);





  const renderItemCard = useCallback(({ item }: { item: ItemCard }) => {
    if (!item || !item.type || !item.title) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => {
          if (item.type === 'germinacion') {
            router.push('/(tabs)/germinaciones');
          } else {
            router.push('/(tabs)/polinizaciones');
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeContainer}>
            <Ionicons
              name={item.type === 'germinacion' ? 'leaf' : 'flower'}
              size={20}
              color={item.type === 'germinacion' ? themeColors.primary.main : themeColors.status.warning}
            />
            <Text style={styles.cardType}>
              {item.type === 'germinacion' ? 'Germinación' : 'Polinización'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso</Text>
            <Text style={styles.progressPercentage}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: item.statusColor }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.progress}%`,
                    backgroundColor: themeColors.background.primary
                  }
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          {item.responsable && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {typeof item.responsable === 'object' && item.responsable
                  ? item.responsable.username || 'Sin asignar'
                  : item.responsable || 'Sin asignar'
                }
              </Text>
            </View>
          )}
          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [router, formatDate]);

  const filteredCards = useMemo(() => {
    if (!itemCards || itemCards.length === 0) return [];

    const validCards = itemCards.filter(card => {
      if (!card || !card.type || !card.id) return false;
      if (filter === 'all') return true;
      return card.type === filter;
    });

    return validCards;
  }, [itemCards, filter]);

  const cardCounts = useMemo(() => ({
    all: itemCards.length,
    germinacion: itemCards.filter(c => c.type === 'germinacion').length,
    polinizacion: itemCards.filter(c => c.type === 'polinizacion').length
  }), [itemCards]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ResponsiveLayout currentTab="inicio">
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.status.warning]}
            tintColor={themeColors.status.warning}
          />
        }
      >
        {/* Header con resumen rápido */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <Text style={styles.pageSubtitle}>Vista general del sistema PoliGer</Text>
              <View style={styles.lastUpdateContainer}>
                <Ionicons name="time-outline" size={14} color={themeColors.text.tertiary} />
                <Text style={styles.lastUpdateText}>
                  Última actualización: {new Date().toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* Módulos de Métricas */}
        <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>
            <Ionicons name="analytics" size={20} color={themeColors.text.primary} /> Métricas del Sistema
          </Text>
          <View style={styles.metricsGrid}>
            {/* Total Polinizaciones */}
            <TouchableOpacity 
              style={[styles.metricCard, styles.metricCardPolinizaciones]}
              onPress={() => router.push('/(tabs)/polinizaciones')}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: themeColors.accent.tertiary }]}>
                  <Ionicons name="flower" size={20} color={themeColors.accent.primary} />
                </View>
              </View>
              <Text style={styles.metricLabel}>Total Polinizaciones</Text>
              <Text style={styles.metricValue}>{polinizacionStats.total.toLocaleString()}</Text>
            </TouchableOpacity>

            {/* Total Germinaciones */}
            <TouchableOpacity 
              style={[styles.metricCard, styles.metricCardGerminaciones]}
              onPress={() => router.push('/(tabs)/germinaciones')}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: themeColors.primary.light }]}>
                  <Ionicons name="leaf" size={20} color={themeColors.primary.main} />
                </View>
              </View>
              <Text style={styles.metricLabel}>Total Germinaciones</Text>
              <Text style={styles.metricValue}>{germinacionStats.total.toLocaleString()}</Text>
            </TouchableOpacity>

            {/* Tasa de Éxito */}
            <TouchableOpacity style={[styles.metricCard, styles.metricCardSuccess]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: themeColors.primary.light }]}>
                  <Ionicons name="checkmark-circle" size={20} color={themeColors.primary.dark} />
                </View>
              </View>
              <Text style={styles.metricLabel}>Tasa de Éxito</Text>
              <Text style={styles.metricValue}>
                {germinacionStats.total > 0 
                  ? Math.round((germinacionStats.completado / germinacionStats.total) * 100)
                  : 0}%
              </Text>
            </TouchableOpacity>

            {/* Acciones Pendientes */}
            <TouchableOpacity style={[styles.metricCard, styles.metricCardPending]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: themeColors.status.warningLight }]}>
                  <Ionicons name="time" size={20} color={themeColors.status.warning} />
                </View>
              </View>
              <Text style={styles.metricLabel}>Acciones Pendientes</Text>
              <Text style={styles.metricValue}>{germinacionStats.ingresado + polinizacionStats.ingresado}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Overview y Recent Activity */}
        <View style={styles.performanceSection}>
          <View style={styles.performanceContainer}>
            {/* Resumen de Rendimiento */}
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <View>
                  <Text style={styles.performanceTitle}>Resumen de Rendimiento</Text>
                  <Text style={styles.performanceSubtitle}>Últimos 6 Meses</Text>
                </View>
              </View>
              
              {/* Gráfico de barras agrupadas */}
              <View style={styles.chartContainer}>
                <View style={styles.chartWrapper}>
                  {/* Área del gráfico con barras */}
                  <View style={styles.barChartArea}>
                    {chartData.months.map((month, index) => {
                      const maxValue = Math.max(...chartData.germinacionesData, ...chartData.polinizacionesData);
                      const gerHeight = maxValue > 0 ? (chartData.germinacionesData[index] / maxValue) * 100 : 0;
                      const polHeight = maxValue > 0 ? (chartData.polinizacionesData[index] / maxValue) * 100 : 0;

                      return (
                        <View key={month} style={styles.barGroup}>
                          {/* Valores encima de las barras */}
                          <View style={styles.barValuesRow}>
                            <Text style={[styles.barValue, { color: themeColors.status.warning }]}>
                              {chartData.germinacionesData[index]}
                            </Text>
                            <Text style={[styles.barValue, { color: themeColors.accent.primary }]}>
                              {chartData.polinizacionesData[index]}
                            </Text>
                          </View>

                          {/* Contenedor de barras */}
                          <View style={styles.barsContainer}>
                            {/* Barra de Germinaciones */}
                            <View style={styles.barWrapper}>
                              <View
                                style={[
                                  styles.bar,
                                  styles.barGerminacion,
                                  { height: `${Math.max(gerHeight, 5)}%` }
                                ]}
                              />
                            </View>

                            {/* Barra de Polinizaciones */}
                            <View style={styles.barWrapper}>
                              <View
                                style={[
                                  styles.bar,
                                  styles.barPolinizacion,
                                  { height: `${Math.max(polHeight, 5)}%` }
                                ]}
                              />
                            </View>
                          </View>

                          {/* Label del mes */}
                          <Text style={styles.barLabel}>{month}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Leyenda mejorada */}
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: themeColors.status.warning }]} />
                    <Text style={styles.legendText}>Germinaciones</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: themeColors.accent.primary }]} />
                    <Text style={styles.legendText}>Polinizaciones</Text>
                  </View>
                </View>

              </View>
              
              {/* Estadísticas del sistema */}
              <View style={styles.statsContainer}>
              </View>
            </View>

            {/* Actividad Reciente */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>Actividad Reciente</Text>
              </View>

              <View style={styles.activityList}>
                {/* Mostrar las últimas polinizaciones y germinaciones */}
                {itemCards.slice(0, 5).map((item, index) => {
                  const isGerminacion = item.type === 'germinacion';
                  const timeAgo = formatTimeAgo(item.date);
                  
                  return (
                    <View key={`activity-${index}`} style={styles.activityItem}>
                      <View style={[
                        styles.activityIcon, 
                        { backgroundColor: isGerminacion ? themeColors.primary.light : themeColors.accent.tertiary }
                      ]}>
                        <Ionicons 
                          name={isGerminacion ? "leaf" : "flower"} 
                          size={12} 
                          color={isGerminacion ? themeColors.primary.main : themeColors.accent.primary} 
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityItemTitle}>
                          {isGerminacion ? 'Nueva Germinación' : 'Nueva Polinización'}
                        </Text>
                        <Text style={styles.activityItemSubtitle}>
                          {item.title} • {item.subtitle} • {timeAgo}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                
                {/* Si no hay suficientes elementos, mostrar mensaje */}
                {itemCards.length === 0 && (
                  <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: themeColors.border.light }]}>
                      <Ionicons name="time-outline" size={12} color="#6b7280" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityItemTitle}>Sin actividad reciente</Text>
                      <Text style={styles.activityItemSubtitle}>
                        No hay registros recientes para mostrar
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </ResponsiveLayout>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>, isMobile: boolean = false) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.tertiary,
  },
  dashboardHeader: {
    paddingHorizontal: isMobile ? 16 : 20,
    paddingTop: isMobile ? 16 : 20,
    paddingBottom: isMobile ? 20 : 24,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: isMobile ? 16 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 20,
  },
  pageTitle: {
    fontSize: isMobile ? 24 : 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: colors.text.tertiary,
    marginBottom: 8,
    lineHeight: isMobile ? 20 : 24,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastUpdateText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  quickSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTextContainer: {
    alignItems: 'flex-start',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: isMobile ? 14 : 16,
    flex: 1,
    minWidth: isMobile ? 120 : 140,
    maxWidth: '48%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  metricCardPolinizaciones: {
  },
  metricCardGerminaciones: {
  },
  metricCardSuccess: {
  },
  metricCardPending: {
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  metricBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  metricProgress: {
    marginTop: 6,
  },
  metricProgressBar: {
    height: 5,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  metricProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricProgressText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  performanceSection: {
    paddingHorizontal: isMobile ? 16 : 20,
    marginBottom: 32,
  },
  performanceContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  performanceCard: {
    flex: isMobile ? 0 : 2,
    minWidth: isMobile ? '100%' : 400,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: isMobile ? 16 : 24,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
    overflow: 'hidden',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isMobile ? 16 : 24,
  },
  performanceTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  performanceSubtitle: {
    fontSize: isMobile ? 12 : 14,
    color: colors.text.tertiary,
  },
  yieldContainer: {
    alignItems: 'flex-end',
  },
  yieldTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  growthBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.status.success,
  },
  chartContainer: {
    marginBottom: isMobile ? 16 : 24,
  },
  chartWrapper: {
    backgroundColor: colors.background.primary,
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 12 : 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  barChartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: isMobile ? 140 : 160,
    paddingHorizontal: isMobile ? 4 : 8,
    marginBottom: isMobile ? 16 : 20,
    backgroundColor: colors.background.secondary,
    borderRadius: isMobile ? 8 : 12,
    paddingTop: isMobile ? 24 : 28,
    paddingBottom: isMobile ? 8 : 12,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValuesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isMobile ? 2 : 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: isMobile ? 9 : 11,
    fontWeight: '700',
    minWidth: isMobile ? 16 : 20,
    textAlign: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: isMobile ? 2 : 4,
    height: isMobile ? 80 : 100,
    width: '100%',
  },
  barWrapper: {
    flex: 1,
    maxWidth: isMobile ? 16 : 24,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: isMobile ? 3 : 4,
    minHeight: 4,
  },
  barGerminacion: {
    backgroundColor: colors.status.warning,
  },
  barPolinizacion: {
    backgroundColor: colors.accent.primary,
  },
  barLabel: {
    fontSize: isMobile ? 9 : 11,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isMobile ? 12 : 16,
    paddingTop: isMobile ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  summaryBox: {
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
  },
  summaryLabel: {
    fontSize: isMobile ? 11 : 12,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isMobile ? 8 : 16,
    marginBottom: isMobile ? 8 : 12,
  },
  chartLabel: {
    fontSize: isMobile ? 9 : 11,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isMobile ? 12 : 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 4 : 6,
  },
  legendDot: {
    width: isMobile ? 6 : 8,
    height: isMobile ? 6 : 8,
    borderRadius: isMobile ? 3 : 4,
  },
  legendText: {
    fontSize: isMobile ? 11 : 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  statsContainer: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: colors.text.tertiary,
    lineHeight: 14,
  },
  activityCard: {
    flex: isMobile ? 0 : 1,
    minWidth: isMobile ? '100%' : 250,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: isMobile ? 16 : 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMobile ? 16 : 20,
  },
  activityTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.status.success,
    fontWeight: '600',
  },
  activityList: {
    gap: isMobile ? 12 : 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
    borderRadius: isMobile ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  activityItemSubtitle: {
    fontSize: isMobile ? 11 : 12,
    color: colors.text.tertiary,
    lineHeight: isMobile ? 15 : 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.status.successLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.success,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statusCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 6,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitleContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalCount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: 40,
  },
  progressBarWrapper: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: colors.border.light,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  statusBreakdown: {
    gap: 12,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  activityCountBadge: {
    backgroundColor: colors.border.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityCountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
  },

  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
    backgroundColor: colors.background.secondary,
    padding: 4,
    borderRadius: 12,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'transparent',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: colors.background.primary,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.disabled,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  cardsContainer: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardType: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.text.tertiary,
    marginBottom: 16,
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.border.light,
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    opacity: 0.9,
  },
  cardDetails: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  alertasCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  alertasBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 32,
    alignItems: 'center',
  },
  alertasBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  alertasStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  alertasStat: {
    alignItems: 'center',
  },
  alertasStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  alertasStatLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  alertasFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  alertasFooterText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  alertasBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: 8,
  },
  alertasBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertasBreakdownText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  notificacionesDescription: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
    marginBottom: 12,
  },
});

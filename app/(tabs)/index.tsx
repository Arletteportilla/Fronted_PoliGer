import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Germinacion, Polinizacion } from '@/types';
import { TabNavigation } from '@/components/navigation';

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
          subtitle: `${pol.nueva_planta_genero || pol.planta_madre_genero || ''} ${pol.nueva_planta_especie || pol.planta_madre_especie || ''}`.trim() || 'Sin especie',
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

      console.log('📊 Home - Estadísticas recibidas:', estadisticasResponse);

      // Las estadísticas vienen en el formato: { total, por_estado: { CERRADA, ABIERTA, SEMIABIERTA } }
      const germinacionCounts = {
        ingresado: estadisticasResponse?.estadisticas?.por_estado?.SEMIABIERTA || 0,
        en_proceso: estadisticasResponse?.estadisticas?.por_estado?.ABIERTA || 0,
        completado: estadisticasResponse?.estadisticas?.por_estado?.CERRADA || 0,
        total: estadisticasResponse?.estadisticas?.total || 0
      };

      console.log('📊 Home - Contadores de germinación:', germinacionCounts);
      setGerminacionStats(germinacionCounts);

      // Obtener datos de polinizaciones
      const [germinacionesRecientesRaw, polinizacionesRaw, totalPolinizaciones] = await Promise.allSettled([
        germinacionService.getPaginated({ page: 1, page_size: 20 }),
        polinizacionService.getPaginated(1, 1000),
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

      console.log(`✅ Datos cargados: ${germinacionesRecientes.length} germinaciones recientes, ${polinizaciones.length} polinizaciones (total: ${totalPol})`);

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

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ingresado': return '#F59E0B';
      case 'en_proceso': return '#3B82F6';
      case 'completado': return '#10B981';
      default: return '#6B7280';
    }
  }, []);

  const renderStatusCard = useCallback((title: string, stats: StatusCounts, icon: string, color: string, onPress: () => void) => {
    if (!stats || typeof stats.total !== 'number') {
      return null;
    }

    // Calcular porcentajes
    const total = stats.total || 1; // Evitar división por cero
    const ingresadoPct = Math.round((stats.ingresado / total) * 100);
    const procesPct = Math.round((stats.en_proceso / total) * 100);
    const completadoPct = Math.round((stats.completado / total) * 100);

    return (
      <TouchableOpacity style={[styles.statusCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.statusHeader}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <View style={styles.statusTitleContainer}>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={styles.totalCount}>{stats.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Barra de progreso visual */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            {stats.ingresado > 0 && (
              <View style={[styles.progressSegment, {
                width: `${ingresadoPct}%`,
                backgroundColor: getStatusColor('ingresado')
              }]} />
            )}
            {stats.en_proceso > 0 && (
              <View style={[styles.progressSegment, {
                width: `${procesPct}%`,
                backgroundColor: getStatusColor('en_proceso')
              }]} />
            )}
            {stats.completado > 0 && (
              <View style={[styles.progressSegment, {
                width: `${completadoPct}%`,
                backgroundColor: getStatusColor('completado')
              }]} />
            )}
          </View>
        </View>

        <View style={styles.statusBreakdown}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('ingresado') }]} />
            <View style={styles.statusLabelContainer}>
              <Text style={styles.statusLabel}>Ingresado</Text>
              <Text style={styles.statusValue}>{stats.ingresado || 0} ({ingresadoPct}%)</Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('en_proceso') }]} />
            <View style={styles.statusLabelContainer}>
              <Text style={styles.statusLabel}>En Proceso</Text>
              <Text style={styles.statusValue}>{stats.en_proceso || 0} ({procesPct}%)</Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('completado') }]} />
            <View style={styles.statusLabelContainer}>
              <Text style={styles.statusLabel}>Completado</Text>
              <Text style={styles.statusValue}>{stats.completado || 0} ({completadoPct}%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
          <Ionicons name="arrow-forward" size={16} color={color} />
        </View>
      </TouchableOpacity>
    );
  }, [getStatusColor]);

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
              color={item.type === 'germinacion' ? '#10B981' : '#F59E0B'}
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
                    backgroundColor: '#fff'
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
        <ActivityIndicator size="large" color="#e9ad14" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TabNavigation currentTab="inicio" />

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
        {/* Header con resumen rápido */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSubtitle}>Vista general del sistema</Text>
          </View>
          {(germinacionStats.total > 0 || polinizacionStats.total > 0) && (
            <View style={styles.quickSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="leaf" size={20} color="#10B981" />
                <Text style={styles.summaryNumber}>{germinacionStats.total.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="flower" size={20} color="#F59E0B" />
                <Text style={styles.summaryNumber}>{polinizacionStats.total.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Estado General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="stats-chart" size={20} color="#111827" /> Estado General
          </Text>
          <View style={styles.statusGrid}>
            {germinacionStats && renderStatusCard(
              'Germinaciones',
              germinacionStats,
              'leaf-outline',
              '#10B981',
              () => router.push('/(tabs)/germinaciones')
            )}
            {polinizacionStats && renderStatusCard(
              'Polinizaciones',
              polinizacionStats,
              'flower-outline',
              '#F59E0B',
              () => router.push('/(tabs)/polinizaciones')
            )}
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="notifications" size={20} color="#111827" /> Notificaciones
          </Text>
          <TouchableOpacity
            style={[styles.alertasCard, { borderLeftColor: '#3B82F6' }]}
            onPress={() => router.push('/(tabs)/notificaciones')}
          >
            <View style={styles.alertasHeader}>
              <View style={styles.alertasInfo}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#3B82F6"
                />
                <Text style={styles.alertasTitle}>
                  Centro de Notificaciones
                </Text>
              </View>
            </View>

            <Text style={styles.notificacionesDescription}>
              Mantente informado sobre las actualizaciones importantes de germinaciones y polinizaciones
            </Text>

            <View style={styles.alertasFooter}>
              <Text style={styles.alertasFooterText}>
                Ver todas las notificaciones
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Actividades Recientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time" size={20} color="#111827" /> Actividades Recientes
          </Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' ? styles.filterTextActive : {}]}>
                Todas ({cardCounts.all})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'germinacion' && styles.filterTabActive]}
              onPress={() => setFilter('germinacion')}
            >
              <Ionicons name="leaf-outline" size={16} color={filter === 'germinacion' ? '#fff' : '#6B7280'} />
              <Text style={[styles.filterText, filter === 'germinacion' ? styles.filterTextActive : {}]}>
                Germinaciones ({cardCounts.germinacion})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'polinizacion' && styles.filterTabActive]}
              onPress={() => setFilter('polinizacion')}
            >
              <Ionicons name="flower-outline" size={16} color={filter === 'polinizacion' ? '#fff' : '#6B7280'} />
              <Text style={[styles.filterText, filter === 'polinizacion' ? styles.filterTextActive : {}]}>
                Polinizaciones ({cardCounts.polinizacion})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>
              {(() => {
                if (filter === 'all') {
                  return 'Todos los Procesos';
                } else if (filter === 'germinacion') {
                  return 'Germinaciones';
                } else {
                  return 'Polinizaciones';
                }
              })()}
            </Text>
            <View style={styles.activityCount}>
              <Text style={styles.activityCountText}>{filteredCards?.length || 0} registros</Text>
            </View>
          </View>

          {filteredCards && filteredCards.length > 0 ? (
            <FlatList
              data={filteredCards}
              renderItem={renderItemCard}
              keyExtractor={(item) => {
                if (!item || !item.id) return Math.random().toString();
                return item.id.toString();
              }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No hay elementos para mostrar</Text>
              <Text style={styles.emptyStateSubtext}>
                {(() => {
                  if (filter === 'all') {
                    return 'No hay procesos registrados';
                  } else if (filter === 'germinacion') {
                    return 'No hay germinaciones registradas';
                  } else {
                    return 'No hay polinizaciones registradas';
                  }
                })()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  quickSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 6,
    shadowColor: '#000',
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
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalCount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  progressBarWrapper: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#F3F4F6',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  activityCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#111827',
  },
  cardsContainer: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    opacity: 0.8,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  alertasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
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
    color: '#111827',
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
    color: '#fff',
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
    color: '#111827',
  },
  alertasStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  alertasFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  alertasFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertasBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  alertasBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertasBreakdownText: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificacionesDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
});

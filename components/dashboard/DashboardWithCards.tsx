import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet,ScrollView,ActivityIndicator,View,Text,TouchableOpacity,RefreshControl,FlatList, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGerminaciones } from '@/hooks/useGerminaciones';
import { polinizacionService } from '@/services/polinizacion.service';
import { TabNavigation } from '@/components/navigation';
import { DiagnosticPanel } from '@/components/dashboard';

// Types
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

interface Germinacion {
  id: number;
  codigo: string;
  nombre?: string;
  especie?: string;
  especie_variedad?: string;
  genero?: string;
  etapa_actual: string;
  fecha_siembra?: string;
  fecha_ingreso?: string;
  fecha_creacion?: string;
  responsable?: string | any;
  ubicacion?: string;
}

interface Polinizacion {
  id?: number;
  numero?: number;
  codigo?: string;
  nueva_planta_genero?: string;
  nueva_planta_especie?: string;
  planta_madre_genero?: string;
  planta_madre_especie?: string;
  fechapol?: string;
  fechamad?: string;
  responsable?: string | any;
  ubicacion?: string;
}

export const DashboardWithCards: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { germinaciones } = useGerminaciones(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'germinacion' | 'polinizacion'>('all');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Status data
  const [germinacionStats, setGerminacionStats] = useState<StatusCounts>({
    ingresado: 0,
    en_proceso: 0,
    completado: 0,
    total: 0
  });

  console.log('🔍 Dashboard render - germinaciones.length:', germinaciones?.length);
  console.log('🔍 Dashboard render - germinacionStats:', germinacionStats);
  const [polinizacionStats, setPolinizacionStats] = useState<StatusCounts>({
    ingresado: 0,
    en_proceso: 0,
    completado: 0,
    total: 0
  });
  const [itemCards, setItemCards] = useState<ItemCard[]>([]);


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
      if (pol.fechamad) {
        return 100; // Completado
      } else if (pol.fechapol) {
        return 70; // En proceso
      } else {
        return 30; // Ingresado
      }
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
    if (polinizacion.fechamad) {
      return 'Completado';
    } else if (polinizacion.fechapol) {
      return 'En Proceso';
    } else {
      return 'Ingresado';
    }
  }, []);

  const getPolinizacionStatusColor = useCallback((polinizacion: any) => {
    if (polinizacion.fechamad) {
      return '#10B981';
    } else if (polinizacion.fechapol) {
      return '#3B82F6';
    } else {
      return '#F59E0B';
    }
  }, []);

  const generateItemCards = useCallback((germinaciones: Germinacion[], polinizaciones: Polinizacion[]): ItemCard[] => {
    const cards: ItemCard[] = [];

    // Validar que los arrays existan
    const validGerminaciones = Array.isArray(germinaciones) ? germinaciones : [];
    const validPolinizaciones = Array.isArray(polinizaciones) ? polinizaciones : [];

    // Ordenar por fecha (más recientes primero) y tomar solo los últimos 5 de cada tipo
    const sortedGerminaciones = validGerminaciones
      .sort((a, b) => {
        const dateA = new Date(a.fecha_siembra || a.fecha_ingreso || a.fecha_creacion || new Date());
        const dateB = new Date(b.fecha_siembra || b.fecha_ingreso || b.fecha_creacion || new Date());
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5); // Solo los últimos 5

    const sortedPolinizaciones = validPolinizaciones
      .sort((a, b) => {
        const dateA = new Date(a.fechapol || new Date());
        const dateB = new Date(b.fechapol || new Date());
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5); // Solo los últimos 5

    console.log(`📊 Generando tarjetas: ${sortedGerminaciones.length} germinaciones, ${sortedPolinizaciones.length} polinizaciones`);

    // Generate germinacion cards
    sortedGerminaciones.forEach(ger => {
      if (ger && ger.id) {
        const progress = calculateProgress(ger, 'germinacion');
        
        cards.push({
          id: `ger-${ger.id}`,
          type: 'germinacion',
          title: ger.codigo || ger.nombre || `Germinación ${ger.id}`,
          subtitle: ger.especie || ger.especie_variedad || 'Sin especie',
          status: getGerminacionStatusLabel(ger.etapa_actual),
          statusColor: getGerminacionStatusColor(ger.etapa_actual),
          progress,
          date: ger.fecha_siembra || ger.fecha_ingreso || ger.fecha_creacion || '',
          responsable: typeof ger.responsable === 'object' && ger.responsable ? ger.responsable.username : ger.responsable,
          location: ger.ubicacion,
          item: ger
        });
      }
    });

    // Generate polinizacion cards
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

    // Sort by date (most recent first) - ya están ordenados, pero por si acaso
    return cards.sort((a, b) => {
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      return dateB.getTime() - dateA.getTime();
    });
  }, [calculateProgress, getGerminacionStatusColor, getGerminacionStatusLabel, getPolinizacionStatusColor, getPolinizacionStatusLabel]);

  const calculateGerminacionStats = useCallback((germinaciones: Germinacion[]): StatusCounts => {
    if (!Array.isArray(germinaciones)) {
      return { ingresado: 0, en_proceso: 0, completado: 0, total: 0 };
    }

    const stats = {
      ingresado: 0,
      en_proceso: 0,
      completado: 0,
      total: germinaciones.length
    };

    germinaciones.forEach(g => {
      if (g && g.etapa_actual) {
        switch (g.etapa_actual) {
          case 'INGRESADO':
            stats.ingresado++;
            break;
          case 'EN_PROCESO':
            stats.en_proceso++;
            break;
          case 'LISTA':
            stats.completado++;
            break;
        }
      }
    });

    return stats;
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener estadísticas reales de germinaciones desde el backend (no solo las 20 cargadas)
      const { germinacionService } = await import('@/services/germinacion.service');
      const estadisticasResponse = await germinacionService.getFilterOptions();

      console.log('📊 Dashboard - Estadísticas recibidas:', estadisticasResponse);

      // Las estadísticas vienen en el formato: { total, por_estado: { CERRADA, ABIERTA, SEMIABIERTA } }
      const germinacionCounts = {
        ingresado: estadisticasResponse?.estadisticas?.por_estado?.SEMIABIERTA || 0,
        en_proceso: estadisticasResponse?.estadisticas?.por_estado?.ABIERTA || 0,
        completado: estadisticasResponse?.estadisticas?.por_estado?.CERRADA || 0,
        total: estadisticasResponse?.estadisticas?.total || 0
      };

      console.log('📊 Dashboard - Contadores calculados:', germinacionCounts);
      setGerminacionStats(germinacionCounts);

      // Obtener polinizaciones
      const polinizacionesRaw = await polinizacionService.getPaginated(1, 1000);
      const polinizaciones = polinizacionesRaw?.results || polinizacionesRaw || [];

      const polinizacionCounts = calculatePolinizacionStats(polinizaciones);
      setPolinizacionStats(polinizacionCounts);

      // Para las tarjetas, usamos solo las germinaciones cargadas (últimas 20)
      const cards = generateItemCards(germinaciones, polinizaciones);
      setItemCards(cards);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [germinaciones, calculatePolinizacionStats, generateItemCards]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ingresado': return '#F59E0B';
      case 'en_proceso': return '#3B82F6';
      case 'completado': return '#10B981';
      default: return '#6B7280';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const renderStatusCard = useCallback((title: string, stats: StatusCounts, icon: string, color: string, onPress: () => void) => {
    // Validar que los datos estén disponibles
    if (!stats || typeof stats.total !== 'number') {
      return null;
    }

    return (
      <TouchableOpacity style={[styles.statusCard, { borderLeftColor: color }]} onPress={onPress}>
        <View style={styles.statusHeader}>
          <Ionicons name={icon as any} size={24} color={color} />
          <Text style={styles.statusTitle}>{title}</Text>
        </View>
        <Text style={styles.totalCount}>{stats.total}</Text>
        <View style={styles.statusBreakdown}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('ingresado') }]} />
            <Text style={styles.statusLabel}>Ingresado: {stats.ingresado || 0}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('en_proceso') }]} />
            <Text style={styles.statusLabel}>En Proceso: {stats.en_proceso || 0}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor('completado') }]} />
            <Text style={styles.statusLabel}>Completado: {stats.completado || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getStatusColor]);

  const renderItemCard = useCallback(({ item }: { item: ItemCard }) => {
    // Validar que el item tenga los datos necesarios
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
        {/* Header with type icon */}
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

        {/* Title and subtitle */}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>

        {/* Progress bar */}
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

        {/* Details */}
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

  // Memoizar las tarjetas filtradas para evitar recálculos innecesarios
  const filteredCards = useMemo(() => {
    if (!itemCards || itemCards.length === 0) return [];
    
    const validCards = itemCards.filter(card => {
      if (!card || !card.type || !card.id) return false;
      if (filter === 'all') return true;
      return card.type === filter;
    });
    
    return validCards;
  }, [itemCards, filter]);

  // Memoizar los contadores para evitar recálculos
  const cardCounts = useMemo(() => ({
    all: itemCards.length,
    germinacion: itemCards.filter(c => c.type === 'germinacion').length,
    polinizacion: itemCards.filter(c => c.type === 'polinizacion').length
  }), [itemCards]);

    useEffect(() => {
    const processData = async () => {
      setLoading(true);

      try {
        // Obtener estadísticas reales de germinaciones desde el backend
        const { germinacionService } = await import('@/services/germinacion.service');
        const estadisticasResponse = await germinacionService.getFilterOptions();

        console.log('📊 Dashboard (useEffect) - Estadísticas recibidas:', estadisticasResponse);

        // Las estadísticas vienen en el formato: { total, por_estado: { CERRADA, ABIERTA, SEMIABIERTA } }
        const germinacionCounts = {
          ingresado: estadisticasResponse?.estadisticas?.por_estado?.SEMIABIERTA || 0,
          en_proceso: estadisticasResponse?.estadisticas?.por_estado?.ABIERTA || 0,
          completado: estadisticasResponse?.estadisticas?.por_estado?.CERRADA || 0,
          total: estadisticasResponse?.estadisticas?.total || 0
        };

        console.log('📊 Dashboard (useEffect) - Contadores calculados:', germinacionCounts);
        setGerminacionStats(germinacionCounts);

        // Obtener polinizaciones
        const polinizacionesRaw = await polinizacionService.getPaginated(1, 1000);
        const polinizaciones = polinizacionesRaw?.results || polinizacionesRaw || [];

        const polinizacionCounts = calculatePolinizacionStats(polinizaciones);
        setPolinizacionStats(polinizacionCounts);

        // Para las tarjetas, usamos solo las germinaciones cargadas (últimas 20)
        const cards = generateItemCards(germinaciones, polinizaciones);
        setItemCards(cards);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [germinaciones, calculatePolinizacionStats, generateItemCards]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  // Mostrar panel de diagnóstico si está activado
  if (showDiagnostics) {
    return (
      <View style={styles.root}>
        <TabNavigation currentTab="dashboard" />
        <View style={styles.diagnosticsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowDiagnostics(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
            <Text style={styles.backButtonText}>Volver al Dashboard</Text>
          </TouchableOpacity>
        </View>
        <DiagnosticPanel />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Navegación con pestañas */}
      <TabNavigation currentTab="dashboard" />
      
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
      <Text style={styles.pageTitle}>Dashboard</Text>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
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

      {/* Filter tabs for item cards */}
      <View style={styles.section}>
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

        {/* Item Cards */}
        <Text style={styles.sectionTitle}>
          {(() => {
            if (filter === 'all') {
              return `Todos los Procesos (${filteredCards?.length || 0})`;
            } else if (filter === 'germinacion') {
              return `Germinaciones (${filteredCards?.length || 0})`;
            } else {
              return `Polinizaciones (${filteredCards?.length || 0})`;
            }
          })()}
        </Text>
        
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
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            getItemLayout={(data, index) => ({
              length: 200, // altura estimada de cada tarjeta
              offset: 200 * index,
              index,
            })}
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
};

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 10,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  totalCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statusBreakdown: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: '#F59E0B',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
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
  diagnosticButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  diagnosticButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  diagnosticButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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

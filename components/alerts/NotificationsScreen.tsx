import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Notification } from '@/types';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { NotificationFilters } from '@/services/notificaciones.service';
import AppColors from '@/utils/colors';
import { polinizacionService } from '@/services/polinizacion.service';
import { germinacionService } from '@/services/germinacion.service';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Usar los colores del sistema definidos en Colors.ts

// Tipos de filtros útiles para el usuario
const FILTER_TYPES = [
  { id: 'all', label: 'Todas', icon: 'albums-outline' },
  { id: 'unread', label: 'No Leídas', icon: 'mail-unread-outline' },
  { id: 'germinaciones', label: 'Germinaciones', icon: 'leaf-outline' },
  { id: 'polinizaciones', label: 'Polinizaciones', icon: 'flower-outline' },
  { id: 'RECORDATORIO_REVISION', label: 'Recordatorios', icon: 'time-outline' },
  { id: 'favoritas', label: 'Favoritas', icon: 'star-outline' },
];

interface NotificationDetailModalProps {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorita: (id: string) => void;
  onArchivar: (id: string) => void;
  onEliminar: (id: string) => void;
  onCambiarEstadoPolinizacion?: (id: number, estado: string) => Promise<void>;
  onCambiarEstadoGerminacion?: (id: number, estado: string) => Promise<void>;
  onRefreshNotifications?: () => Promise<void>;
}

function NotificationDetailModal({
  notification,
  visible,
  onClose,
  onToggleFavorita,
  onArchivar,
  onEliminar,
  onCambiarEstadoPolinizacion,
  onCambiarEstadoGerminacion,
  onRefreshNotifications,
}: NotificationDetailModalProps) {
  const colorScheme = useColorScheme();
  // Forzar modo claro
  const colors = Colors['light'];
  const isDark = false;

  if (!notification) return null;

  const getIcon = () => {
    // Usar el tipo original del backend si está disponible
    if (notification.tipo) {
      const iconMap: Record<string, string> = {
        'NUEVA_GERMINACION': 'leaf',
        'NUEVA_POLINIZACION': 'flower',
        'ESTADO_ACTUALIZADO': 'sync',
        'ESTADO_POLINIZACION_ACTUALIZADO': 'sync',
        'RECORDATORIO_REVISION': 'time',
        'ERROR': 'close-circle',
        'MENSAJE': 'chatbubble',
        'ACTUALIZACION': 'arrow-down-circle',
      };
      return iconMap[notification.tipo] || 'information-circle';
    }
    // Fallback al tipo visual
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10B981'; // Verde para éxito
      case 'warning':
        return '#F59E0B'; // Amarillo/naranja para advertencia
      case 'error':
        return '#EF4444'; // Rojo para error
      default:
        return colors.accent; // Usar el color accent del sistema
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons name={getIcon() as any} size={24} color={getColor()} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {notification.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalTimestamp, { color: colors.tabIconDefault }]}>
            Recibido el: {formatDate(notification.timestamp)}
          </Text>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              {notification.message}
            </Text>

            {notification.detalles && (
              <View style={styles.detailsContainer}>
                {Object.entries(notification.detalles).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>
                      {key}:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Acciones Rápidas para Polinizaciones/Germinaciones */}
          {(notification.germinacion_id || notification.polinizacion_id) && (
            <View style={styles.quickActionsContainer}>
              <Text style={[styles.quickActionsTitle, { color: colors.text }]}>
                Acciones Rápidas
              </Text>
              <View style={styles.quickActionsButtons}>
                {notification.polinizacion_id && onCambiarEstadoPolinizacion && (
                  <>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
                      onPress={async () => {
                        try {
                          await onCambiarEstadoPolinizacion(notification.polinizacion_id!, 'LISTA');
                          onClose();
                        } catch (error) {
                          console.error('Error cambiando estado:', error);
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <View>
                        <Text style={styles.quickActionText}>Marcar Lista</Text>
                        <Text style={styles.quickActionSubtext}>Registra fecha de hoy</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: '#3B82F6' }]}
                      onPress={async () => {
                        try {
                          await onCambiarEstadoPolinizacion(notification.polinizacion_id!, 'EN_PROCESO');
                          onClose();
                        } catch (error) {
                          console.error('Error cambiando estado:', error);
                        }
                      }}
                    >
                      <Ionicons name="time" size={20} color="#fff" />
                      <Text style={styles.quickActionText}>En Proceso</Text>
                    </TouchableOpacity>
                  </>
                )}
                {notification.germinacion_id && onCambiarEstadoGerminacion && (
                  <>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]}
                      onPress={async () => {
                        try {
                          await germinacionService.actualizarProgresoGerminacion(notification.germinacion_id!, 25);
                          if (onRefreshNotifications) await onRefreshNotifications();
                          onClose();
                        } catch (error) {
                          console.error('Error actualizando progreso:', error);
                        }
                      }}
                    >
                      <Ionicons name="hourglass-outline" size={20} color="#fff" />
                      <View>
                        <Text style={styles.quickActionText}>25% Progreso</Text>
                        <Text style={styles.quickActionSubtext}>Estado: En Proceso</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: '#3B82F6' }]}
                      onPress={async () => {
                        try {
                          await germinacionService.actualizarProgresoGerminacion(notification.germinacion_id!, 60);
                          if (onRefreshNotifications) await onRefreshNotifications();
                          onClose();
                        } catch (error) {
                          console.error('Error actualizando progreso:', error);
                        }
                      }}
                    >
                      <Ionicons name="time" size={20} color="#fff" />
                      <View>
                        <Text style={styles.quickActionText}>60% Progreso</Text>
                        <Text style={styles.quickActionSubtext}>Estado: En Proceso</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
                      onPress={async () => {
                        try {
                          await germinacionService.actualizarProgresoGerminacion(notification.germinacion_id!, 100);
                          if (onRefreshNotifications) await onRefreshNotifications();
                          onClose();
                        } catch (error) {
                          console.error('Error actualizando progreso:', error);
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <View>
                        <Text style={styles.quickActionText}>100% Finalizado</Text>
                        <Text style={styles.quickActionSubtext}>Registra fecha de hoy</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onToggleFavorita(notification.id);
              }}
            >
              <Ionicons
                name={notification.favorita ? 'star' : 'star-outline'}
                size={20}
                color={notification.favorita ? '#fbbf24' : colors.tabIconDefault}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onArchivar(notification.id);
                onClose();
              }}
            >
              <Ionicons
                name="archive-outline"
                size={20}
                color={colors.tabIconDefault}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onEliminar(notification.id);
                onClose();
              }}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function NotificationsScreen() {
  const colorScheme = useColorScheme();
  // Forzar modo claro
  const colors = Colors['light'];
  const isDark = false;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filters: NotificationFilters = useMemo(() => {
    const filter: NotificationFilters = {};

    // Mapear filtros especiales a parámetros del backend
    switch (activeFilter) {
      case 'all':
        // Sin filtros adicionales
        break;
      case 'unread':
        filter.leida = false;
        break;
      case 'favoritas':
        filter.favorita = true;
        break;
      case 'germinaciones':
        // El backend solo soporta filtrar por un tipo específico
        // Vamos a filtrar por NUEVA_GERMINACION como tipo principal
        filter.tipo = 'NUEVA_GERMINACION';
        break;
      case 'polinizaciones':
        filter.tipo = 'NUEVA_POLINIZACION';
        break;
      case 'RECORDATORIO_REVISION':
        filter.tipo = 'RECORDATORIO_REVISION';
        break;
      default:
        // Si es un tipo directo del backend, usarlo
        filter.tipo = activeFilter;
    }

    if (searchQuery.trim()) {
      filter.search = searchQuery.trim();
    }

    return filter;
  }, [activeFilter, searchQuery]);

  const {
    notifications,
    loading,
    error,
    stats,
    markAsRead,
    markAllAsRead,
    toggleFavorita,
    archivar,
    eliminar,
    selectNotification,
    refreshing,
    onRefresh,
    fetchNotifications,
  } = useNotificaciones(filters);

  // Refrescar cuando cambian los filtros
  React.useEffect(() => {
    fetchNotifications(filters);
  }, [activeFilter, searchQuery]);

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailModalVisible(true);
    selectNotification(notification);
  };

  const handleCambiarEstadoPolinizacion = async (id: number, estado: string) => {
    try {
      await polinizacionService.cambiarEstado(id, estado as any);
      // Refrescar notificaciones después del cambio
      await fetchNotifications(filters);
      console.log('✅ Estado de polinización actualizado');
    } catch (error) {
      console.error('❌ Error actualizando estado de polinizacion:', error);
      throw error;
    }
  };

  const handleCambiarEstadoGerminacion = async (id: number, estado: string) => {
    try {
      await germinacionService.cambiarEstadoGerminacion(id, estado as 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO');
      // Refrescar notificaciones después del cambio
      await fetchNotifications(filters);
      console.log('✅ Estado de germinación actualizado');
    } catch (error) {
      console.error('❌ Error actualizando estado de germinación:', error);
      throw error;
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    // Usar el tipo original del backend si está disponible
    if (notification.tipo) {
      const iconMap: Record<string, string> = {
        'NUEVA_GERMINACION': 'leaf',
        'NUEVA_POLINIZACION': 'flower',
        'ESTADO_ACTUALIZADO': 'sync',
        'ESTADO_POLINIZACION_ACTUALIZADO': 'sync',
        'RECORDATORIO_REVISION': 'time',
        'ERROR': 'close-circle',
        'MENSAJE': 'chatbubble',
        'ACTUALIZACION': 'arrow-down-circle',
      };
      return iconMap[notification.tipo] || 'information-circle';
    }
    // Fallback al tipo visual
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10B981'; // Verde para éxito
      case 'warning':
        return '#F59E0B'; // Amarillo/naranja para advertencia
      case 'error':
        return '#EF4444'; // Rojo para error
      default:
        return colors.accent; // Usar el color accent del sistema
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    }
    if (diffInMinutes < 2880) return 'Ayer';
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} días`;
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isSelected = selectedNotification?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isSelected ? '#f3f4f6' : colors.background,
            borderLeftWidth: 4,
            borderLeftColor: getNotificationColor(item.type),
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons
            name={getNotificationIcon(item) as any}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                {
                  color: colors.text,
                  fontWeight: item.isRead ? '500' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.notificationTimestamp, { color: colors.tabIconDefault }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <Text
            style={[styles.notificationMessage, { color: colors.tabIconDefault }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
        {item.favorita && (
          <Ionicons name="star" size={16} color="#fbbf24" style={styles.favoriteIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color={colors.tabIconDefault} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No hay notificaciones
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.tabIconDefault }]}>
        {searchQuery || activeFilter !== 'all'
          ? 'No se encontraron notificaciones con los filtros aplicados'
          : 'Cuando recibas notificaciones, aparecerán aquí'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: '#e5e7eb' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notificaciones
          </Text>
          {stats && (
            <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
              Mostrando {notifications.length} de {stats.total}
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar notificaciones..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_TYPES.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive ? colors.accent : '#f3f4f6',
                  },
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={18}
                  color={isActive ? '#ffffff' : colors.tabIconDefault}
                />
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: isActive ? '#ffffff' : colors.tabIconDefault,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : styles.listContainer}
          style={styles.list}
        />
      )}

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedNotification(null);
        }}
        onToggleFavorita={toggleFavorita}
        onArchivar={archivar}
        onEliminar={eliminar}
        onCambiarEstadoPolinizacion={handleCambiarEstadoPolinizacion}
        onCambiarEstadoGerminacion={handleCambiarEstadoGerminacion}
        onRefreshNotifications={async () => await fetchNotifications(filters)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  filtersContainer: {
    maxHeight: 60,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accent,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTimestamp: {
    fontSize: 12,
    marginBottom: 16,
  },
  modalBody: {
    maxHeight: 400,
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    padding: 12,
    marginLeft: 12,
  },
  quickActionsContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickActionSubtext: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 6,
    opacity: 0.8,
  },
});


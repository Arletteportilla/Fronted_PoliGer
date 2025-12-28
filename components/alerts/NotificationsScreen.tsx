import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/types';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { NotificationFilters } from '@/services/notificaciones.service';
import { useTheme } from '@/contexts/ThemeContext';

// Usar los colores del sistema definidos en Colors.ts

interface NotificationDetailModalProps {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorita: (id: string) => void;
}

function NotificationDetailModal({
  notification,
  visible,
  onClose,
  onToggleFavorita,
}: NotificationDetailModalProps) {
  const { colors: themeColors } = useTheme();
  const modalStyles = createModalStyles(themeColors);
  
  if (!notification) return null;

  const getIconInfo = () => {
    // Usar el tipo original del backend si está disponible
    if (notification.tipo) {
      const iconMap: Record<string, { icon: string; color: string; bgColor: string }> = {
        'NUEVA_GERMINACION': { icon: 'leaf', color: themeColors.status.success, bgColor: themeColors.status.successLight },
        'NUEVA_POLINIZACION': { icon: 'flower', color: themeColors.accent.secondary, bgColor: themeColors.status.infoLight },
        'ESTADO_ACTUALIZADO': { icon: 'sync', color: themeColors.accent.tertiary, bgColor: themeColors.status.infoLight },
        'ESTADO_POLINIZACION_ACTUALIZADO': { icon: 'sync', color: themeColors.accent.tertiary, bgColor: themeColors.status.infoLight },
        'RECORDATORIO_REVISION': { icon: 'time', color: themeColors.module.germinacion.primary, bgColor: themeColors.module.germinacion.light },
        'ERROR': { icon: 'close-circle', color: themeColors.status.error, bgColor: themeColors.status.errorLight },
        'MENSAJE': { icon: 'chatbubble', color: themeColors.accent.secondary, bgColor: themeColors.status.infoLight },
        'ACTUALIZACION': { icon: 'arrow-down-circle', color: themeColors.status.warning, bgColor: themeColors.status.warningLight },
      };
      return iconMap[notification.tipo] || { icon: 'information-circle', color: themeColors.text.tertiary, bgColor: themeColors.background.tertiary };
    }
    // Fallback al tipo visual
    switch (notification.type) {
      case 'success':
        return { icon: 'checkmark-circle', color: themeColors.status.success, bgColor: themeColors.status.successLight };
      case 'warning':
        return { icon: 'warning', color: themeColors.status.warning, bgColor: themeColors.status.warningLight };
      case 'error':
        return { icon: 'close-circle', color: themeColors.status.error, bgColor: themeColors.status.errorLight };
      default:
        return { icon: 'information-circle', color: themeColors.text.tertiary, bgColor: themeColors.background.tertiary };
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  const iconInfo = getIconInfo();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={modalStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={modalStyles.modalContentWrapper}>
          <TouchableOpacity 
            style={modalStyles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          {/* Header con icono grande */}
          <View style={modalStyles.modalHeaderSection}>
            <View style={[modalStyles.modalIconContainer, { backgroundColor: iconInfo.bgColor }]}>
              <Ionicons name={iconInfo.icon as any} size={40} color={iconInfo.color} />
            </View>
            
            <TouchableOpacity onPress={onClose} style={modalStyles.modalCloseButton}>
              <Ionicons name="close" size={24} color={themeColors.text.disabled} />
            </TouchableOpacity>
          </View>

          {/* Título y tiempo */}
          <View style={modalStyles.modalTitleSection}>
            <View style={modalStyles.modalTitleRow}>
              <Text style={[modalStyles.modalTitleText, { color: themeColors.text.primary }]}>{notification.title}</Text>
              {!notification.isRead && (
                <View style={[modalStyles.modalUnreadBadge, { backgroundColor: themeColors.status.success }]}>
                  <Text style={modalStyles.modalUnreadBadgeText}>Nueva</Text>
                </View>
              )}
            </View>
            <View style={[modalStyles.modalTimeContainer, { backgroundColor: themeColors.background.secondary }]}>
              <Ionicons name="time-outline" size={14} color={themeColors.text.disabled} />
              <Text style={[modalStyles.modalTimeText, { color: themeColors.text.tertiary }]}>{formatTimeAgo(notification.timestamp)}</Text>
            </View>
          </View>

          {/* Mensaje */}
          <ScrollView style={modalStyles.modalBodySection} showsVerticalScrollIndicator={false}>
            <Text style={[modalStyles.modalMessageText, { color: themeColors.text.secondary }]}>{notification.message}</Text>

            {/* Detalles adicionales */}
            {notification.detalles &&
             notification.tipo !== 'NUEVA_POLINIZACION' &&
             notification.tipo !== 'ESTADO_POLINIZACION_ACTUALIZADO' && (
              <View style={[modalStyles.modalDetailsSection, { backgroundColor: themeColors.background.secondary }]}>
                <Text style={[modalStyles.modalDetailsTitle, { color: themeColors.text.primary }]}>Detalles adicionales</Text>
                {Object.entries(notification.detalles)
                  .filter(([key, value]) =>
                    !['polinizacion_id', 'germinacion_id'].includes(key) &&
                    value !== null &&
                    value !== undefined &&
                    value !== '' &&
                    value !== 'N/A'
                  )
                  .map(([key, value]) => (
                    <View key={key} style={modalStyles.modalDetailItem}>
                      <View style={[modalStyles.modalDetailDot, { backgroundColor: themeColors.status.success }]} />
                      <View style={modalStyles.modalDetailContent}>
                        <Text style={[modalStyles.modalDetailKey, { color: themeColors.text.tertiary }]}>{key}</Text>
                        <Text style={[modalStyles.modalDetailValue, { color: themeColors.text.primary }]}>{String(value)}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Fecha completa */}
            <View style={[modalStyles.modalDateSection, { borderTopColor: themeColors.border.light }]}>
              <Ionicons name="calendar-outline" size={16} color={themeColors.text.disabled} />
              <Text style={[modalStyles.modalDateText, { color: themeColors.text.disabled }]}>{formatDate(notification.timestamp)}</Text>
            </View>
          </ScrollView>

          {/* Acciones */}
          <View style={modalStyles.modalActionsSection}>
            <TouchableOpacity
              style={[
                modalStyles.modalActionButton,
                { backgroundColor: notification.favorita ? themeColors.status.warning : themeColors.status.success },
              ]}
              onPress={() => onToggleFavorita(notification.id)}
            >
              <Ionicons
                name={notification.favorita ? 'star' : 'star-outline'}
                size={20}
                color={themeColors.text.inverse}
              />
              <Text style={[
                modalStyles.modalActionButtonText,
                { color: themeColors.text.inverse }
              ]}>
                {notification.favorita ? 'Favorita' : 'Marcar favorita'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function NotificationsScreen() {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  const [searchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedNotificationForModal, setSelectedNotificationForModal] = useState<Notification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

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
        // Filtrar por todas las notificaciones relacionadas con germinaciones
        filter.categoria = 'germinacion';
        break;
      case 'polinizaciones':
        // Filtrar por todas las notificaciones relacionadas con polinizaciones
        filter.categoria = 'polinizacion';
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
    markAllAsRead,
    toggleFavorita,
    selectNotification,
    refreshing,
    onRefresh,
  } = useNotificaciones(filters);

  const handleNotificationPress = async (notification: Notification) => {
    setSelectedNotificationForModal(notification);
    setDetailModalVisible(true);
    // Marcar como leída automáticamente al abrir
    await selectNotification(notification);
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



  const renderModernNotificationItem = (notification: Notification) => {
    const getIconByType = () => {
      if (notification.tipo === 'NUEVA_GERMINACION' || notification.message.toLowerCase().includes('germinación')) {
        return { name: 'warning', color: themeColors.status.error, bgColor: themeColors.status.errorLight };
      }
      if (notification.tipo === 'NUEVA_POLINIZACION' || notification.message.toLowerCase().includes('polinización')) {
        return { name: 'document-text', color: themeColors.accent.secondary, bgColor: themeColors.status.infoLight };
      }
      if (notification.message.toLowerCase().includes('rrhh') || notification.message.toLowerCase().includes('evaluación')) {
        return { name: 'chatbubble-ellipses', color: themeColors.status.success, bgColor: themeColors.status.successLight };
      }
      if (notification.message.toLowerCase().includes('mantenimiento') || notification.message.toLowerCase().includes('actualizado')) {
        return { name: 'construct', color: themeColors.text.tertiary, bgColor: themeColors.background.secondary };
      }
      if (notification.message.toLowerCase().includes('política') || notification.message.toLowerCase().includes('cambio')) {
        return { name: 'information-circle', color: themeColors.text.tertiary, bgColor: themeColors.background.secondary };
      }
      return { name: 'notifications', color: themeColors.text.tertiary, bgColor: themeColors.background.secondary };
    };

    const iconInfo = getIconByType();
    const timeAgo = formatTimestamp(notification.timestamp);

    return (
      <TouchableOpacity
        key={notification.id}
        style={styles.modernNotificationItem}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={[styles.modernIconContainer, { backgroundColor: iconInfo.bgColor }]}>
          <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
        </View>
        
        <View style={styles.modernNotificationContent}>
          <View style={styles.modernNotificationHeader}>
            <Text style={styles.modernNotificationTitle}>{notification.title}</Text>
            <Text style={styles.modernNotificationTime}>{timeAgo}</Text>
          </View>
          
          <Text style={styles.modernNotificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.modernNotificationActions}>
            {notification.message.toLowerCase().includes('seguridad') && (
              <TouchableOpacity style={styles.actionButtonRed}>
                <Text style={styles.actionButtonRedText}>Revisar Logs</Text>
              </TouchableOpacity>
            )}
            {notification.message.toLowerCase().includes('solicitud') && (
              <TouchableOpacity style={styles.actionButtonGreen}>
                <Text style={styles.actionButtonGreenText}>Ver Solicitud</Text>
              </TouchableOpacity>
            )}
            {notification.message.toLowerCase().includes('documento') && (
              <TouchableOpacity style={styles.actionButtonGreen}>
                <Text style={styles.actionButtonGreenText}>Leer documento adjunto</Text>
              </TouchableOpacity>
            )}
            {(notification.message.toLowerCase().includes('seguridad') || 
              notification.message.toLowerCase().includes('solicitud') || 
              notification.message.toLowerCase().includes('documento')) && (
              <TouchableOpacity style={styles.actionButtonGray}>
                <Text style={styles.actionButtonGrayText}>Descartar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      {/* Overlay para cerrar el menú */}
      {filterMenuVisible && (
        <TouchableOpacity 
          style={styles.filterMenuOverlay}
          activeOpacity={1}
          onPress={() => setFilterMenuVisible(false)}
        />
      )}
      
      {/* Header */}
      <View style={styles.modernHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.modernTitle}>Centro de Notificaciones</Text>
            <Text style={styles.modernSubtitle}>
              Gestiona tus alertas y actualizaciones del sistema de forma eficiente.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={() => markAllAsRead()}
          >
            <Ionicons name="checkmark-done" size={16} color={themeColors.status.success} />
            <Text style={[styles.markAllText, { color: themeColors.status.success }]}>Marcar todo como leído</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'all' && styles.activeFilterTabText]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, styles.unreadTab, activeFilter === 'unread' && styles.activeUnreadTab]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text style={[styles.filterTabText, styles.unreadTabText, activeFilter === 'unread' && styles.activeUnreadTabText]}>
              No leídos
            </Text>
            {stats && stats.no_leidas > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{stats.no_leidas}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterButton,
              (activeFilter !== 'all' && activeFilter !== 'unread') && styles.filterButtonActive
            ]}
            onPress={() => setFilterMenuVisible(!filterMenuVisible)}
          >
            <Ionicons 
              name={filterMenuVisible ? "funnel" : "funnel-outline"} 
              size={16} 
              color={(activeFilter !== 'all' && activeFilter !== 'unread') ? themeColors.status.success : themeColors.text.tertiary} 
            />
            <Text style={[
              styles.filterButtonText,
              (activeFilter !== 'all' && activeFilter !== 'unread') && styles.filterButtonTextActive
            ]}>
              Filtrar
            </Text>
            {(activeFilter !== 'all' && activeFilter !== 'unread') && (
              <View style={styles.filterButtonIndicator} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Menu Dropdown - Moved outside header */}
      {filterMenuVisible && (
        <View style={styles.filterMenu}>
          <View style={styles.filterMenuHeader}>
            <Text style={styles.filterMenuTitle}>Filtrar por</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'all' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('all');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.status.warningLight }]}>
              <Ionicons name="albums" size={18} color={themeColors.status.warning} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'all' && styles.filterMenuTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'unread' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('unread');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.status.infoLight }]}>
              <Ionicons name="mail-unread" size={18} color={themeColors.accent.secondary} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'unread' && styles.filterMenuTextActive]}>
              No Leídas
            </Text>
            {stats && stats.no_leidas > 0 && (
              <View style={styles.filterMenuBadge}>
                <Text style={styles.filterMenuBadgeText}>{stats.no_leidas}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.filterMenuDivider} />

          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'germinaciones' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('germinaciones');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.status.successLight }]}>
              <Ionicons name="leaf" size={18} color={themeColors.status.success} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'germinaciones' && styles.filterMenuTextActive]}>
              Germinaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'polinizaciones' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('polinizaciones');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.status.infoLight }]}>
              <Ionicons name="flower" size={18} color={themeColors.accent.secondary} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'polinizaciones' && styles.filterMenuTextActive]}>
              Polinizaciones
            </Text>
          </TouchableOpacity>

          <View style={styles.filterMenuDivider} />

          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'RECORDATORIO_REVISION' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('RECORDATORIO_REVISION');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.module.germinacion.light }]}>
              <Ionicons name="time" size={18} color={themeColors.module.germinacion.primary} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'RECORDATORIO_REVISION' && styles.filterMenuTextActive]}>
              Recordatorios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterMenuItem, activeFilter === 'favoritas' && styles.filterMenuItemActive]}
            onPress={() => {
              setActiveFilter('favoritas');
              setFilterMenuVisible(false);
            }}
          >
            <View style={[styles.filterMenuIcon, { backgroundColor: themeColors.status.warningLight }]}>
              <Ionicons name="star" size={18} color={themeColors.status.warning} />
            </View>
            <Text style={[styles.filterMenuText, activeFilter === 'favoritas' && styles.filterMenuTextActive]}>
              Favoritas
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.status.success} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={themeColors.status.error} />
          <Text style={[styles.errorText, { color: themeColors.status.error }]}>{error}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.notificationsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.status.success} />}
        >
          {/* Today Section */}
          {notifications.some(n => formatTimestamp(n.timestamp).includes('Ahora') || formatTimestamp(n.timestamp).includes('m') || formatTimestamp(n.timestamp).includes('h')) && (
            <>
              <Text style={styles.sectionTitle}>HOY</Text>
              <View style={styles.notificationsGroup}>
                {notifications
                  .filter(n => formatTimestamp(n.timestamp).includes('Ahora') || formatTimestamp(n.timestamp).includes('m') || formatTimestamp(n.timestamp).includes('h'))
                  .map((notification) => renderModernNotificationItem(notification))}
              </View>
            </>
          )}

          {/* Yesterday Section */}
          {notifications.some(n => formatTimestamp(n.timestamp).includes('Ayer') || formatTimestamp(n.timestamp).includes('días')) && (
            <>
              <Text style={styles.sectionTitle}>AYER</Text>
              <View style={styles.notificationsGroup}>
                {notifications
                  .filter(n => formatTimestamp(n.timestamp).includes('Ayer') || formatTimestamp(n.timestamp).includes('días'))
                  .map((notification) => renderModernNotificationItem(notification))}
              </View>
            </>
          )}

          {/* Load More */}
          <TouchableOpacity style={styles.loadMoreButton}>
            <Ionicons name="refresh-outline" size={16} color={themeColors.text.tertiary} />
            <Text style={styles.loadMoreText}>Cargar notificaciones anteriores</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotificationForModal}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedNotificationForModal(null);
        }}
        onToggleFavorita={toggleFavorita}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modernHeader: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    overflow: 'visible',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modernTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  modernSubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    lineHeight: 24,
    maxWidth: '70%',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.background.tertiary,
  },
  activeFilterTab: {
    backgroundColor: colors.accent.primary,
  },
  unreadTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeUnreadTab: {
    backgroundColor: colors.status.success,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  unreadTabText: {
    color: colors.text.tertiary,
  },
  activeUnreadTabText: {
    color: colors.text.inverse,
  },
  unreadBadge: {
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    color: colors.status.success,
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    gap: 6,
    marginLeft: 'auto',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.status.successLight,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.status.success,
    fontWeight: '700',
  },
  filterButtonIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  filterMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.modal,
    zIndex: 9998,
  },
  filterMenu: {
    position: 'absolute',
    top: 140,
    right: 24,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    paddingVertical: 8,
    minWidth: 240,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 9999,
  },
  filterMenuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginBottom: 4,
  },
  filterMenuTitle: {
    fontSize: 13,
    color: colors.text.disabled,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filterMenuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  filterMenuItemActive: {
    backgroundColor: colors.status.successLight,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  filterMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterMenuText: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  filterMenuTextActive: {
    color: colors.status.success,
    fontWeight: '700',
  },
  filterMenuBadge: {
    backgroundColor: colors.accent.secondary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    shadowColor: colors.accent.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterMenuBadgeText: {
    fontSize: 12,
    color: colors.text.inverse,
    fontWeight: '800',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: colors.text.disabled,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 32,
    marginBottom: 16,
  },
  notificationsGroup: {
    gap: 1,
  },
  modernNotificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success,
    alignItems: 'flex-start',
    gap: 16,
  },
  modernIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernNotificationContent: {
    flex: 1,
  },
  modernNotificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modernNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  modernNotificationTime: {
    fontSize: 12,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  modernNotificationMessage: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
    marginBottom: 12,
  },
  modernNotificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonRed: {
    backgroundColor: colors.status.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonRedText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonGreen: {
    backgroundColor: colors.status.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonGreenText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonGray: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonGrayText: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 32,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
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
    borderColor: colors.border.default,
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
  filterButtonOld: {
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
    shadowColor: colors.shadow.color,
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
    backgroundColor: colors.accent.primary,
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
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeaderSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalUnreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTimeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBodySection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: 400,
  },
  modalMessageText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetailsSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  modalDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  modalDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
    marginTop: 8,
  },
  modalDetailContent: {
    flex: 1,
  },
  modalDetailKey: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  modalDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 12,
  },
  modalDateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalActionsSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionButtonPrimary: {
    backgroundColor: colors.status.success,
  },
  modalActionButtonFavorite: {
    backgroundColor: colors.status.warning,
  },
  modalActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalActionButtonTextPrimary: {
    color: colors.text.inverse,
  },
  modalActionButtonTextFavorite: {
    color: colors.text.inverse,
  },
});

const createModalStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeaderSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  modalUnreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  modalBodySection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: 400,
  },
  modalMessageText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text.secondary,
  },
  modalDetailsSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: colors.background.secondary,
  },
  modalDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.text.primary,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  modalDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  modalDetailContent: {
    flex: 1,
  },
  modalDetailKey: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text.tertiary,
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  modalDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: 12,
  },
  modalDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.disabled,
  },
  modalActionsSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});


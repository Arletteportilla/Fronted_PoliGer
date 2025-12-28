import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notification.service';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

export interface PerfilNotificacionesTabProps {
  // Props para cambiar estado de germinaciones y polinizaciones
  onChangeStatusGerminacion?: (item: any) => void;
  onChangeStatusPolinizacion?: (item: any) => void;
}

export function PerfilNotificacionesTab({
  onChangeStatusGerminacion,
  onChangeStatusPolinizacion
}: PerfilNotificacionesTabProps) {
  const {
    notifications,
    loading,
    refreshing,
    stats,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationTypeLabel,
    getNotificationIcon,
    getNotificationColor,
  } = useNotifications();

  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  // Función auxiliar para recargar notificaciones
  const reloadNotifications = async () => {
    await fetchNotifications({
      solo_propias: true,
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived
    });
  };

  // Wrapper para cambio de estado que recarga notificaciones
  const handleChangeStatusGerminacion = async (notificationData: any) => {
    if (onChangeStatusGerminacion) {
      // Obtener datos actuales de la germinación desde el backend
      const { germinacionService } = await import('@/services/germinacion.service');
      try {
        const germinacionActual = await germinacionService.getById(notificationData.id);
        await onChangeStatusGerminacion(germinacionActual);
        // Recargar notificaciones después de cambiar el estado
        await reloadNotifications();
      } catch (error) {
        console.error('Error obteniendo germinación actual:', error);
        // Fallback: usar los datos de la notificación
        await onChangeStatusGerminacion(notificationData);
        await reloadNotifications();
      }
    }
  };

  const handleChangeStatusPolinizacion = async (notificationData: any) => {
    if (onChangeStatusPolinizacion) {
      // Obtener datos actuales de la polinización desde el backend
      const { polinizacionService } = await import('@/services/polinizacion.service');
      try {
        const polinizacionActual = await polinizacionService.getById(notificationData.numero);
        await onChangeStatusPolinizacion(polinizacionActual);
        // Recargar notificaciones después de cambiar el estado
        await reloadNotifications();
      } catch (error) {
        console.error('Error obteniendo polinización actual:', error);
        // Fallback: usar los datos de la notificación
        await onChangeStatusPolinizacion(notificationData);
        await reloadNotifications();
      }
    }
  };

  // Cargar notificaciones del usuario actual al montar el componente
  useEffect(() => {
    fetchNotifications({
      solo_propias: true,
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived
    });
  }, []);

  const handleRefresh = async () => {
    await refreshNotifications({
      solo_no_leidas: showOnlyUnread,
      incluir_archivadas: includeArchived,
      solo_propias: true  // Siempre mostrar solo las notificaciones del usuario actual en el perfil
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      Alert.alert('Éxito', `${result.count} notificaciones marcadas como leídas`);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron marcar las notificaciones como leídas');
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.leida) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marcando como leída:', error);
      }
    }
  };


  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.leida) return false;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.professionalTableContainer}>
      {/* Encabezado */}
      <View style={styles.tableHeaderSection}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.professionalTableTitle}>
            Mis Notificaciones
          </Text>
          <Text style={styles.professionalTableSubtitle}>
            {stats.total} notificaciones • {stats.noLeidas} sin leer
          </Text>
        </View>
        
        {/* Botones de acción */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {stats.noLeidas > 0 && (
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: Colors.light.accent }]}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
              <Text style={[styles.exportButtonText, { color: '#FFFFFF' }]}>
                Marcar todas leídas
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showOnlyUnread && styles.filterButtonActive
          ]}
          onPress={() => {
            setShowOnlyUnread(!showOnlyUnread);
            refreshNotifications({
              solo_no_leidas: !showOnlyUnread,
              incluir_archivadas: includeArchived
            });
          }}
        >
          <Ionicons 
            name={showOnlyUnread ? "radio-button-on" : "radio-button-off"} 
            size={16} 
            color={showOnlyUnread ? Colors.light.accent : "#6B7280"} 
          />
          <Text style={[
            styles.filterButtonText,
            showOnlyUnread && styles.filterButtonTextActive
          ]}>
            Solo no leídas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            includeArchived && styles.filterButtonActive
          ]}
          onPress={() => {
            setIncludeArchived(!includeArchived);
            refreshNotifications({
              solo_no_leidas: showOnlyUnread,
              incluir_archivadas: !includeArchived
            });
          }}
        >
          <Ionicons 
            name={includeArchived ? "checkbox" : "checkbox-outline"} 
            size={16} 
            color={includeArchived ? Colors.light.accent : "#6B7280"} 
          />
          <Text style={[
            styles.filterButtonText,
            includeArchived && styles.filterButtonTextActive
          ]}>
            Incluir archivadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de notificaciones */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.listEmptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#6B7280" />
          <Text style={styles.listEmptyText}>
            {showOnlyUnread ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
          </Text>
          <Text style={styles.emptySubtext}>
            {showOnlyUnread 
              ? 'Todas las notificaciones han sido leídas' 
              : 'Las notificaciones aparecerán aquí cuando se generen'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={{ padding: 16, gap: 12 }}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onChangeStatusGerminacion={handleChangeStatusGerminacion}
                onChangeStatusPolinizacion={handleChangeStatusPolinizacion}
                getNotificationTypeLabel={getNotificationTypeLabel}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                showUserInfo={false}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// Componente para mostrar una notificación individual
interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onChangeStatusGerminacion?: (item: any) => void;
  onChangeStatusPolinizacion?: (item: any) => void;
  getNotificationTypeLabel: (tipo: string) => string;
  getNotificationIcon: (tipo: string) => string;
  getNotificationColor: (tipo: string) => string;
  showUserInfo: boolean;
}

function NotificationCard({
  notification,
  onPress,
  onChangeStatusGerminacion,
  onChangeStatusPolinizacion,
  getNotificationTypeLabel,
  getNotificationIcon,
  getNotificationColor,
  showUserInfo
}: NotificationCardProps) {
  const iconName = getNotificationIcon(notification.tipo);
  const color = getNotificationColor(notification.tipo);
  const typeLabel = getNotificationTypeLabel(notification.tipo);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.leida && styles.notificationCardUnread
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Indicador de no leída */}
      {!notification.leida && (
        <View style={[styles.unreadIndicator, { backgroundColor: color }]} />
      )}

      <View style={styles.notificationContent}>
        {/* Header */}
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTypeContainer}>
            <View style={[styles.notificationIcon, { backgroundColor: `${color}20` }]}>
              <Ionicons name={iconName as any} size={16} color={color} />
            </View>
            <Text style={[styles.notificationTypeText, { color }]}>
              {typeLabel}
            </Text>
          </View>
        </View>

        {/* Título */}
        <Text style={[
          styles.notificationTitle,
          !notification.leida && styles.notificationTitleUnread
        ]}>
          {notification.titulo}
        </Text>

        {/* Mensaje */}
        <Text style={styles.notificationMessage} numberOfLines={3}>
          {notification.mensaje}
        </Text>

        {/* Barra de progreso por etapas para germinaciones y polinizaciones */}
        {notification.detalles_adicionales?.estado && (
          <View style={{
            marginTop: 8,
            marginBottom: 4,
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            paddingVertical: 4
          }}>
            <EstadoProgressBar
              estadoActual={notification.detalles_adicionales.estado as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
              tipo={notification.germinacion ? 'germinacion' : 'polinizacion'}
            />
          </View>
        )}

        {/* Footer */}
        <View style={styles.notificationFooter}>
          <View style={styles.notificationMeta}>
            {showUserInfo && (
              <Text style={styles.notificationUser}>
                {notification.usuario.first_name} {notification.usuario.last_name} (@{notification.usuario.username})
              </Text>
            )}
            <Text style={styles.notificationDate}>
              {formatDate(notification.fecha_creacion)}
            </Text>
          </View>

          {(notification.germinacion_codigo || notification.polinizacion_codigo) && (
            <View style={styles.notificationReference}>
              <Ionicons name="link-outline" size={12} color="#6B7280" />
              <Text style={styles.notificationReferenceText}>
                {notification.germinacion_codigo || notification.polinizacion_codigo}
              </Text>
            </View>
          )}
        </View>

        {/* Botón de cambiar estado para germinaciones y polinizaciones */}
        {notification.germinacion && onChangeStatusGerminacion && (
          <TouchableOpacity
            style={[styles.statusButton, { marginTop: 8 }]}
            onPress={() => onChangeStatusGerminacion({ id: notification.germinacion })}
          >
            <Ionicons name="sync-outline" size={14} color={Colors.light.tint} />
            <Text style={styles.statusButtonText}>Cambiar Estado</Text>
          </TouchableOpacity>
        )}
        {notification.polinizacion && onChangeStatusPolinizacion && (
          <TouchableOpacity
            style={[styles.statusButton, { marginTop: 8 }]}
            onPress={() => onChangeStatusPolinizacion({ numero: notification.polinizacion })}
          >
            <Ionicons name="sync-outline" size={14} color={Colors.light.tint} />
            <Text style={styles.statusButtonText}>Cambiar Estado</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

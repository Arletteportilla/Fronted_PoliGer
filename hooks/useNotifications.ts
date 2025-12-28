import { useState, useCallback, useEffect } from 'react';
import { notificationService, type Notification, type NotificationStats } from '@/services/notification.service';
import { usePermissions } from './usePermissions';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminStats, setAdminStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isAdmin } = usePermissions();

  const fetchNotifications = useCallback(async (params: {
    solo_no_leidas?: boolean;
    incluir_archivadas?: boolean;
    solo_propias?: boolean;  // Forzar solo notificaciones del usuario actual (para perfil)
  } = {}) => {
    setLoading(true);
    try {
      console.log('🔔 useNotifications.fetchNotifications - Iniciando carga');

      const response = await notificationService.getNotifications(params);
      
      // Manejar respuesta según si es admin o usuario normal
      if (Array.isArray(response)) {
        // Usuario normal - respuesta directa como array
        setNotifications(response);
        setAdminStats(null);
        console.log('👤 Usuario normal - Notificaciones cargadas:', response.length);
      } else {
        // Administrador - respuesta con estadísticas
        setNotifications(response.notificaciones || []);
        setAdminStats(response.estadisticas_admin || null);
        console.log('👑 Administrador - Notificaciones cargadas:', {
          notificaciones: response.notificaciones?.length || 0,
          estadisticas: response.estadisticas_admin
        });
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      setNotifications([]);
      setAdminStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async (params: {
    solo_no_leidas?: boolean;
    incluir_archivadas?: boolean;
    solo_propias?: boolean;
  } = {}) => {
    setRefreshing(true);
    try {
      await fetchNotifications(params);
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, leida: true, fecha_lectura: new Date().toISOString() }
            : notification
        )
      );
      
      // Actualizar estadísticas de admin si existen
      if (adminStats) {
        setAdminStats(prev => prev ? {
          ...prev,
          no_leidas: Math.max(0, prev.no_leidas - 1)
        } : null);
      }
      
      console.log('✅ Notificación marcada como leída localmente');
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      throw error;
    }
  }, [adminStats]);

  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          leida: true,
          fecha_lectura: new Date().toISOString()
        }))
      );
      
      // Actualizar estadísticas de admin
      if (adminStats) {
        setAdminStats(prev => prev ? {
          ...prev,
          no_leidas: 0
        } : null);
      }
      
      console.log('✅ Todas las notificaciones marcadas como leídas localmente');
      return result;
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }, [adminStats]);

  const toggleFavorite = useCallback(async (notificationId: number) => {
    try {
      const result = await notificationService.toggleFavorite(notificationId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, favorita: result.favorita }
            : notification
        )
      );
      
      console.log('✅ Estado de favorita actualizado localmente');
      return result;
    } catch (error) {
      console.error('❌ Error cambiando estado de favorita:', error);
      throw error;
    }
  }, []);

  const archive = useCallback(async (notificationId: number) => {
    try {
      await notificationService.archive(notificationId);
      
      // Remover de la lista local (ya que las archivadas no se muestran por defecto)
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Actualizar estadísticas de admin
      if (adminStats) {
        const notification = notifications.find(n => n.id === notificationId);
        setAdminStats(prev => prev ? {
          ...prev,
          total_notificaciones: Math.max(0, prev.total_notificaciones - 1),
          no_leidas: notification && !notification.leida ? Math.max(0, prev.no_leidas - 1) : prev.no_leidas
        } : null);
      }
      
      console.log('✅ Notificación archivada y removida localmente');
    } catch (error) {
      console.error('❌ Error archivando notificación:', error);
      throw error;
    }
  }, [adminStats, notifications]);

  // Cargar notificaciones al montar el hook
  // Por defecto NO carga automáticamente, debe llamarse fetchNotifications manualmente
  // useEffect(() => {
  //   fetchNotifications();
  // }, [fetchNotifications]);

  // Estadísticas calculadas
  const stats = {
    total: notifications.length,
    noLeidas: notifications.filter(n => !n.leida).length,
    favoritas: notifications.filter(n => n.favorita).length,
    porTipo: notifications.reduce((acc, n) => {
      acc[n.tipo] = (acc[n.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    isAdmin: isAdmin(),
    adminStats
  };

  return {
    // Estados
    notifications,
    loading,
    refreshing,
    stats,

    // Funciones
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    toggleFavorite,
    archive,

    // Utilidades
    getNotificationTypeLabel: notificationService.getNotificationTypeLabel,
    getNotificationIcon: notificationService.getNotificationIcon,
    getNotificationColor: notificationService.getNotificationColor,
  };
}
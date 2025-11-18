import { useState, useEffect, useCallback } from 'react';
import { notificacionesService, NotificationFilters, NotificationStats } from '@/services/notificaciones.service';
import { Notification } from '@/types';

export function useNotificaciones(filters?: NotificationFilters) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);

  const fetchNotifications = useCallback(async (currentFilters?: NotificationFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = currentFilters || filters || {};
      const data = await notificacionesService.getNotificaciones(filtersToUse);
      setNotifications(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al obtener las notificaciones');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await notificacionesService.getEstadisticas();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchStats]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificacionesService.marcarComoLeida(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (selectedNotification) {
        setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const toggleFavorita = async (notificationId: string) => {
    try {
      const newFavorita = await notificacionesService.toggleFavorita(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, favorita: newFavorita } : n))
      );
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => prev ? { ...prev, favorita: newFavorita } : null);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const archivar = async (notificationId: string) => {
    try {
      await notificacionesService.archivar(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Error archiving:', err);
    }
  };

  const eliminar = async (notificationId: string) => {
    try {
      await notificacionesService.eliminar(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const selectNotification = async (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  return {
    notifications,
    selectedNotification,
    loading,
    error,
    stats,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    toggleFavorita,
    archivar,
    eliminar,
    selectNotification,
    refreshing,
    onRefresh,
  };
}

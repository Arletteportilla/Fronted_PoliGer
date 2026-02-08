import { useState, useEffect, useCallback } from 'react';
import { notificacionesService, NotificationFilters, NotificationStats } from '@/services/notificaciones.service';
import { Notification } from '@/types';
import { logger } from '@/services/logger';

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
      logger.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [notifs, statsData] = await Promise.all([
        notificacionesService.getNotificaciones(filters || {}),
        notificacionesService.getEstadisticas()
      ]);
      setNotifications(notifs);
      setStats(statsData);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al obtener las notificaciones');
      logger.error('Error refreshing notifications:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  // Initial fetch and fetch when filters change
  // Use JSON.stringify to avoid infinite loops caused by object reference changes
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [notifs, statsData] = await Promise.all([
          notificacionesService.getNotificaciones(filters || {}),
          notificacionesService.getEstadisticas()
        ]);

        if (isMounted) {
          setNotifications(notifs);
          setStats(statsData);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.error || 'Error al obtener las notificaciones');
          logger.error('Error fetching notifications:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Polling interval - only for Navbar badge updates
  useEffect(() => {
    // Only poll if we're filtering for unread notifications (Navbar use case)
    const shouldPoll = filters?.leida === false && !filters.tipo && !filters.search;

    if (!shouldPoll) {
      return;
    }

    // Poll every 60 seconds (1 minute) for unread notifications
    const pollInterval = setInterval(async () => {
      try {
        const statsData = await notificacionesService.getEstadisticas();
        setStats(statsData);
      } catch (err) {
        logger.error('Error polling stats:', err);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [filters?.leida, filters?.tipo, filters?.search]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificacionesService.marcarComoLeida(notificationId);

      // Si estamos filtrando por no leídas, eliminar la notificación de la lista
      if (filters?.leida === false) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        // Si no, solo actualizar el estado
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
      }

      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
      }

      // Actualizar las estadísticas
      try {
        const statsData = await notificacionesService.getEstadisticas();
        setStats(statsData);
      } catch (statsErr) {
        logger.error('Error updating stats:', statsErr);
      }
    } catch (err) {
      logger.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();

      // Si estamos filtrando por no leídas, limpiar la lista completa
      if (filters?.leida === false) {
        setNotifications([]);
      } else {
        // Si no, solo actualizar el estado
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }

      if (selectedNotification) {
        setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
      }

      // Actualizar las estadísticas
      try {
        const statsData = await notificacionesService.getEstadisticas();
        setStats(statsData);
      } catch (statsErr) {
        logger.error('Error updating stats:', statsErr);
      }
    } catch (err) {
      logger.error('Error marking all as read:', err);
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
      logger.error('Error toggling favorite:', err);
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
      logger.error('Error archiving:', err);
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
      logger.error('Error deleting:', err);
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

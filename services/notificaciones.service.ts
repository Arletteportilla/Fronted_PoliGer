import api from './api';
import { Notification } from '@/types';
import { logger } from '@/services/logger';

// Mapeo de tipos del backend al frontend
const mapNotificationType = (tipo: string): 'info' | 'success' | 'warning' | 'error' => {
  const tipoMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    'NUEVA_GERMINACION': 'success',
    'NUEVA_POLINIZACION': 'success',
    'ESTADO_ACTUALIZADO': 'info',
    'ESTADO_POLINIZACION_ACTUALIZADO': 'info',
    'RECORDATORIO_REVISION': 'warning',
    'ERROR': 'error',
    'MENSAJE': 'info',
    'ACTUALIZACION': 'info',
  };
  return tipoMap[tipo] || 'info';
};

// Mapeo de tipos del backend a iconos
export const getNotificationIconByType = (tipo: string): string => {
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
  return iconMap[tipo] || 'information-circle';
};

// Convertir notificación del backend al formato del frontend
const mapNotification = (data: any): Notification => {
  return {
    id: data.id.toString(),
    title: data.titulo,
    message: data.mensaje,
    timestamp: data.fecha_creacion,
    isRead: data.leida,
    type: mapNotificationType(data.tipo),
    favorita: data.favorita || false,
    archivada: data.archivada || false,
    detalles: data.detalles_adicionales,
    tipo: data.tipo,
    tipoDisplay: data.tipo_display || data.tipo,
    germinacion_id: data.detalles_adicionales?.germinacion_id,
    polinizacion_id: data.detalles_adicionales?.polinizacion_id,
  };
};

export interface NotificationFilters {
  tipo?: string;
  leida?: boolean;
  favorita?: boolean;
  archivada?: boolean;
  search?: string;
  categoria?: string;  // 'germinacion' o 'polinizacion'
}

export interface NotificationStats {
  total: number;
  no_leidas: number;
  favoritas: number;
  archivadas: number;
  usuarios_con_notificaciones?: number;
  es_admin?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  adminStats?: NotificationStats;
}

export const notificacionesService = {
  /**
   * Obtiene las notificaciones del usuario
   */
  getNotificaciones: async (filters?: NotificationFilters): Promise<Notification[]> => {
    try {
      const params = new URLSearchParams();

      // Filtros específicos del backend
      if (filters?.leida === false) {
        params.append('solo_no_leidas', 'true');
      }
      if (filters?.archivada === true) {
        params.append('incluir_archivadas', 'true');
      }
      if (filters?.favorita === true) {
        params.append('favorita', 'true');
      }
      if (filters?.tipo) {
        params.append('tipo', filters.tipo);
      }
      if (filters?.categoria) {
        params.append('categoria', filters.categoria);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const url = params.toString()
        ? `notifications/?${params.toString()}`
        : 'notifications/';

      logger.info('🔔 Obteniendo notificaciones con filtros:', filters, '| URL:', url);

      const response = await api.get(url);

      // El backend puede devolver:
      // - Un array directo para usuarios normales
      // - Un objeto con { notificaciones: [], estadisticas_admin: {} } para admins
      // - Un objeto paginado con { results: [] }
      let results = response.data;

      if (response.data.notificaciones) {
        // Caso admin: extraer el array de notificaciones
        results = response.data.notificaciones;
      } else if (response.data.results) {
        // Caso paginación
        results = response.data.results;
      } else if (!Array.isArray(response.data)) {
        // Si no es ninguno de los casos anteriores y no es array, devolver vacío
        results = [];
      }

      const notifications = Array.isArray(results) ? results.map(mapNotification) : [];
      logger.success(' Notificaciones obtenidas:', notifications.length);

      return notifications;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene una notificación específica
   */
  getNotificacion: async (id: string): Promise<Notification> => {
    try {
      const response = await api.get(`notifications/${id}/`);
      return mapNotification(response.data);
    } catch (error) {
      console.error('❌ Error obteniendo notificación:', error);
      throw error;
    }
  },

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida: async (id: string): Promise<void> => {
    try {
      await api.post(`notifications/${id}/marcar-leida/`);
      logger.success(' Notificación marcada como leída');
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      throw error;
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas: async (): Promise<number> => {
    try {
      const response = await api.post('notifications/marcar-todas-leidas/');
      logger.success(' Todas las notificaciones marcadas como leídas:', response.data);
      return response.data.count || 0;
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
      throw error;
    }
  },

  /**
   * Marca/desmarca una notificación como favorita
   */
  toggleFavorita: async (id: string): Promise<boolean> => {
    try {
      const response = await api.post(`notifications/${id}/toggle-favorita/`);
      logger.success(' Estado de favorita cambiado:', response.data.favorita);
      return response.data.favorita;
    } catch (error) {
      console.error('❌ Error cambiando favorita:', error);
      throw error;
    }
  },

  /**
   * Archiva una notificación
   */
  archivar: async (id: string): Promise<void> => {
    try {
      await api.post(`notifications/${id}/archivar/`);
      logger.success(' Notificación archivada');
    } catch (error) {
      console.error('❌ Error archivando notificación:', error);
      throw error;
    }
  },

  /**
   * Elimina una notificación
   */
  eliminar: async (id: string): Promise<void> => {
    try {
      await api.delete(`notifications/${id}/`);
      logger.success(' Notificación eliminada');
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de notificaciones
   */
  getEstadisticas: async (): Promise<NotificationStats> => {
    try {
      const response = await api.get('notifications/estadisticas/');
      logger.success(' Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtiene alertas pendientes (germinaciones y polinizaciones próximas a vencer)
   */
  getAlertas: async (): Promise<any[]> => {
    try {
      const response = await api.get('notifications/alertas/');
      logger.success(' Alertas obtenidas:', response.data);
      return response.data.alertas || [];
    } catch (error) {
      console.error('❌ Error obteniendo alertas:', error);
      throw error;
    }
  },
};

import api from './api';
import { logger } from '@/services/logger';

export interface NotificationUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Notification {
  id: number;
  usuario: NotificationUser;
  germinacion?: number;
  polinizacion?: number;
  germinacion_codigo?: string;
  polinizacion_codigo?: string;
  tipo: 'NUEVA_GERMINACION' | 'RECORDATORIO_REVISION' | 'ESTADO_ACTUALIZADO' | 
        'NUEVA_POLINIZACION' | 'ESTADO_POLINIZACION_ACTUALIZADO' | 'MENSAJE' | 'ERROR' | 'ACTUALIZACION';
  titulo: string;
  mensaje: string;
  leida: boolean;
  favorita: boolean;
  archivada: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
  detalles_adicionales?: any;
}

export interface NotificationStats {
  total_notificaciones: number;
  no_leidas: number;
  usuarios_con_notificaciones: number;
  es_admin: boolean;
}

export interface NotificationResponse {
  notificaciones?: Notification[];
  estadisticas_admin?: NotificationStats;
}

class NotificationService {
  /**
   * Obtiene las notificaciones del usuario actual o todas si es admin
   */
  async getNotifications(params: {
    solo_no_leidas?: boolean;
    incluir_archivadas?: boolean;
    solo_propias?: boolean;  // Forzar solo las notificaciones del usuario actual (útil para perfil)
  } = {}): Promise<Notification[] | NotificationResponse> {
    try {

      const queryParams: any = {};
      if (params.solo_no_leidas) {
        queryParams.solo_no_leidas = 'true';
      }
      if (params.incluir_archivadas) {
        queryParams.incluir_archivadas = 'true';
      }
      if (params.solo_propias) {
        queryParams.solo_propias = 'true';
      }

      const response = await api.get('notifications/', {
        params: queryParams
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.post(`notifications/${notificationId}/marcar-leida/`);
    } catch (error: any) {
      logger.error('❌ Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ count: number }> {
    try {
      const response = await api.post('notifications/marcar-todas-leidas/');
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Marca/desmarca una notificación como favorita
   */
  async toggleFavorite(notificationId: number): Promise<{ favorita: boolean }> {
    try {
      
      const response = await api.post(`notifications/${notificationId}/toggle-favorita/`);
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cambiando estado de favorita:', error);
      throw error;
    }
  }

  /**
   * Archiva una notificación
   */
  async archive(notificationId: number): Promise<void> {
    try {
      
      await api.post(`notifications/${notificationId}/archivar/`);
      
    } catch (error: any) {
      logger.error('❌ Error archivando notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getStats(): Promise<any> {
    try {
      
      const response = await api.get('notifications/estadisticas/');
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas pendientes
   */
  async getAlerts(): Promise<any> {
    try {
      
      const response = await api.get('notifications/alertas/');
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo alertas:', error);
      throw error;
    }
  }

  /**
   * Obtiene registros pendientes de revisión
   */
  async getPendingRecords(dias: number = 5): Promise<any> {
    try {
      
      const response = await api.get('notifications/registros-pendientes/', {
        params: { dias }
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo registros pendientes:', error);
      throw error;
    }
  }

  /**
   * Obtiene el tipo de notificación en español
   */
  getNotificationTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'NUEVA_GERMINACION': 'Nueva Germinación',
      'RECORDATORIO_REVISION': 'Recordatorio de Revisión',
      'ESTADO_ACTUALIZADO': 'Estado Actualizado',
      'NUEVA_POLINIZACION': 'Nueva Polinización',
      'ESTADO_POLINIZACION_ACTUALIZADO': 'Estado de Polinización Actualizado',
      'MENSAJE': 'Mensaje',
      'ERROR': 'Error',
      'ACTUALIZACION': 'Actualización'
    };
    
    return labels[tipo] || tipo;
  }

  /**
   * Obtiene el icono para un tipo de notificación
   */
  getNotificationIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'NUEVA_GERMINACION': 'leaf',
      'RECORDATORIO_REVISION': 'time',
      'ESTADO_ACTUALIZADO': 'refresh',
      'NUEVA_POLINIZACION': 'flower',
      'ESTADO_POLINIZACION_ACTUALIZADO': 'sync',
      'MENSAJE': 'mail',
      'ERROR': 'alert-circle',
      'ACTUALIZACION': 'information-circle'
    };
    
    return icons[tipo] || 'notifications';
  }

  /**
   * Obtiene el color para un tipo de notificación
   */
  getNotificationColor(tipo: string): string {
    const colors: Record<string, string> = {
      'NUEVA_GERMINACION': '#10B981',
      'RECORDATORIO_REVISION': '#F59E0B',
      'ESTADO_ACTUALIZADO': '#3B82F6',
      'NUEVA_POLINIZACION': '#8B5CF6',
      'ESTADO_POLINIZACION_ACTUALIZADO': '#06B6D4',
      'MENSAJE': '#6B7280',
      'ERROR': '#EF4444',
      'ACTUALIZACION': '#10B981'
    };
    
    return colors[tipo] || '#6B7280';
  }
}

export const notificationService = new NotificationService();
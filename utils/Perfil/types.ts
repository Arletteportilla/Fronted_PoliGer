// Tipos de pestañas
export type TabType = 'resumen' | 'polinizaciones' | 'germinaciones' | 'alertas' | 'notificaciones' | 'usuarios';

// Interfaces para datos
export interface Alerta {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  prioridad: string;
  prediccion?: any;
  entityType?: 'germinacion' | 'polinizacion';
  entityId?: number;
  currentStatus?: string;
  actions?: { label: string; value: string; color: string }[];
}

export interface Notificacion {
  id: number;
  tipo: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  fecha: string;
  leida: boolean;
  prioridad: string;
  icono: string;
  color: string;
  detalles?: any;
}

// Más interfaces según sea necesario...
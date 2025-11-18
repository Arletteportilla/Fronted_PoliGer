/**
 * Tipos compartidos para la funcionalidad de exportación
 */

export type ExportFormat = 'excel' | 'pdf';
export type ExportEntity = 'germinaciones' | 'polinizaciones' | 'ambos';
export type IncludeStats = 'si' | 'no';

export interface ExportFilters {
  tipo?: ExportEntity;
  fecha_inicio: string;
  fecha_fin: string;
  formato: ExportFormat;
  estadisticas?: string;
  [key: string]: any; // Permite filtros adicionales específicos
}

export interface ExportConfig {
  // Configuración básica
  entityType: ExportEntity;
  supportedFormats: ExportFormat[];
  defaultFormat: ExportFormat;

  // Opciones
  allowStatsToggle: boolean;
  allowEntitySelection: boolean;

  // Callback para manejar la exportación
  onExport: (filters: ExportFilters) => Promise<void>;
}

export interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  config: ExportConfig;
  initialDates?: {
    fechaInicio: string;
    fechaFin: string;
  };
}

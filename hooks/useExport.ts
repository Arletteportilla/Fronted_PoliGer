import { useState } from 'react';
import { Platform } from 'react-native';
import type { ExportFilters, ExportFormat, ExportEntity, IncludeStats } from '@/types/export.types';
import { reportesService } from '@/services/reportes.service';
import { API_CONFIG, buildApiUrl } from '@/config/api';
import { logger } from '@/services/logger';

interface UseExportOptions {
  defaultEntity?: ExportEntity;
  defaultFormat?: ExportFormat;
  defaultIncludeStats?: IncludeStats;
  defaultFechaInicio?: string;
  defaultFechaFin?: string;
}

export const useExport = (options: UseExportOptions = {}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [tipoEntidad, setTipoEntidad] = useState<ExportEntity>(
    options.defaultEntity || 'germinaciones'
  );
  const [formatoReporte, setFormatoReporte] = useState<ExportFormat>(
    options.defaultFormat || 'excel'
  );
  const [incluirEstadisticas, setIncluirEstadisticas] = useState<IncludeStats>(
    options.defaultIncludeStats || 'si'
  );
  const [fechaInicio, setFechaInicio] = useState(
    options.defaultFechaInicio || new Date().toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(
    options.defaultFechaFin || new Date().toISOString().split('T')[0]
  );

  /**
   * Valida las fechas de exportación
   */
  const validateDates = (): boolean => {
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin');
      return false;
    }
    return true;
  };

  /**
   * Construye los filtros de exportación
   */
  const buildFilters = (): ExportFilters => {
    return {
      tipo: tipoEntidad,
      fecha_inicio: fechaInicio || '',
      fecha_fin: fechaFin || '',
      formato: formatoReporte,
      estadisticas: incluirEstadisticas === 'si' ? 'true' : 'false',
    };
  };

  /**
   * Exporta para plataforma web
   */
  const exportForWeb = async (filtros: ExportFilters): Promise<void> => {
    const params = new URLSearchParams(filtros as any).toString();
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTES.ESTADISTICAS}?${params}`);

    // Obtener token de autenticación
    const token = localStorage.getItem('authToken');

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error('No se pudo descargar el archivo');
    }

    const blob = await response.blob();
    const tipoReporte = incluirEstadisticas === 'si' ? 'con_estadisticas_y_graficos' : 'solo_datos';
    const filename = `reporte_${tipoEntidad}_${tipoReporte}_${filtros.fecha_inicio}_${filtros.fecha_fin}.${formatoReporte === 'excel' ? 'xlsx' : 'pdf'}`;

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Exporta para plataforma móvil
   */
  const exportForMobile = async (filtros: ExportFilters): Promise<void> => {
    // Si es PDF de germinaciones sin estadísticas, usar endpoint optimizado
    if (tipoEntidad === 'germinaciones' && formatoReporte === 'pdf' && incluirEstadisticas === 'no') {
      logger.info('📄 Usando endpoint optimizado para PDF de germinaciones...');
      await reportesService.descargarPDFGerminaciones(filtros['search']);
      return;
    }

    // Para otros casos, usar el endpoint con estadísticas
    await reportesService.generarReporteConEstadisticas(
      tipoEntidad,
      formatoReporte,
      filtros
    );
  };

  /**
   * Ejecuta la exportación
   */
  const executeExport = async (): Promise<void> => {
    if (!validateDates()) {
      return;
    }

    setIsExporting(true);

    try {
      const filtros = buildFilters();

      if (Platform.OS === 'web') {
        await exportForWeb(filtros);
      } else {
        await exportForMobile(filtros);
      }

      const mensaje = incluirEstadisticas === 'si'
        ? 'Exportación completada con estadísticas y gráficos dinámicos.'
        : 'Exportación completada con datos únicamente.';

      alert(mensaje);
    } catch (error) {
      logger.error('Error exportando reporte:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la exportación';
      alert(`Error al exportar reporte: ${errorMessage}`);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Resetea los filtros a valores por defecto
   */
  const resetFilters = () => {
    setTipoEntidad(options.defaultEntity || 'germinaciones');
    setFormatoReporte(options.defaultFormat || 'excel');
    setIncluirEstadisticas(options.defaultIncludeStats || 'si');
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setFechaFin(new Date().toISOString().split('T')[0]);
  };

  return {
    // Estado
    isExporting,
    tipoEntidad,
    formatoReporte,
    incluirEstadisticas,
    fechaInicio,
    fechaFin,

    // Setters
    setTipoEntidad,
    setFormatoReporte,
    setIncluirEstadisticas,
    setFechaInicio,
    setFechaFin,

    // Métodos
    executeExport,
    resetFilters,
    validateDates,
  };
};

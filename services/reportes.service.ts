import api from './api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from '@/services/secureStore';
import { API_CONFIG, buildApiUrl, getDownloadHeaders } from '@/config/api';
import { logger } from '@/services/logger';
import { Platform } from 'react-native';

// Helper function para descargar en web usando axios
const downloadFileWeb = async (url: string, fileName: string, token: string) => {
  try {
    const response = await api.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf',
      },
      responseType: 'blob',
    });

    // Verificar que la respuesta sea válida
    const contentType = response.headers['content-type'] || response.headers['Content-Type'];
    logger.info(`Content-Type recibido: ${contentType}, tamaño: ${response.data.size} bytes`);

    // Si el content-type es JSON, significa que el backend devolvió un error
    if (contentType && contentType.includes('application/json')) {
      // Leer el blob como texto para obtener el mensaje de error
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || errorData.error || 'Error del servidor');
    }

    // Determinar el tipo MIME basado en la extensión del archivo
    const mimeType = fileName.endsWith('.pdf')
      ? 'application/pdf'
      : fileName.endsWith('.xlsx')
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/octet-stream';

    // Verificar que el tamaño del archivo sea razonable (mayor a 100 bytes)
    if (response.data.size < 100) {
      logger.error(`Archivo demasiado pequeño: ${response.data.size} bytes`);
      throw new Error('El archivo descargado parece estar corrupto o vacío');
    }

    logger.info(`Descargando archivo: ${fileName}, tipo: ${mimeType}, tamaño: ${response.data.size} bytes`);

    // Crear blob con el tipo MIME correcto
    const blob = new Blob([response.data], { type: mimeType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
    logger.error(`Error en descarga:`, errorMsg);
    throw new Error(`Error descargando archivo: ${errorMsg}`);
  }
};

// Helper function para descargar en móvil
const downloadFileMobile = async (url: string, fileUri: string, token: string, mimeType: string, dialogTitle: string) => {
  const downloadResult = await FileSystem.downloadAsync(
    url,
    fileUri,
    {
      headers: getDownloadHeaders(token),
    }
  );

  if (downloadResult.status === 200) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle,
      });
    }
    return { success: true, fileUri };
  } else {
    throw new Error(`Error descargando archivo: ${downloadResult.status}`);
  }
};

export const reportesService = {
  /**
   * Descarga PDF simple de germinaciones del usuario (sin filtros de fecha)
   * Usa el endpoint optimizado mis-germinaciones-pdf
   */
  descargarPDFGerminaciones: async (search?: string) => {
    try {
      logger.info('📄 Descargando PDF de germinaciones...');

      // Obtener el token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `mis_germinaciones_${timestamp}.pdf`;

      if (Platform.OS === 'web') {
        // Para web, usar endpoint relativo (sin /api/)
        const webEndpoint = `germinaciones/mis-germinaciones-pdf/${params.toString() ? '?' + params.toString() : ''}`;
        await downloadFileWeb(webEndpoint, fileName, token);
        return { success: true };
      } else {
        // Para móvil, construir URL completa
        const endpoint = `germinaciones/mis-germinaciones-pdf/${params.toString() ? '?' + params.toString() : ''}`;
        const url = buildApiUrl(endpoint);
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        return await downloadFileMobile(
          url,
          fileUri,
          token,
          'application/pdf',
          'Descargar Reporte de Germinaciones (PDF)'
        );
      }
    } catch (error) {
      logger.error('❌ Error generando PDF de germinaciones:', error);
      throw error;
    }
  },

  generarReporteGerminaciones: async (formato: string = 'excel', filtros: any = {}) => {
    try {
      // Si es PDF sin filtros complejos, usar el endpoint optimizado
      if (formato === 'pdf' && !filtros.fecha_inicio && !filtros.fecha_fin) {
        return reportesService.descargarPDFGerminaciones(filtros.search);
      }

      // Obtener el token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append('formato', formato);

      // Añadir filtros si existen
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `reporte_germinaciones_${timestamp}.${extension}`;

      if (Platform.OS === 'web') {
        // Para web, usar endpoint relativo (sin /api/ porque axios ya tiene baseURL con /api/)
        const webEndpoint = `germinaciones/reporte/?${params.toString()}`;
        await downloadFileWeb(webEndpoint, fileName, token);
        return { success: true };
      } else {
        // Para móvil, construir URL completa
        const endpoint = `${API_CONFIG.ENDPOINTS.REPORTES.GERMINACIONES}?${params.toString()}`;
        const url = buildApiUrl(endpoint);
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const mimeType = formato === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return await downloadFileMobile(
          url,
          fileUri,
          token,
          mimeType,
          `Descargar Reporte de Germinaciones (${formato.toUpperCase()})`
        );
      }
    } catch (error) {
      logger.error('Error generando reporte de germinaciones:', error);
      throw error;
    }
  },

  generarReportePolinizaciones: async (formato: string = 'excel', filtros: any = {}) => {
    try {
      // Obtener el token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append('formato', formato);

      // Añadir filtros si existen
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `reporte_polinizaciones_${timestamp}.${extension}`;

      if (Platform.OS === 'web') {
        // Para web, usar endpoint relativo (sin /api/ porque axios ya tiene baseURL con /api/)
        const webEndpoint = `polinizaciones/reporte/?${params.toString()}`;
        await downloadFileWeb(webEndpoint, fileName, token);
        return { success: true };
      } else {
        // Para móvil, construir URL completa
        const endpoint = `${API_CONFIG.ENDPOINTS.REPORTES.POLINIZACIONES}?${params.toString()}`;
        const url = buildApiUrl(endpoint);
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const mimeType = formato === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return await downloadFileMobile(
          url,
          fileUri,
          token,
          mimeType,
          `Descargar Reporte de Polinizaciones (${formato.toUpperCase()})`
        );
      }
    } catch (error) {
      logger.error('Error generando reporte de polinizaciones:', error);
      throw error;
    }
  },

  async getEstadisticasGerminaciones(filtros?: { fecha_inicio?: string; fecha_fin?: string }) {
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');
      
      // Construir parámetros de consulta si hay filtros
      const params = new URLSearchParams();
      if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros?.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      
      const url = params.toString() 
        ? `estadisticas/germinaciones/?${params.toString()}`
        : 'estadisticas/germinaciones/';
      
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return res.data;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de germinaciones:', error);
      throw error;
    }
  },

  async getEstadisticasPolinizaciones(filtros?: { fecha_inicio?: string; fecha_fin?: string }) {
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');
      
      // Construir parámetros de consulta si hay filtros
      const params = new URLSearchParams();
      if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros?.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      
      const url = params.toString() 
        ? `estadisticas/polinizaciones/?${params.toString()}`
        : 'estadisticas/polinizaciones/';
      
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return res.data;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de polinizaciones:', error);
      throw error;
    }
  },

  generarReporteConEstadisticas: async (tipo: 'germinaciones' | 'polinizaciones' | 'ambos', formato: string = 'excel', filtros: any = {}) => {
    try {
      // Obtener el token de autenticación
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append('tipo', tipo);
      params.append('formato', formato);

      // Añadir filtros si existen
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const incluirEstadisticas = filtros.estadisticas === 'true';
      const tipoReporte = incluirEstadisticas ? 'con_estadisticas_y_graficos' : 'solo_datos';
      const fileName = `reporte_${tipo}_${tipoReporte}_${timestamp}.${extension}`;

      if (Platform.OS === 'web') {
        // Para web, usar endpoint relativo (sin /api/)
        const webEndpoint = `reportes/estadisticas/?${params.toString()}`;
        await downloadFileWeb(webEndpoint, fileName, token);
        return { success: true };
      } else {
        // Para móvil, construir URL completa
        const endpoint = `${API_CONFIG.ENDPOINTS.REPORTES.ESTADISTICAS}?${params.toString()}`;
        const url = buildApiUrl(endpoint);
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const mimeType = formato === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const dialogTitle = incluirEstadisticas
          ? `Descargar Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} con Estadísticas y Gráficos (${formato.toUpperCase()})`
          : `Descargar Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - Solo Datos (${formato.toUpperCase()})`;

        return await downloadFileMobile(
          url,
          fileUri,
          token,
          mimeType,
          dialogTitle
        );
      }
    } catch (error) {
      logger.error('Error generando reporte:', error);
      throw error;
    }
  },
}; 
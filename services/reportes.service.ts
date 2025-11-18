import api from './api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from '@/services/secureStore';
import { API_CONFIG, buildApiUrl, getDownloadHeaders } from '@/config/api';

export const reportesService = {
  generarReporteGerminaciones: async (formato: string = 'excel', filtros: any = {}) => {
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
      
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTES.GERMINACIONES}?${params.toString()}`);
      
      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `reporte_germinaciones_${timestamp}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Descargar archivo directamente usando FileSystem
      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: getDownloadHeaders(token),
        }
      );
      
      if (downloadResult.status === 200) {
        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
          const mimeType = formato === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: `Descargar Reporte de Germinaciones (${formato.toUpperCase()})`,
          });
        }
        return { success: true, fileUri };
      } else {
        throw new Error(`Error descargando archivo: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error generando reporte de germinaciones:', error);
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
      
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTES.POLINIZACIONES}?${params.toString()}`);
      
      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `reporte_polinizaciones_${timestamp}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Descargar archivo directamente usando FileSystem
      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: getDownloadHeaders(token),
        }
      );
      
      if (downloadResult.status === 200) {
        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
          const mimeType = formato === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: `Descargar Reporte de Polinizaciones (${formato.toUpperCase()})`,
          });
        }
        return { success: true, fileUri };
      } else {
        throw new Error(`Error descargando archivo: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error generando reporte de polinizaciones:', error);
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
      console.error('Error obteniendo estadísticas de germinaciones:', error);
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
      console.error('Error obteniendo estadísticas de polinizaciones:', error);
      throw error;
    }
  },

  async getAlertasPrediccion() {
    const token = await SecureStore.secureStore.getItem('authToken');
    if (!token) throw new Error('No hay token de autenticación');
    const res = await api.get('/laboratorio/predicciones-alertas/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
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
      
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTES.ESTADISTICAS}?${params.toString()}`);
      
      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const incluirEstadisticas = filtros.estadisticas === 'true';
      const tipoReporte = incluirEstadisticas ? 'con_estadisticas_y_graficos' : 'solo_datos';
      const fileName = `reporte_${tipo}_${tipoReporte}_${timestamp}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Descargar archivo directamente usando FileSystem
      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: getDownloadHeaders(token),
        }
      );
      
      if (downloadResult.status === 200) {
        // Compartir archivo
        if (await Sharing.isAvailableAsync()) {
          const mimeType = formato === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          
          const dialogTitle = incluirEstadisticas 
            ? `Descargar Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} con Estadísticas y Gráficos (${formato.toUpperCase()})`
            : `Descargar Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - Solo Datos (${formato.toUpperCase()})`;
          
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle,
          });
        }
        return { success: true, fileUri };
      } else {
        throw new Error(`Error descargando archivo: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  },
}; 
/**
 * Configuración centralizada de la API
 * Centraliza todas las URLs y configuraciones del backend
 */

// Configuración base de la API
export const API_CONFIG = {
  // URL base del backend - puede ser configurada por variables de entorno
BASE_URL: process.env['EXPO_PUBLIC_API_URL'] || 'http://207.180.230.88:8000',
  
  // Endpoints específicos
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/api/auth/login/',
      REGISTER: '/api/auth/register/',
      REFRESH: '/api/auth/refresh/',
      LOGOUT: '/api/auth/logout/',
    },
    
    // Germinaciones
    GERMINACIONES: {
      LIST: '/api/germinaciones/',
      CREATE: '/api/germinaciones/',
      DETAIL: (id: string) => `/api/germinaciones/${id}/`,
      REPORTE: '/api/germinaciones/reporte/',
      ESTADISTICAS: '/api/germinaciones/estadisticas/',
    },
    
    // Polinizaciones
    POLINIZACIONES: {
      LIST: '/api/polinizaciones/',
      CREATE: '/api/polinizaciones/',
      DETAIL: (id: string) => `/api/polinizaciones/${id}/`,
      REPORTE: '/api/polinizaciones/reporte/',
      ESTADISTICAS: '/api/polinizaciones/estadisticas/',
    },
    
    // Reportes
    REPORTES: {
      ESTADISTICAS: '/api/reportes/estadisticas/',
      GERMINACIONES: '/api/germinaciones/reporte/',
      POLINIZACIONES: '/api/polinizaciones/reporte/',
    },
    
    // Usuarios y perfiles
    USERS: {
      PROFILE: '/api/user-profiles/mi_perfil/',
      PERMISSIONS: '/api/user-profiles/permisos/',
    },
  },
  
  // Configuración de timeouts
  TIMEOUTS: {
    DEFAULT: 10000, // 10 segundos
    UPLOAD: 30000,  // 30 segundos para subidas
    DOWNLOAD: 60000, // 60 segundos para descargas
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Función helper para construir URLs completas
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Función helper para obtener headers con autenticación
 */
export const getAuthHeaders = (token: string) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Función helper para obtener headers de descarga
 */
export const getDownloadHeaders = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf',
  };
};
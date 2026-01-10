import api from './api';
import * as SecureStore from '@/services/secureStore';
import type { 
import { logger } from '@/services/logger';
  PrediccionMejoradaResponse, 
  EstadisticasPrecisionModelo, 
  ReentrenamientoResponse 
} from '@/types';

export const germinacionService = {
  // Obtener códigos únicos - OPTIMIZADO con endpoint correcto del backend
  getCodes: async (): Promise<string[]> => {
    logger.debug(' germinacionService.getCodes() - Obteniendo códigos únicos desde PostgreSQL...');

    try {
      // Usar el endpoint correcto del backend
      const response = await api.get('germinaciones/codigos-unicos/', {
        timeout: 10000
      });

      logger.debug(' germinacionService.getCodes() - response.data:', response.data);

      // El backend retorna: {codigos: [...], total: X}
      const codes = Array.isArray(response.data.codigos) ? response.data.codigos : [];
      logger.success(' germinacionService.getCodes() - Códigos obtenidos desde PostgreSQL:', codes.length);
      logger.info('📋 Primeros 5 códigos:', codes.slice(0, 5));
      logger.debug(' ¿Contiene "pis"?:', codes.filter((c: string) => c.toLowerCase().includes('pis')));
      return codes;
    } catch (error: any) {
      console.error('❌ germinacionService.getCodes() - Error:', error.message);
      // Fallback: intentar obtener de todas las germinaciones solo si falla
      try {
        logger.start(' Usando fallback...');
        const allGerminaciones = await germinacionService.getAllForAdmin();
        const codes = allGerminaciones
          .map((germinacion: any) => germinacion.codigo)
          .filter((codigo: string) => codigo && codigo.trim() !== '');
        return codes;
      } catch {
        return [];
      }
    }
  },

  // Obtener códigos con especies - OPTIMIZADO con endpoint correcto del backend
  getCodesWithSpecies: async (): Promise<{codigo: string, especie: string}[]> => {
    logger.debug(' germinacionService.getCodesWithSpecies() - Obteniendo códigos con especies...');

    try {
      // Usar el endpoint correcto del backend
      const response = await api.get('germinaciones/codigos-con-especies/', {
        timeout: 10000
      });

      logger.debug(' germinacionService.getCodesWithSpecies() - response.data:', response.data);

      // El backend retorna: {codigos_especies: [...], total: X}
      const codesWithSpecies = Array.isArray(response.data.codigos_especies) ? response.data.codigos_especies : [];
      logger.success(' germinacionService.getCodesWithSpecies() - Códigos con especies obtenidos:', codesWithSpecies.length);
      return codesWithSpecies;
    } catch (error: any) {
      console.error('❌ germinacionService.getCodesWithSpecies() - Error:', error.message);
      // Fallback: intentar obtener de todas las germinaciones solo si falla
      try {
        logger.start(' Usando fallback...');
        const allGerminaciones = await germinacionService.getAllForAdmin();
        const codesWithSpecies = allGerminaciones
          .map((germinacion: any) => ({
            codigo: germinacion.codigo,
            especie: germinacion.especie || germinacion.especie_variedad || ''
          }))
          .filter((item: any) => item.codigo && item.codigo.trim() !== '');
        return codesWithSpecies;
      } catch {
        return [];
      }
    }
  },

  // Buscar germinación por código - OPTIMIZADO con endpoint correcto del backend
  getGerminacionByCode: async (codigo: string): Promise<{codigo: string, especie: string, genero?: string} | null> => {
    logger.debug(' germinacionService.getGerminacionByCode() - Buscando código:', codigo);

    if (!codigo || codigo.trim() === '') {
      logger.warn(' Código vacío, retornando null');
      return null;
    }

    try {
      // Usar el endpoint correcto del backend
      const response = await api.get(`germinaciones/buscar-por-codigo/`, {
        params: { codigo },
        timeout: 10000
      });

      if (response.data) {
        const result = {
          codigo: response.data.codigo,
          especie: response.data.especie || response.data.especie_variedad || '',
          genero: response.data.genero || undefined
        };
        logger.success(' Germinación encontrada:', result);
        return result;
      }

      logger.warn(' No se encontró germinación para el código:', codigo);
      return null;
    } catch (error: any) {
      console.error('❌ germinacionService.getGerminacionByCode() - Error:', error.message);
      // Fallback: buscar en todas las germinaciones solo si falla
      try {
        logger.start(' Usando fallback...');
        const allGerminaciones = await germinacionService.getAllForAdmin();
        const germinacion = allGerminaciones.find((g: any) => g.codigo === codigo);

        if (germinacion) {
          return {
            codigo: germinacion.codigo,
            especie: germinacion.especie || germinacion.especie_variedad || '',
            genero: germinacion.genero || undefined
          };
        }
        return null;
      } catch {
        return null;
      }
    }
  },

  // Buscar germinación por especie/variedad para autocompletar código
  getGerminacionByEspecie: async (especie: string): Promise<{ codigo: string; especie: string; genero?: string } | null> => {
    logger.debug(' germinacionService.getGerminacionByEspecie() - Buscando especie:', especie);

    if (!especie || especie.trim() === '') {
      return null;
    }

    try {
      const response = await api.get(`germinaciones/buscar-por-especie/`, {
        params: { especie: especie.trim() },
        timeout: 5000
      });

      if (response.data) {
        const result = {
          codigo: response.data.codigo || '',
          especie: response.data.especie || '',
          genero: response.data.genero || undefined
        };
        logger.success(' Germinación encontrada por especie:', result);
        return result;
      }

      logger.warn(' No se encontró germinación para la especie:', especie);
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(' No se encontró germinación para la especie (404):', especie);
        return null;
      }
      console.error('❌ germinacionService.getGerminacionByEspecie() - Error:', error.message);
      return null;
    }
  },

  // Validar si un código es único en tiempo real
  validateCodigoUnico: async (codigo: string): Promise<{ disponible: boolean; mensaje: string }> => {
    logger.debug(' germinacionService.validateCodigoUnico() - Validando código:', codigo);

    // Verificar si el código está vacío
    if (!codigo || codigo.trim() === '') {
      return { disponible: false, mensaje: 'El código no puede estar vacío' };
    }

    try {
      // NOTA: En germinaciones se PERMITEN códigos duplicados
      // Este endpoint solo busca si existe para autocompletar datos, NO para validar unicidad
      const response = await api.get(`germinaciones/buscar-por-codigo/`, {
        params: { codigo: codigo.trim() },
        timeout: 5000
      });

      // Si encontró datos, autocompletar pero NO bloquear
      if (response.data) {
        logger.info(' Código encontrado (se permite duplicado):', codigo);
        return { 
          disponible: true, 
          mensaje: 'Código encontrado (se permiten duplicados en germinaciones)' 
        };
      }

      // Si no encontró datos, código nuevo
      logger.success(' Código nuevo:', codigo);
      return { disponible: true, mensaje: 'Código nuevo' };
    } catch (error: any) {
      // Error 404 significa que no existe (código nuevo)
      if (error.response?.status === 404) {
        logger.success(' Código nuevo (404):', codigo);
        return { disponible: true, mensaje: 'Código nuevo' };
      }

      // Otros errores: permitimos continuar (no bloqueamos por errores de red)
      console.error('⚠️ Error validando código (permitiendo continuar):', error.message);
      return { disponible: true, mensaje: 'No se pudo verificar el código' };
    }
  },

  // Obtener opciones para filtros y selectores (perchas, niveles, géneros, etc.)
  getFiltrosOpciones: async (): Promise<{
    perchas: string[];
    niveles: string[];
    generos: string[];
    responsables: string[];
    estados: string[];
    climas: string[];
    tipos_polinizacion: string[];
  }> => {
    logger.debug(' germinacionService.getFiltrosOpciones() - Obteniendo opciones...');

    try {
      const response = await api.get('germinaciones/filtros-opciones/', {
        timeout: 10000
      });

      logger.debug(' germinacionService.getFiltrosOpciones() - response.data:', response.data);

      // El backend retorna: {opciones: {...}, estadisticas: {...}}
      const opciones = response.data.opciones || {};

      const result = {
        perchas: Array.isArray(opciones.perchas) ? opciones.perchas : [],
        niveles: Array.isArray(opciones.niveles) ? opciones.niveles : [],
        generos: Array.isArray(opciones.generos) ? opciones.generos : [],
        responsables: Array.isArray(opciones.responsables) ? opciones.responsables : [],
        estados: Array.isArray(opciones.estados) ? opciones.estados : [],
        climas: Array.isArray(opciones.climas) ? opciones.climas : [],
        tipos_polinizacion: Array.isArray(opciones.tipos_polinizacion) ? opciones.tipos_polinizacion : [],
      };

      logger.success(' germinacionService.getFiltrosOpciones() - Perchas obtenidas:', result.perchas.length);
      logger.success(' germinacionService.getFiltrosOpciones() - Niveles obtenidos:', result.niveles.length);
      logger.info('📋 Primeras 5 perchas:', result.perchas.slice(0, 5));
      logger.info('📋 Niveles:', result.niveles);

      return result;
    } catch (error: any) {
      console.error('❌ germinacionService.getFiltrosOpciones() - Error:', error.message);
      return {
        perchas: [],
        niveles: [],
        generos: [],
        responsables: [],
        estados: [],
        climas: [],
        tipos_polinizacion: [],
      };
    }
  },

  /**
   * Obtiene solo las germinaciones del usuario autenticado
   * Por defecto filtra los últimos 7 días para mostrar solo registros recientes (no importados)
   */
  getMisGerminaciones: async (diasRecientes: number = 7) => {
    logger.debug(` germinacionService.getMisGerminaciones() - Obteniendo germinaciones del usuario (últimos ${diasRecientes} días)...`);
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' Token disponible:', !!token);

      const params: any = {};
      if (diasRecientes > 0) {
        params.dias_recientes = diasRecientes;
      }

      const response = await api.get('germinaciones/mis-germinaciones/', {
        params,
        timeout: 30000
      });
      
      logger.success(' Mis germinaciones recibidas:', response.data.length || response.data.results?.length || 0);
      
      // Manejar respuesta paginada o directa
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo mis germinaciones:', error);
      return [];
    }
  },

  /**
   * Obtiene las germinaciones del usuario autenticado con paginación
   */
  getMisGerminacionesPaginated: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    dias_recientes?: number;
    excluir_importadas?: boolean;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;
    const dias_recientes = params.dias_recientes !== undefined ? params.dias_recientes : 7; // Por defecto 7 días
    const excluir_importadas = params.excluir_importadas !== undefined ? params.excluir_importadas : false;

    logger.debug(' germinacionService.getMisGerminacionesPaginated() - Parámetros:', params);
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' Token disponible:', !!token);

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir parámetros de consulta
      const queryParams: any = {
        page,
        page_size,
        paginated: 'true'
      };

      if (params.search) {
        queryParams.search = params.search;
      }

      if (dias_recientes > 0) {
        queryParams.dias_recientes = dias_recientes;
      }

      if (excluir_importadas) {
        queryParams.excluir_importadas = 'true';
      }

      logger.info('🌐 Llamando a endpoint: germinaciones/mis-germinaciones/ con params:', queryParams);

      const response = await api.get('germinaciones/mis-germinaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.success(' Mis germinaciones paginadas recibidas:', {
        page,
        totalPages: response.data?.total_pages,
        count: response.data?.count,
        resultsCount: response.data?.results?.length
      });

      // Log detallado de las primeras 3 germinaciones para debugging
      if (response.data?.results && response.data.results.length > 0) {
        logger.info('📋 Primeras 3 germinaciones (muestra):',
          response.data.results.slice(0, 3).map((g: any) => ({
            id: g.id,
            codigo: g.codigo,
            creado_por_id: g.creado_por,
            responsable_id: g.responsable
          }))
        );
      } else {
        logger.warn('⚠️ No se recibieron germinaciones en la respuesta o el array está vacío');
      }
      
      return {
        results: response.data?.results || [],
        count: response.data?.count || 0,
        totalPages: response.data?.total_pages || 0,
        currentPage: response.data?.current_page || page,
        pageSize: response.data?.page_size || page_size,
        hasNext: response.data?.has_next || false,
        hasPrevious: response.data?.has_previous || false,
        next: response.data?.next || null,
        previous: response.data?.previous || null,
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo mis germinaciones paginadas:', error);
      return {
        results: [],
        count: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
        hasNext: false,
        hasPrevious: false,
        next: null,
        previous: null,
      };
    }
  },

  getAll: async () => {
    logger.debug(' germinacionService.getAll() - Iniciando llamada a API...');
    logger.debug(' URL de la API:', 'http://127.0.0.1:8000/api/germinaciones/');

    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' germinacionService.getAll() - Token disponible:', !!token);

      const response = await api.get('germinaciones/', {
        timeout: 30000 // 30 segundos para datos paginados
      });
      logger.info( response.data);
      
      // Asegurarse de que la respuesta sea un array
      if (Array.isArray(response.data)) {
        logger.info(response.data.length);
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Si la respuesta está paginada
        return response.data.results;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error(error);
      console.error(error.response?.data || error.message);
      console.error(error.response?.status);
      // En caso de error, devolver un array vacío en lugar de lanzar el error
      return [];
    }
  },

  getAllForAdmin: async () => {
    logger.debug(' germinacionService.getAllForAdmin() - Iniciando llamada para administrador...');
    logger.debug(' URL de la API:', 'http://127.0.0.1:8000/api/germinaciones/');
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' germinacionService.getAllForAdmin() - Token disponible:', !!token);
      
      if (!token) {
        logger.warn('⚠️ No hay token de autenticación disponible');
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Usar timeout extendido para este endpoint que maneja muchos datos
      const response = await api.get('germinaciones/', {
        timeout: 60000, // 60 segundos para cargar todas las germinaciones
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // El endpoint todas_admin devuelve un ARRAY DIRECTO de todas las germinaciones
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback: si por alguna razón devuelve formato paginado
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }

      logger.warn('⚠️ germinacionService.getAllForAdmin() - Formato de respuesta inesperado');
      return response.data;
    } catch (error: any) {
      console.error('❌ germinacionService.getAllForAdmin() - Error en la llamada:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
      console.error('❌ Status del error:', error.response?.status);
      
      // Mejorar el manejo de errores específicos
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a estos datos.');
      } else if (error.response?.status === 404) {
        throw new Error('El endpoint de germinaciones no fue encontrado.');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else if (!error.response) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
      }
      
      throw error;
    }
  },

  // Nuevo método para paginación con filtros
  getPaginated: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    codigo?: string;
    especie_variedad?: string;
    estado_capsulas?: string;
    clima?: string;
    responsable?: string;
    percha?: string;
    tipo_polinizacion?: string;
    fecha_siembra_desde?: string;
    fecha_siembra_hasta?: string;
    ordering?: string;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;

    logger.debug(' germinacionService.getPaginated() - Parámetros:', params);

    try {
      const token = await SecureStore.secureStore.getItem('authToken');

      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      // Construir parámetros de consulta
      const queryParams: any = {
        page,
        page_size,
      };

      // Agregar filtros si están presentes
      if (params.search) queryParams.search = params.search;
      if (params.codigo) queryParams.codigo = params.codigo;
      if (params.especie_variedad) queryParams.especie_variedad = params.especie_variedad;
      if (params.estado_capsulas) queryParams.estado_capsulas = params.estado_capsulas;
      if (params.clima) queryParams.clima = params.clima;
      if (params.responsable) queryParams.responsable = params.responsable;
      if (params.percha) queryParams.percha = params.percha;
      if (params.tipo_polinizacion) queryParams.tipo_polinizacion = params.tipo_polinizacion;
      if (params.fecha_siembra_desde) queryParams.fecha_siembra_desde = params.fecha_siembra_desde;
      if (params.fecha_siembra_hasta) queryParams.fecha_siembra_hasta = params.fecha_siembra_hasta;
      if (params.ordering) queryParams.ordering = params.ordering;

      const response = await api.get('germinaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.success(' germinacionService.getPaginated() - Respuesta recibida:', {
        page,
        totalPages: response.data?.total_pages,
        count: response.data?.count,
        resultsCount: response.data?.results?.length
      });

      return {
        results: response.data?.results || [],
        count: response.data?.count || 0,
        totalPages: response.data?.total_pages || 0,
        currentPage: response.data?.current_page || page,
        pageSize: response.data?.page_size || page_size,
        next: response.data?.next || null,
        previous: response.data?.previous || null,
      };
    } catch (error: any) {
      console.error('❌ Error en germinacionService.getPaginated():', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);

      // En caso de error, devolver estructura vacía
      return {
        results: [],
        count: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
        next: null,
        previous: null,
      };
    }
  },

  // Obtener opciones para filtros y estadísticas
  getFilterOptions: async () => {
    logger.debug(' germinacionService.getFilterOptions() - Obteniendo opciones de filtros...');

    try {
      const token = await SecureStore.secureStore.getItem('authToken');

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('germinaciones/filtros-opciones/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.success(' Opciones de filtros obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo opciones de filtros:', error);
      return {
        opciones: {
          responsables: [],
          perchas: [],
          generos: [],
          estados: ['CERRADA', 'ABIERTA', 'SEMIABIERTA'],
          climas: ['I', 'IW', 'IC', 'W', 'C'],
          tipos_polinizacion: ['SELF', 'HIBRIDA', 'SIBLING']
        },
        estadisticas: {
          total: 0,
          por_estado: {},
          por_clima: {}
        }
      };
    }
  },

  // Descargar PDF de mis germinaciones
  descargarMisGerminacionesPDF: async (search?: string) => {
    logger.info('📄 germinacionService.descargarMisGerminacionesPDF() - Iniciando descarga...');
    logger.debug(' Búsqueda:', search);

    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const url = `germinaciones/mis-germinaciones-pdf/${params.toString() ? '?' + params.toString() : ''}`;
      logger.info('🔗 URL de descarga:', url);

      const response = await api.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        timeout: 60000 // 60 segundos para PDFs grandes
      });

      logger.success(' PDF de mis germinaciones descargado exitosamente');
      logger.info('📊 Tamaño del PDF:', response.data.size, 'bytes');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error descargando PDF de mis germinaciones:', error);
      console.error('❌ Detalles:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    const response = await api.get(`germinaciones/${id}/`);
    return response.data;
  },
  
  create: async (data: any) => {
    logger.info('🌱 germinacionService.create() - Iniciando creación...');
    logger.info('📋 Datos a enviar:', data);
    
    try {
      // Mapear especie_variedad a especie si es necesario
      if (data.especie_variedad && !data.especie) {
        data.especie = data.especie_variedad;
      }
      
      // Validar datos antes de enviar
      const requiredFields = ['codigo', 'especie', 'fecha_siembra', 'cantidad_solicitada', 'no_capsulas'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }
      
      // Asegurar que los números sean enteros
      if (data.cantidad_solicitada) {
        data.cantidad_solicitada = parseInt(data.cantidad_solicitada);
      }
      if (data.no_capsulas) {
        data.no_capsulas = parseInt(data.no_capsulas);
      }
      
      // Limpiar campos de texto
      if (data.codigo) data.codigo = data.codigo.trim();
      if (data.genero) data.genero = data.genero.trim();
      if (data.especie) data.especie = data.especie.trim();
      if (data.percha) data.percha = data.percha.trim();
      if (data.nivel) data.nivel = data.nivel.trim();
      if (data.observaciones) data.observaciones = data.observaciones.trim();
      if (data.responsable_polinizacion) data.responsable_polinizacion = data.responsable_polinizacion.trim();
      
    
      const response = await api.post('germinaciones/', data);
      
      
      return response.data;
    } catch (error: any) {
      console.error('❌ germinacionService.create() - Error:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
      
      // Mejorar el mensaje de error para el usuario
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          
          const enhancedError = new Error(errorMessages) as any;
          enhancedError.response = error.response;
          throw enhancedError;
        }
      }
      
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`germinaciones/${id}/`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`germinaciones/${id}/`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('estadisticas/germinaciones/');
    return response.data;
  },

  // NUEVA FUNCIÓN: Calcular predicción basada en datos del formulario
  calcularPrediccion: async (formData: {
    especie?: string;
    genero?: string;
    fecha_siembra: string;
    clima?: string;
    tipo_semilla?: string;
  }) => {
    try {
      logger.info('🔮 Calculando predicción con datos:', formData);

      const response = await api.post('germinaciones/calcular_prediccion/', {
        especie: formData.especie?.trim() || '',
        genero: formData.genero?.trim() || '',
        fecha_siembra: formData.fecha_siembra,
        clima: formData.clima || 'I',
        tipo_semilla: formData.tipo_semilla || ''
      });

      logger.info('Predicción calculada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error calculando predicción:', error);

      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo calcular la predicción. Intenta nuevamente.');
    }
  },
  
  // NUEVA FUNCIÓN: Calcular predicción mejorada usando germinacion.bin
  calcularPrediccionMejorada: async (formData: {
    especie: string;
    genero: string;
    fecha_siembra: string;
    clima: 'I' | 'IW' | 'IC' | 'W' | 'C';
  }): Promise<PrediccionMejoradaResponse> => {
    try {
      logger.info('🔮 Calculando predicción mejorada con datos:', formData);

      const response = await api.post('germinaciones/calcular-prediccion-mejorada/', {
        especie: formData.especie?.trim() || '',
        genero: formData.genero?.trim() || '',
        fecha_siembra: formData.fecha_siembra,
        clima: formData.clima || 'I'
      });

      logger.success(' Predicción mejorada calculada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error calculando predicción mejorada:', error);

      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo calcular la predicción mejorada. Intenta nuevamente.');
    }
  },

  // NUEVA FUNCIÓN: Obtener alertas de germinación
  obtenerAlertasGerminacion: async (): Promise<any> => {
    try {
      logger.info('🔔 Obteniendo alertas de germinación...');

      const response = await api.get('germinaciones/alertas_germinacion/');

      logger.success(' Alertas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo alertas:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron obtener las alertas de germinación.');
    }
  },

  // NUEVA FUNCIÓN: Marcar alerta como revisada
  marcarAlertaRevisada: async (germinacionId: number, estado: string, observaciones?: string): Promise<any> => {
    try {
      logger.start(` Marcando alerta como ${estado} para germinación ${germinacionId}...`);

      const response = await api.post(`germinaciones/${germinacionId}/marcar_alerta_revisada/`, {
        estado: estado,
        observaciones: observaciones || '',
        fecha_revision: new Date().toISOString().split('T')[0]
      });

      logger.success(' Alerta actualizada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando alerta:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo actualizar el estado de la alerta.');
    }
  },

  // NUEVA FUNCIÓN: Obtener estadísticas de precisión del modelo
  obtenerEstadisticasPrecision: async (): Promise<EstadisticasPrecisionModelo> => {
    try {
      logger.info('📊 Obteniendo estadísticas de precisión del modelo...');

      const response = await api.get('germinaciones/estadisticas_precision_modelo/');

      logger.success(' Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron obtener las estadísticas de precisión.');
    }
  },

  // NUEVA FUNCIÓN: Exportar datos de predicciones a CSV
  exportarDatosPredicciones: async (filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    especie?: string;
    genero?: string;
    modelo?: string;
    incluir_historial?: boolean;
  }): Promise<Blob> => {
    try {
      logger.info('📤 Exportando datos de predicciones a CSV...', filtros);

      const response = await api.get('germinaciones/exportar_predicciones_csv/', {
        params: filtros,
        responseType: 'blob'
      });

      logger.success(' Datos exportados exitosamente a CSV');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error exportando datos a CSV:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron exportar los datos de predicciones a CSV.');
    }
  },

  // NUEVA FUNCIÓN: Crear backup del modelo entrenado
  crearBackupModelo: async () => {
    try {
      logger.info('💾 Creando backup del modelo entrenado...');

      const response = await api.post('germinaciones/crear_backup_modelo/', {}, {
        responseType: 'blob'
      });

      logger.success(' Backup del modelo creado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando backup del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo crear el backup del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Obtener información del modelo para backup
  obtenerInfoBackupModelo: async () => {
    try {
      logger.info(' Obteniendo información del modelo para backup...');

      const response = await api.get('germinaciones/info_backup_modelo/');

      logger.success(' Información del modelo obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo información del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo obtener la información del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Reentrenar modelo
  reentrenarModelo: async (): Promise<ReentrenamientoResponse> => {
    try {
      logger.info('🤖 Iniciando reentrenamiento del modelo...');

      const response = await api.post('germinaciones/reentrenar_modelo/');

      logger.success(' Reentrenamiento completado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error reentrenando modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo reentrenar el modelo.');
    }
  },

  // NUEVA FUNCIÓN: Completar predicciones faltantes
  completarPrediccionesFaltantes: async () => {
    try {
      logger.start(' Completando predicciones faltantes...');

      const response = await api.post('germinaciones/completar_predicciones_faltantes/');

      logger.success(' Predicciones completadas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error completando predicciones:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron completar las predicciones faltantes.');
    }
  },

  // NUEVA FUNCIÓN: Obtener estado del modelo
  obtenerEstadoModelo: async () => {
    try {
      logger.info(' Obteniendo estado del modelo...');

      const response = await api.get('germinaciones/estado_modelo/');

      logger.success(' Estado del modelo obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estado del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo obtener el estado del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Obtener métricas de rendimiento
  obtenerMetricasRendimiento: async () => {
    try {
      logger.info('📊 Obteniendo métricas de rendimiento...');

      const response = await api.get('germinaciones/performance_metrics/');

      logger.success(' Métricas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo métricas:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron obtener las métricas de rendimiento.');
    }
  },

  /**
   * Cambia el estado de cápsula de una germinación
   * Si el estado es ABIERTA, actualiza la fecha de germinación con la fecha actual
   */
  cambiarEstadoCapsula: async (id: number, nuevoEstado: 'CERRADA' | 'ABIERTA' | 'SEMIABIERTA') => {
    try {
      logger.start(` Cambiando estado de cápsula de germinación ${id} a ${nuevoEstado}`);

      // Preparar datos para actualizar
      const updateData: any = {
        estado_capsula: nuevoEstado
      };

      // Si el estado es ABIERTA, agregar la fecha actual como fecha de germinación
      if (nuevoEstado === 'ABIERTA') {
        const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        updateData.fecha_germinacion = fechaActual;
        logger.info(`📅 Actualizando fecha de germinación a: ${fechaActual}`);
      }

      const response = await api.patch(`germinaciones/${id}/`, updateData);
      logger.success(' Estado de cápsula cambiado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cambiando estado de cápsula:', error);
      throw error;
    }
  },

  /**
   * Cambia la etapa actual de una germinación
   * Estados: INGRESADO -> EN_PROCESO -> FINALIZADO
   * Si la etapa cambia a FINALIZADO, actualiza la fecha de germinación con la fecha actual
   */
  cambiarEtapa: async (id: number, nuevaEtapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO' | 'LISTA') => {
    try {
      logger.start(` Cambiando etapa de germinación ${id} a ${nuevaEtapa}`);

      // Preparar datos para actualizar
      const updateData: any = {
        etapa_actual: nuevaEtapa
      };

      // Si la etapa es FINALIZADO o LISTA, agregar la fecha actual como fecha de germinación
      if (nuevaEtapa === 'FINALIZADO' || nuevaEtapa === 'LISTA') {
        const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        updateData.fecha_germinacion = fechaActual;
        logger.info(`📅 Actualizando fecha de germinación a: ${fechaActual}`);
      }

      const response = await api.patch(`germinaciones/${id}/`, updateData);
      logger.success(' Etapa cambiada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cambiando etapa:', error);
      throw error;
    }
  },

  // NUEVA FUNCIÓN: Cambiar estado de germinación (INICIAL, EN_PROCESO, FINALIZADO)
  cambiarEstadoGerminacion: async (
    id: number, 
    estado: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    fechaGerminacion?: string
  ): Promise<any> => {
    try {
      logger.start(` Cambiando estado de germinación ${id} a: ${estado}`, fechaGerminacion ? `con fecha: ${fechaGerminacion}` : '');

      const data: any = { estado };
      if (fechaGerminacion && estado === 'FINALIZADO') {
        data.fecha_germinacion = fechaGerminacion;
      }

      const response = await api.post(`germinaciones/${id}/cambiar-estado/`, data);

      logger.success(' Estado de germinación cambiado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cambiando estado de germinación:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo cambiar el estado de la germinación.');
    }
  },

  // NUEVA FUNCIÓN: Actualizar progreso de germinación (0-100%)
  actualizarProgresoGerminacion: async (id: number, progreso: number): Promise<any> => {
    try {
      logger.info(`📊 Actualizando progreso de germinación ${id} a: ${progreso}%`);

      // Validar que el progreso esté entre 0 y 100
      if (progreso < 0 || progreso > 100) {
        throw new Error('El progreso debe estar entre 0 y 100');
      }

      const response = await api.post(`germinaciones/${id}/cambiar-estado/`, {
        progreso: progreso
      });

      logger.success(' Progreso de germinación actualizado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando progreso de germinación:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo actualizar el progreso de la germinación.');
    }
  },

  // =============================================================================
  // VALIDACIÓN DE PREDICCIONES (para reentrenamiento del modelo)
  // =============================================================================

  /**
   * Valida una predicción de germinación comparando con fecha real
   *
   * @param germinacionId - ID de la germinación
   * @param fechaRealGerminacion - Fecha real cuando germinó (formato: YYYY-MM-DD)
   * @returns Resultado de la validación con métricas de precisión
   */
  validarPrediccion: async (
    germinacionId: number,
    fechaRealGerminacion: string
  ): Promise<{
    mensaje: string;
    validacion: {
      dias_reales: number;
      dias_predichos: number;
      diferencia_dias: number;
      precision: number;
      calidad: string;
    };
    germinacion: any;
  }> => {
    try {
      logger.info(`✓ Validando predicción de germinación ${germinacionId} con fecha real:`, fechaRealGerminacion);

      const response = await api.post(
        `germinaciones/${germinacionId}/validar-prediccion/`,
        { fecha_real_germinacion: fechaRealGerminacion }
      );

      logger.success(' Predicción validada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error validando predicción:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo validar la predicción. Intenta nuevamente.');
    }
  },

  /**
   * Obtiene germinaciones con predicciones validadas
   *
   * @param params - Parámetros opcionales de filtro
   * @returns Lista de germinaciones validadas con estadísticas
   */
  obtenerGerminacionesValidadas: async (params?: {
    precision_minima?: number;
    desde?: string;
    hasta?: string;
  }): Promise<{
    total: number;
    precision_promedio: number;
    germinaciones: any[];
  }> => {
    try {
      logger.info('📊 Obteniendo germinaciones validadas...', params);

      const response = await api.get('predicciones/germinaciones/validadas/', {
        params
      });

      logger.success(' Germinaciones validadas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo germinaciones validadas:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron obtener las germinaciones validadas.');
    }
  },

  /**
   * Exporta datos de germinaciones validadas para reentrenamiento del modelo
   * Retorna un archivo CSV con todos los datos necesarios
   *
   * @returns Blob con el archivo CSV
   */
  exportarDatosReentrenamiento: async (): Promise<Blob> => {
    try {
      logger.info('📤 Exportando datos de germinaciones validadas para reentrenamiento...');

      const response = await api.post(
        'predicciones/exportar-reentrenamiento-germinacion/',
        {},
        { responseType: 'blob' }
      );

      logger.success(' Datos exportados exitosamente');
      logger.info('📊 Tamaño del archivo:', response.data.size, 'bytes');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error exportando datos:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron exportar los datos de reentrenamiento.');
    }
  },

  // Marcar germinación como revisada
  marcarRevisado: async (
    id: number,
    estado?: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    progreso?: number,
    diasProximaRevision?: number
  ) => {
    try {
      logger.success(` Marcando germinación ${id} como revisada`);

      const data: any = {};
      if (estado) data.estado = estado;
      if (progreso !== undefined) data.progreso = progreso;
      if (diasProximaRevision) data.dias_proxima_revision = diasProximaRevision;

      const response = await api.post(`germinaciones/${id}/marcar-revisado/`, data);

      logger.success(' Germinación marcada como revisada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error marcando germinación como revisada:', error);
      throw error;
    }
  },

  // Obtener germinaciones pendientes de revisión
  getPendientesRevision: async () => {
    try {
      logger.debug(' Obteniendo germinaciones pendientes de revisión...');

      const response = await api.get('germinaciones/pendientes-revision/');

      logger.success(' Germinaciones pendientes obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo germinaciones pendientes:', error);
      throw error;
    }
  },
};

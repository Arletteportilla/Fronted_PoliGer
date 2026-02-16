import api from './api';
import * as SecureStore from '@/services/secureStore';
import { logger } from '@/services/logger';
import type {
  PrediccionMejoradaResponse,
  EstadisticasPrecisionModelo,
  ReentrenamientoResponse
} from '@/types';

export const germinacionService = {
  // Obtener códigos únicos - OPTIMIZADO con endpoint correcto del backend
  getCodes: async (): Promise<string[]> => {

    try {
      // Usar el endpoint correcto del backend
      const response = await api.get('germinaciones/codigos-unicos/', {
        timeout: 10000
      });


      // El backend retorna: {codigos: [...], total: X}
      const codes = Array.isArray(response.data.codigos) ? response.data.codigos : [];
      return codes;
    } catch (error: any) {
      logger.error('❌ germinacionService.getCodes() - Error:', error.message);
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

    try {
      // Usar el endpoint correcto del backend
      const response = await api.get('germinaciones/codigos-con-especies/', {
        timeout: 10000
      });


      // El backend retorna: {codigos_especies: [...], total: X}
      const codesWithSpecies = Array.isArray(response.data.codigos_especies) ? response.data.codigos_especies : [];
      return codesWithSpecies;
    } catch (error: any) {
      logger.error('❌ germinacionService.getCodesWithSpecies() - Error:', error.message);
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

    if (!codigo || codigo.trim() === '') {
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
        return result;
      }

      return null;
    } catch (error: any) {
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
        return result;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('❌ germinacionService.getGerminacionByEspecie() - Error:', error.message);
      return null;
    }
  },

  // Validar si un código es único en tiempo real
  validateCodigoUnico: async (codigo: string): Promise<{ disponible: boolean; mensaje: string }> => {

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
        return { 
          disponible: true, 
          mensaje: 'Código encontrado (se permiten duplicados en germinaciones)' 
        };
      }

      // Si no encontró datos, código nuevo
      return { disponible: true, mensaje: 'Código nuevo' };
    } catch (error: any) {
      // Error 404 significa que no existe (código nuevo)
      if (error.response?.status === 404) {
        return { disponible: true, mensaje: 'Código nuevo' };
      }

      // Otros errores: permitimos continuar (no bloqueamos por errores de red)
      logger.error('⚠️ Error validando código (permitiendo continuar):', error.message);
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

    try {
      const response = await api.get('germinaciones/filtros-opciones/', {
        timeout: 10000
      });


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


      return result;
    } catch (error: any) {
      logger.error('❌ germinacionService.getFiltrosOpciones() - Error:', error.message);
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
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');

      const params: any = {};
      if (diasRecientes > 0) {
        params.dias_recientes = diasRecientes;
      }

      const response = await api.get('germinaciones/mis-germinaciones/', {
        params,
        timeout: 30000
      });
      
      
      // Manejar respuesta paginada o directa
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error: any) {
      logger.error('❌ Error obteniendo mis germinaciones:', error);
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
    tipo_registro?: 'historicos' | 'nuevos';
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;
    const dias_recientes = params.dias_recientes !== undefined ? params.dias_recientes : 0; // Por defecto 0 días (mostrar todos)
    const excluir_importadas = params.excluir_importadas !== undefined ? params.excluir_importadas : false;

    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');

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

      // Agregar filtro de tipo de registro
      if (params.tipo_registro) {
        queryParams.tipo_registro = params.tipo_registro;
      }


      const response = await api.get('germinaciones/mis-germinaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

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
      logger.error('❌ Error obteniendo mis germinaciones paginadas:', error);
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

    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');

      const response = await api.get('germinaciones/', {
        timeout: 30000 // 30 segundos para datos paginados
      });
      
      // Asegurarse de que la respuesta sea un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Si la respuesta está paginada
        return response.data.results;
      } else {
        return [];
      }
    } catch (error: any) {
      logger.error(error);
      logger.error(error.response?.data || error.message);
      logger.error(error.response?.status);
      // En caso de error, devolver un array vacío en lugar de lanzar el error
      return [];
    }
  },

  getAllForAdmin: async () => {
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      
      if (!token) {
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

      return response.data;
    } catch (error: any) {
      logger.error('❌ germinacionService.getAllForAdmin() - Error en la llamada:', error);
      logger.error('❌ Detalles del error:', error.response?.data || error.message);
      logger.error('❌ Status del error:', error.response?.status);
      
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

  // Obtener métricas de germinaciones nuevas (creadas en el sistema)
  getMetricasNuevos: async (): Promise<{ en_proceso: number; finalizados: number; exito_promedio: number; total: number }> => {
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación.');
      }
      const response = await api.get('germinaciones/metricas-nuevos/', {
        timeout: 15000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Error obteniendo métricas de germinaciones:', error);
      return { en_proceso: 0, finalizados: 0, exito_promedio: 0, total: 0 };
    }
  },

  // Nuevo método para paginación con filtros
  getPaginated: async (params: {
    page?: number | undefined;
    page_size?: number | undefined;
    search?: string | undefined;
    codigo?: string | undefined;
    especie_variedad?: string | undefined;
    estado_capsulas?: string | undefined;
    clima?: string | undefined;
    responsable?: string | undefined;
    percha?: string | undefined;
    tipo_polinizacion?: string | undefined;
    fecha_siembra_desde?: string | undefined;
    fecha_siembra_hasta?: string | undefined;
    ordering?: string | undefined;
    tipo_registro?: 'historicos' | 'nuevos' | undefined;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;


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
      if (params.tipo_registro) queryParams.tipo_registro = params.tipo_registro;

      const response = await api.get('germinaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      logger.error('❌ Error en germinacionService.getPaginated():', error);
      logger.error('❌ Status:', error.response?.status);
      logger.error('❌ Data:', error.response?.data);

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

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo opciones de filtros:', error);
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

      const response = await api.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        timeout: 60000 // 60 segundos para PDFs grandes
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error descargando PDF de mis germinaciones:', error);
      logger.error('❌ Detalles:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    const response = await api.get(`germinaciones/${id}/`);
    return response.data;
  },
  
  create: async (data: any) => {

    try {
      // Mapear campos del frontend a los nombres que espera el backend
      // El backend espera 'especie_variedad', pero el frontend envía 'especie'
      if (data.especie && !data.especie_variedad) {
        data.especie_variedad = data.especie;
      }

      // El backend espera 'responsable', pero el frontend envía 'responsable_polinizacion' o 'responsable_germinacion'
      if (!data.responsable) {
        data.responsable = data.responsable_polinizacion || data.responsable_germinacion || '';
      }

      // Validar datos antes de enviar (usando los nombres del backend)
      const requiredFields = ['codigo', 'especie_variedad', 'fecha_siembra', 'cantidad_solicitada', 'no_capsulas', 'responsable'];
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
      if (data.especie_variedad) data.especie_variedad = data.especie_variedad.trim();
      if (data.percha) data.percha = data.percha.trim();
      if (data.nivel) data.nivel = data.nivel.trim();
      if (data.observaciones) data.observaciones = data.observaciones.trim();
      if (data.responsable) data.responsable = data.responsable.trim();


      const response = await api.post('germinaciones/', data);


      return response.data;
    } catch (error: any) {
      logger.error('❌ germinacionService.create() - Error:', error);
      logger.error('❌ Detalles del error:', error.response?.data || error.message);

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

    try {
      // Mapear campos del frontend a los nombres que espera el backend
      const updateData: any = { ...data };

      // Mapear especie_variedad si viene como 'especie'
      if (data.especie && !data.especie_variedad) {
        updateData.especie_variedad = data.especie;
      }

      // Asegurar que los números sean enteros
      if (data.cantidad_solicitada !== undefined) {
        updateData.cantidad_solicitada = parseInt(data.cantidad_solicitada) || 0;
      }
      if (data.no_capsulas !== undefined) {
        updateData.no_capsulas = parseInt(data.no_capsulas) || 0;
      }

      // Limpiar campos de texto (trim whitespace)
      const textFields = ['codigo', 'genero', 'especie_variedad', 'percha', 'nivel', 'observaciones', 'responsable', 'finca', 'numero_vivero'];
      textFields.forEach(field => {
        if (updateData[field] && typeof updateData[field] === 'string') {
          updateData[field] = updateData[field].trim();
        }
      });


      const response = await api.put(`germinaciones/${id}/`, updateData);

      return response.data;
    } catch (error: any) {
      logger.error('❌ germinacionService.update() - Error:', error);
      logger.error('❌ Detalles del error:', error.response?.data || error.message);

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

      const response = await api.post('germinaciones/calcular_prediccion/', {
        especie: formData.especie?.trim() || '',
        genero: formData.genero?.trim() || '',
        fecha_siembra: formData.fecha_siembra,
        clima: formData.clima || 'I',
        tipo_semilla: formData.tipo_semilla || ''
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error calculando predicción:', error);

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

      const response = await api.post('germinaciones/calcular-prediccion-mejorada/', {
        especie: formData.especie?.trim() || '',
        genero: formData.genero?.trim() || '',
        fecha_siembra: formData.fecha_siembra,
        clima: formData.clima || 'I'
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error calculando predicción mejorada:', error);

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

      const response = await api.get('germinaciones/alertas_germinacion/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo alertas:', error);
      
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

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error actualizando alerta:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo actualizar el estado de la alerta.');
    }
  },

  // NUEVA FUNCIÓN: Obtener estadísticas de precisión del modelo
  obtenerEstadisticasPrecision: async (): Promise<EstadisticasPrecisionModelo> => {
    try {

      const response = await api.get('germinaciones/estadisticas_precision_modelo/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo estadísticas:', error);
      
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

      const response = await api.get('germinaciones/exportar_predicciones_csv/', {
        params: filtros,
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error exportando datos a CSV:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron exportar los datos de predicciones a CSV.');
    }
  },

  // NUEVA FUNCIÓN: Crear backup del modelo entrenado
  crearBackupModelo: async () => {
    try {

      const response = await api.post('germinaciones/crear_backup_modelo/', {}, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error creando backup del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo crear el backup del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Obtener información del modelo para backup
  obtenerInfoBackupModelo: async () => {
    try {

      const response = await api.get('germinaciones/info_backup_modelo/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo información del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo obtener la información del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Reentrenar modelo
  reentrenarModelo: async (): Promise<ReentrenamientoResponse> => {
    try {

      const response = await api.post('germinaciones/reentrenar_modelo/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error reentrenando modelo:', error);
      
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

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error completando predicciones:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron completar las predicciones faltantes.');
    }
  },

  // NUEVA FUNCIÓN: Obtener estado del modelo
  obtenerEstadoModelo: async () => {
    try {

      const response = await api.get('germinaciones/estado_modelo/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo estado del modelo:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo obtener el estado del modelo.');
    }
  },

  // NUEVA FUNCIÓN: Obtener métricas de rendimiento
  obtenerMetricasRendimiento: async () => {
    try {

      const response = await api.get('germinaciones/performance_metrics/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo métricas:', error);
      
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
      }

      const response = await api.patch(`germinaciones/${id}/`, updateData);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cambiando estado de cápsula:', error);
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
      }

      const response = await api.patch(`germinaciones/${id}/`, updateData);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cambiando etapa:', error);
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

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cambiando estado de germinación:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo cambiar el estado de la germinación.');
    }
  },

  // NUEVA FUNCIÓN: Actualizar progreso de germinación (0-100%)
  actualizarProgresoGerminacion: async (id: number, progreso: number): Promise<any> => {
    try {

      // Validar que el progreso esté entre 0 y 100
      if (progreso < 0 || progreso > 100) {
        throw new Error('El progreso debe estar entre 0 y 100');
      }

      const response = await api.post(`germinaciones/${id}/cambiar-estado/`, {
        progreso: progreso
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error actualizando progreso de germinación:', error);
      
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

      const response = await api.post(
        `germinaciones/${germinacionId}/validar-prediccion/`,
        { fecha_real_germinacion: fechaRealGerminacion }
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error validando predicción:', error);

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

      const response = await api.get('predicciones/germinaciones/validadas/', {
        params
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo germinaciones validadas:', error);

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

      const response = await api.post(
        'predicciones/exportar-reentrenamiento-germinacion/',
        {},
        { responseType: 'blob' }
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error exportando datos:', error);

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

      const data: any = {};
      if (estado) data.estado = estado;
      if (progreso !== undefined) data.progreso = progreso;
      if (diasProximaRevision) data.dias_proxima_revision = diasProximaRevision;

      const response = await api.post(`germinaciones/${id}/marcar-revisado/`, data);

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error marcando germinación como revisada:', error);
      throw error;
    }
  },

  // Obtener germinaciones pendientes de revisión
  getPendientesRevision: async () => {
    try {

      const response = await api.get('germinaciones/pendientes-revision/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo germinaciones pendientes:', error);
      throw error;
    }
  },
};

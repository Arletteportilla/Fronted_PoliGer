import api from './api';
import * as SecureStore from '@/services/secureStore';
import { logger } from '@/services/logger';

export const polinizacionService = {
  /**
   * Obtiene solo las polinizaciones del usuario autenticado
   * Por defecto filtra los últimos 7 días para mostrar solo registros recientes (no importados)
   */
  getMisPolinizaciones: async (diasRecientes: number = 7) => {
    logger.debug(` polinizacionService.getMisPolinizaciones() - Obteniendo polinizaciones del usuario (últimos ${diasRecientes} días)...`);
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' Token disponible:', !!token);

      const params: any = {};
      if (diasRecientes > 0) {
        params.dias_recientes = diasRecientes;
      }

      const response = await api.get('polinizaciones/mis-polinizaciones/', {
        params,
        timeout: 30000
      });
      
      logger.success(' Mis polinizaciones recibidas:', response.data.length || response.data.results?.length || 0);
      
      // Manejar respuesta paginada o directa
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error: any) {
      logger.error('❌ Error obteniendo mis polinizaciones:', error);
      return [];
    }
  },

  /**
   * Obtiene las polinizaciones del usuario autenticado con paginación
   */
  getMisPolinizacionesPaginated: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    dias_recientes?: number;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;
    const dias_recientes = params.dias_recientes !== undefined ? params.dias_recientes : 7; // Por defecto 7 días

    logger.debug(' polinizacionService.getMisPolinizacionesPaginated() - Parámetros:', params);
    
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

      const response = await api.get('polinizaciones/mis-polinizaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.success(' Mis polinizaciones paginadas recibidas:', {
        page,
        totalPages: response.data?.total_pages,
        count: response.data?.count,
        resultsCount: response.data?.results?.length
      });
      
      // Debug: Log de predicciones en los primeros resultados
      if (response.data?.results?.length > 0) {
        logger.info('🔮 Datos de predicción en primeros resultados del backend:');
        response.data.results.slice(0, 3).forEach((item: any, index: number) => {
          logger.info(`  [${index}] ${item.codigo || item.numero}:`, {
            fecha_maduracion_predicha: item.fecha_maduracion_predicha,
            prediccion_fecha_estimada: item.prediccion_fecha_estimada,
            metodo_prediccion: item.metodo_prediccion,
            confianza_prediccion: item.confianza_prediccion,
            dias_maduracion_predichos: item.dias_maduracion_predichos
          });
        });
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
      logger.error('❌ Error obteniendo mis polinizaciones paginadas:', error);
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
    logger.debug(' polinizacionService.getAll() - Iniciando llamada a API...');
    logger.debug(' URL de la API:', 'http://127.0.0.1:8000/api/polinizaciones/');
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' polinizacionService.getAll() - Token disponible:', !!token);
      
      const response = await api.get('polinizaciones/');
      logger.success(' polinizacionService.getAll() - Respuesta:', response.data);
      
      // Asegurarse de que la respuesta sea un array
      if (Array.isArray(response.data)) {
        logger.success(' polinizacionService.getAll() - Cantidad:', response.data.length);
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Si la respuesta está paginada
        logger.success(' polinizacionService.getAll() - Cantidad:', response.data.results.length);
        return response.data.results;
      } else {
        logger.warn('⚠️ polinizacionService.getAll() - Formato de respuesta inesperado, devolviendo array vacío');
        return [];
      }
    } catch (error: any) {
      logger.error('❌ polinizacionService.getAll() - Error en la llamada:', error);
      logger.error('❌ Detalles del error:', error.response?.data || error.message);
      logger.error('❌ Status del error:', error.response?.status);
      
      // Mejorar el manejo de errores específicos
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a estos datos.');
      } else if (error.response?.status === 404) {
        throw new Error('El endpoint de polinizaciones no fue encontrado.');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else if (!error.response) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
      }
      
      // En caso de otros errores, devolver un array vacío en lugar de lanzar el error
      return [];
    }
  },

  getAllForAdmin: async () => {
    logger.debug(' polinizacionService.getAllForAdmin() - Iniciando llamada para administrador...');
    logger.debug(' URL de la API:', 'http://127.0.0.1:8000/api/polinizaciones/todas_admin/');
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' polinizacionService.getAllForAdmin() - Token disponible:', !!token);
      
      if (!token) {
        logger.warn('⚠️ No hay token de autenticación disponible');
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      const response = await api.get('polinizaciones/todas_admin/');
      logger.success(' polinizacionService.getAllForAdmin() - Respuesta exitosa:', response.data);
      
      // El endpoint todas_admin devuelve un ARRAY DIRECTO de todas las polinizaciones
      if (Array.isArray(response.data)) {
        logger.success(' polinizacionService.getAllForAdmin() - Array directo recibido');
        logger.success(' Total de polinizaciones para admin:', response.data.length);
        return response.data;
      }

      // Fallback: si por alguna razón devuelve formato paginado
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        logger.success(' Total de polinizaciones para admin (paginado):', response.data.count);
        return response.data.results;
      }

      logger.warn('⚠️ polinizacionService.getAllForAdmin() - Formato de respuesta inesperado');
      return response.data;
    } catch (error: any) {
      logger.error('❌ polinizacionService.getAllForAdmin() - Error en la llamada:', error);
      logger.error('❌ Detalles del error:', error.response?.data || error.message);
      
      // Mejorar el manejo de errores específicos
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a estos datos.');
      } else if (error.response?.status === 404) {
        throw new Error('El endpoint de polinizaciones no fue encontrado.');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else if (!error.response) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
      }
      
      throw error;
    }
  },

  // Nuevo método para paginación
  getPaginated: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    fechapol_desde?: string;
    fechapol_hasta?: string;
    fechamad_desde?: string;
    fechamad_hasta?: string;
    tipo_polinizacion?: string;
    madre_codigo?: string;
    madre_genero?: string;
    madre_especie?: string;
    padre_codigo?: string;
    padre_genero?: string;
    padre_especie?: string;
    nueva_codigo?: string;
    nueva_genero?: string;
    nueva_especie?: string;
    ubicacion_tipo?: string;
    ubicacion_nombre?: string;
    responsable?: string;
    estado?: string;
    ordering?: string;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;

    logger.debug(' polinizacionService.getPaginated() - Parámetros:', params);

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
      if (params.fechapol_desde) queryParams.fechapol_desde = params.fechapol_desde;
      if (params.fechapol_hasta) queryParams.fechapol_hasta = params.fechapol_hasta;
      if (params.fechamad_desde) queryParams.fechamad_desde = params.fechamad_desde;
      if (params.fechamad_hasta) queryParams.fechamad_hasta = params.fechamad_hasta;
      if (params.tipo_polinizacion) queryParams.tipo_polinizacion = params.tipo_polinizacion;
      if (params.madre_codigo) queryParams.madre_codigo = params.madre_codigo;
      if (params.madre_genero) queryParams.madre_genero = params.madre_genero;
      if (params.madre_especie) queryParams.madre_especie = params.madre_especie;
      if (params.padre_codigo) queryParams.padre_codigo = params.padre_codigo;
      if (params.padre_genero) queryParams.padre_genero = params.padre_genero;
      if (params.padre_especie) queryParams.padre_especie = params.padre_especie;
      if (params.nueva_codigo) queryParams.nueva_codigo = params.nueva_codigo;
      if (params.nueva_genero) queryParams.nueva_genero = params.nueva_genero;
      if (params.nueva_especie) queryParams.nueva_especie = params.nueva_especie;
      if (params.ubicacion_tipo) queryParams.ubicacion_tipo = params.ubicacion_tipo;
      if (params.ubicacion_nombre) queryParams.ubicacion_nombre = params.ubicacion_nombre;
      if (params.responsable) queryParams.responsable = params.responsable;
      if (params.estado) queryParams.estado = params.estado;
      if (params.ordering) queryParams.ordering = params.ordering;

      const response = await api.get('polinizaciones/', {
        params: queryParams,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.success(' polinizacionService.getPaginated() - Respuesta recibida:', {
        page: page,
        totalPages: response.data?.total_pages,
        totalCount: response.data?.total_count,
        resultsCount: response.data?.results?.length
      });
      
      return {
        results: response.data?.results || [],
        totalCount: response.data?.total_count || 0,
        totalPages: response.data?.total_pages || 0,
        currentPage: page,
        pageSize: page_size,
        hasNext: response.data?.has_next || false,
        hasPrevious: response.data?.has_previous || false
      };
    } catch (error: any) {
      logger.error('❌ Error en polinizacionService.getPaginated():', error);
      logger.error('❌ Status:', error.response?.status);
      logger.error('❌ Data:', error.response?.data);
      
      // En caso de error, devolver estructura vacía
      return {
        results: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
        hasNext: false,
        hasPrevious: false
      };
    }
  },

  // Método optimizado para obtener solo el total de polinizaciones
  getTotalCount: async () => {
    logger.debug(' polinizacionService.getTotalCount() - Obteniendo solo el total...');
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      logger.debug(' polinizacionService.getTotalCount() - Token disponible:', !!token);
      
      if (!token) {
        logger.warn('⚠️ No hay token de autenticación disponible');
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Usar el endpoint paginado con page_size=1 para obtener solo el count
      const response = await api.get('polinizaciones', {
        params: {
          page: 1,
          page_size: 1
        },
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const totalCount = response.data?.total_count || response.data?.count || 0;
      logger.success(' polinizacionService.getTotalCount() - Total obtenido:', totalCount);
      
      return totalCount;
    } catch (error: any) {
      logger.error('❌ Error en polinizacionService.getTotalCount():', error);
      logger.error('❌ Status:', error.response?.status);
      logger.error('❌ Data:', error.response?.data);
      
      // En caso de error, devolver 0
      return 0;
    }
  },


  // Nuevo método para descargar PDF de mis polinizaciones usando el endpoint específico
  descargarMisPolinizacionesPDF: async (search?: string) => {
    logger.info('📄 polinizacionService.descargarMisPolinizacionesPDF() - Iniciando descarga...');
    logger.debug(' Búsqueda:', search);
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append('formato', 'pdf');
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`polinizaciones/reporte/?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      logger.success(' PDF de mis polinizaciones descargado exitosamente');
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error descargando PDF de mis polinizaciones:', error);
      throw error;
    }
  },

  getPolinizaciones: async () => {
    const response = await api.get('polinizaciones/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`polinizaciones/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    // Mapear campos del frontend al backend
    const mappedData: any = {};
    
    // Mapear fechas
    if (data.fecha_polinizacion) mappedData.fechapol = data.fecha_polinizacion;
    // Solo incluir fecha_maduracion si tiene valor
    if (data.fecha_maduracion && data.fecha_maduracion !== null) {
      mappedData.fechamad = data.fecha_maduracion;
    }
    
    // Mapear tipo de polinización
    if (data.tipo_polinizacion) {
      mappedData.tipo_polinizacion = data.tipo_polinizacion;
      
      // Mapear campo Tipo para predicción ML
      let tipoML = data.tipo_polinizacion;
      if (tipoML === 'SIBLING') tipoML = 'SIBBLING';
      if (tipoML === 'HIBRIDA') tipoML = 'HYBRID';
      mappedData.Tipo = tipoML;
      
      logger.debug(' DEBUG - Tipo mapeado:', {
        original: data.tipo_polinizacion,
        mapeado: tipoML,
        campo_Tipo: mappedData.Tipo
      });
    }
    
    // Mapear planta madre
    if (data.madre_codigo) mappedData.madre_codigo = data.madre_codigo;
    if (data.madre_genero) mappedData.madre_genero = data.madre_genero;
    if (data.madre_especie) mappedData.madre_especie = data.madre_especie;
    if (data.madre_clima) mappedData.madre_clima = data.madre_clima;
    
    // Mapear planta padre
    if (data.padre_codigo) mappedData.padre_codigo = data.padre_codigo;
    if (data.padre_genero) mappedData.padre_genero = data.padre_genero;
    if (data.padre_especie) mappedData.padre_especie = data.padre_especie;
    if (data.padre_clima) mappedData.padre_clima = data.padre_clima;
    
    // Mapear nueva planta
    if (data.nueva_codigo) mappedData.nueva_codigo = data.nueva_codigo;
    if (data.nueva_genero) mappedData.nueva_genero = data.nueva_genero;
    if (data.nueva_especie) mappedData.nueva_especie = data.nueva_especie;
    if (data.nueva_clima) mappedData.nueva_clima = data.nueva_clima;
    
    // Mapear ubicación
    if (data.vivero) mappedData.vivero = data.vivero;
    if (data.mesa) mappedData.mesa = data.mesa;
    if (data.pared) mappedData.pared = data.pared;
    if (data.ubicacion_tipo) mappedData.ubicacion_tipo = data.ubicacion_tipo;
    if (data.ubicacion_nombre) mappedData.ubicacion_nombre = data.ubicacion_nombre;
    
    // Mapear cantidad (el modelo usa cantidad_capsulas)
    if (data.cantidad_capsulas) mappedData.cantidad_capsulas = data.cantidad_capsulas;
    if (data.cantidad) mappedData.cantidad = data.cantidad;
    
    // Mapear otros campos
    if (data.responsable) mappedData.responsable = data.responsable;
    if (data.observaciones) mappedData.observaciones = data.observaciones;
    if (data.codigo) mappedData.codigo = data.codigo;
    if (data.estado) mappedData.estado = data.estado;
    
    // Mapear campos de predicción si existen
    if (data.prediccion_dias_estimados) mappedData.prediccion_dias_estimados = data.prediccion_dias_estimados;
    if (data.prediccion_confianza) mappedData.prediccion_confianza = data.prediccion_confianza;
    if (data.prediccion_fecha_estimada) mappedData.prediccion_fecha_estimada = data.prediccion_fecha_estimada;
    if (data.prediccion_tipo) mappedData.prediccion_tipo = data.prediccion_tipo;
    if (data.prediccion_condiciones_climaticas) mappedData.prediccion_condiciones_climaticas = data.prediccion_condiciones_climaticas;
    if (data.prediccion_especie_info) mappedData.prediccion_especie_info = data.prediccion_especie_info;
    if (data.prediccion_parametros_usados) mappedData.prediccion_parametros_usados = data.prediccion_parametros_usados;
    
    // Eliminar campos vacíos, null o undefined
    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === null || mappedData[key] === undefined || mappedData[key] === '') {
        delete mappedData[key];
      }
    });
    
    logger.info('📤 Enviando datos mapeados al backend:', mappedData);
    logger.debug(' DEBUG - Campos de predicción:', {
      madre_genero: mappedData.madre_genero,
      madre_especie: mappedData.madre_especie,
      nueva_genero: mappedData.nueva_genero,
      nueva_especie: mappedData.nueva_especie,
      padre_genero: mappedData.padre_genero,
      padre_especie: mappedData.padre_especie,
      genero: mappedData.genero,
      especie: mappedData.especie,
      Tipo: mappedData.Tipo,
      tipo_polinizacion: mappedData.tipo_polinizacion
    });
    
    const response = await api.post('polinizaciones/', mappedData);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`polinizaciones/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`polinizaciones/${id}/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('estadisticas/polinizaciones/');
    return response.data;
  },



  // NUEVAS FUNCIONES PARA AUTO-COMPLETADO DE GERMINACIONES
  getCodigosNuevasPlantas: async (): Promise<string[]> => {
    logger.debug(' polinizacionService.getCodigosNuevasPlantas() - Obteniendo códigos de nuevas plantas...');
    
    try {
      const allPolinizaciones = await polinizacionService.getAllForAdmin();
      const codigos = allPolinizaciones
        .map((polinizacion: any) => polinizacion.nueva_planta_codigo)
        .filter((codigo: string) => codigo && codigo.trim() !== '');

      logger.success(' polinizacionService.getCodigosNuevasPlantas() - Códigos obtenidos:', codigos.length);
      return codigos;
    } catch (error: any) {
      logger.error('❌ polinizacionService.getCodigosNuevasPlantas() - Error:', error);
      return [];
    }
  },

  getCodigosConEspecies: async (): Promise<{codigo: string, especie: string, genero: string, clima: string}[]> => {
    logger.debug(' polinizacionService.getCodigosConEspecies() - Obteniendo códigos de germinaciones...');

    try {
      // Obtener códigos desde el endpoint de germinaciones
      const response = await api.get('germinaciones/codigos-disponibles/');

      logger.success(' polinizacionService.getCodigosConEspecies() - Códigos obtenidos:', response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      logger.error('❌ polinizacionService.getCodigosConEspecies() - Error:', error);
      return [];
    }
  },

  getPolinizacionByCodigoNuevaPlanta: async (codigo: string): Promise<{codigo: string, especie: string, genero: string} | null> => {
    logger.debug(' DEBUG - polinizacionService.getPolinizacionByCodigoNuevaPlanta() - Buscando código:', codigo);

    try {
      logger.start(' polinizacionService.getPolinizacionByCodigoNuevaPlanta() - Obteniendo todas las polinizaciones...');
      const allPolinizaciones = await polinizacionService.getAllForAdmin();
      logger.debug(' DEBUG - Total de polinizaciones obtenidas:', allPolinizaciones.length);
      
      const polinizacion = allPolinizaciones.find((p: any) => {
        logger.debug(' DEBUG - Comparando:', p.nueva_planta_codigo, 'con', codigo, 'igual:', p.nueva_planta_codigo === codigo);
        return p.nueva_planta_codigo === codigo;
      });

      logger.debug(' DEBUG - Polinización encontrada:', polinizacion);

      if (polinizacion) {
        const result = {
          codigo: polinizacion.nueva_planta_codigo,
          especie: polinizacion.nueva_planta_especie || '',
          genero: polinizacion.nueva_planta_genero || ''
        };
        logger.success(' DEBUG - Retornando resultado:', result);
        return result;
      }
      logger.warn(' DEBUG - No se encontró polinización para el código:', codigo);
      return null;
    } catch (error: any) {
      logger.error('❌ polinizacionService.getPolinizacionByCodigoNuevaPlanta() - Error:', error);
      return null;
    }
  },

  // Obtener opciones para filtros y estadísticas
  getFilterOptions: async () => {
    logger.debug(' polinizacionService.getFilterOptions() - Obteniendo opciones de filtros...');

    try {
      const token = await SecureStore.secureStore.getItem('authToken');

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('polinizaciones/filter-options/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.success(' Opciones de filtros obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo opciones de filtros:', error);
      return {
        opciones: {
          estados: [],
          tipos_polinizacion: [],
          responsables: [],
          generos: [],
          especies: [],
          ubicacion_nombres: [],
          ubicacion_tipos: [],
        },
        estadisticas: {
          total: 0
        }
      };
    }
  },

  // Método para obtener alertas de polinizaciones
  obtenerAlertasPolinizacion: async () => {
    try {
      logger.info('🔔 polinizacionService.obtenerAlertasPolinizacion() - Obteniendo alertas...');

      const response = await api.get('polinizaciones/alertas_polinizacion/');

      logger.success(' Alertas de polinización obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo alertas de polinización:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron obtener las alertas de polinización.');
    }
  },

  // Método para buscar información de una planta por código
  buscarPlantaInfo: async (codigo: string): Promise<{codigo: string, genero: string, especie: string, clima: string, fuente: string} | null> => {
    try {
      logger.debug(' polinizacionService.buscarPlantaInfo() - Buscando planta con código:', codigo);

      if (!codigo || codigo.trim() === '') {
        logger.warn(' Código vacío, no se realizará búsqueda');
        return null;
      }

      const response = await api.get('polinizaciones/buscar-planta-info/', {
        params: { codigo: codigo.trim() }
      });

      logger.success(' Información de planta encontrada:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error buscando información de planta:', error);

      // Si es un 404, significa que no se encontró la planta
      if (error.response?.status === 404) {
        logger.warn(' No se encontró planta con código:', codigo);
        return null;
      }

      return null;
    }
  },

  // Método para obtener opciones de ubicación (viveros, mesas, paredes)
  getOpcionesUbicacion: async (): Promise<{
    viveros: { opciones: string[], total: number },
    mesas: { opciones: string[], total: number },
    paredes: { opciones: string[], total: number }
  }> => {
    try {
      logger.info('🏠 polinizacionService.getOpcionesUbicacion() - Obteniendo opciones de ubicación...');

      const response = await api.get('polinizaciones/opciones-ubicacion/');

      logger.success(' Opciones de ubicación obtenidas:', {
        viveros: response.data?.viveros?.total || 0,
        mesas: response.data?.mesas?.total || 0,
        paredes: response.data?.paredes?.total || 0
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo opciones de ubicación:', error);

      // Devolver estructura vacía en caso de error
      return {
        viveros: { opciones: [], total: 0 },
        mesas: { opciones: [], total: 0 },
        paredes: { opciones: [], total: 0 }
      };
    }
  },

  /**
   * Cambia el estado de una polinización
   * Si el estado es LISTA o LISTO, actualiza la fecha de maduración con la fecha actual
   */
  cambiarEstado: async (id: number, nuevoEstado: 'INGRESADO' | 'EN_PROCESO' | 'LISTA' | 'LISTO') => {
    try {
      logger.start(` Cambiando estado de polinización ${id} a ${nuevoEstado}`);
      
      // Preparar datos para actualizar
      const updateData: any = {
        estado: nuevoEstado
      };
      
      // Si el estado es LISTA o LISTO, agregar la fecha actual como fecha de maduración
      if (nuevoEstado === 'LISTA' || nuevoEstado === 'LISTO') {
        const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        updateData.fechamad = fechaActual;
        logger.info(`📅 Actualizando fecha de maduración a: ${fechaActual}`);
      }
      
      const response = await api.patch(`polinizaciones/${id}/`, updateData);
      logger.success(' Estado cambiado exitosamente');
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cambiando estado de polinización:', error);
      throw error;
    }
  },

  // NUEVAS FUNCIONES PARA PREDICCIÓN ML DE MADURACIÓN
  predecirMaduracion: async (data: {
    genero: string;
    especie: string;
    tipo: 'SELF' | 'SIBBLING' | 'HYBRID';
    fecha_pol: string;
    cantidad?: number;
  }) => {
    try {
      logger.info('🔮 Prediciendo maduración con ML:', data);

      const response = await api.post('polinizaciones/predecir-maduracion/', {
        genero: data.genero,
        especie: data.especie,
        tipo: data.tipo,
        fecha_pol: data.fecha_pol,
        cantidad: data.cantidad || 1
      });

      logger.success(' Predicción de maduración calculada:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error prediciendo maduración:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo calcular la predicción de maduración.');
    }
  },

  obtenerInfoModeloML: async () => {
    try {
      logger.info('📊 Obteniendo información del modelo ML...');

      const response = await api.get('polinizaciones/info-modelo-ml/');

      logger.success(' Información del modelo obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo info del modelo:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudo obtener la información del modelo.');
    }
  },

  // Marcar polinización como revisada
  marcarRevisado: async (
    id: number,
    estado?: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    progreso?: number,
    diasProximaRevision?: number
  ) => {
    try {
      logger.success(` Marcando polinización ${id} como revisada`);

      const data: any = {};
      if (estado) data.estado = estado;
      if (progreso !== undefined) data.progreso = progreso;
      if (diasProximaRevision) data.dias_proxima_revision = diasProximaRevision;

      const response = await api.post(`polinizaciones/${id}/marcar-revisado/`, data);

      logger.success(' Polinización marcada como revisada:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error marcando polinización como revisada:', error);
      throw error;
    }
  },

  // Obtener polinizaciones pendientes de revisión
  getPendientesRevision: async () => {
    try {
      logger.debug(' Obteniendo polinizaciones pendientes de revisión...');

      const response = await api.get('polinizaciones/pendientes-revision/');

      logger.success(' Polinizaciones pendientes obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error obteniendo polinizaciones pendientes:', error);
      throw error;
    }
  },

  // Cambiar estado de polinización
  cambiarEstadoPolinizacion: async (
    id: number,
    estado: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO',
    fechaMaduracion?: string
  ) => {
    try {
      logger.start(` Cambiando estado de polinización ${id} a ${estado}...`);
      
      const response = await api.post(`polinizaciones/${id}/cambiar-estado/`, {
        estado,
        fecha_maduracion: fechaMaduracion,
      });
      
      logger.success(' Estado de polinización actualizado:', response.data);
      return response.data.polinizacion;
    } catch (error: any) {
      logger.error('❌ Error cambiando estado de polinización:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('No se pudo cambiar el estado de la polinización.');
    }
  },

  // Actualizar progreso de polinización
  actualizarProgresoPolinizacion: async (
    id: number,
    progreso: number,
    fechaMaduracion?: string
  ) => {
    try {
      logger.info(`📊 Actualizando progreso de polinización ${id} a ${progreso}%...`);
      
      const response = await api.post(`polinizaciones/${id}/cambiar-estado/`, {
        progreso,
        fecha_maduracion: fechaMaduracion,
      });
      
      logger.success(' Progreso de polinización actualizado:', response.data);
      return response.data.polinizacion;
    } catch (error: any) {
      logger.error('❌ Error actualizando progreso de polinización:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('No se pudo actualizar el progreso de la polinización.');
    }
  }
};

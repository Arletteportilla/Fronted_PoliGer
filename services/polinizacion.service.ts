import api from './api';
import * as SecureStore from '@/services/secureStore';
import { logger } from '@/services/logger';

export const polinizacionService = {
  /**
   * Obtiene solo las polinizaciones del usuario autenticado
   * Por defecto filtra los últimos 7 días para mostrar solo registros recientes (no importados)
   */
  getMisPolinizaciones: async (diasRecientes: number = 7) => {
    try {
      const params: any = {};
      if (diasRecientes > 0) {
        params.dias_recientes = diasRecientes;
      }

      const response = await api.get('polinizaciones/mis-polinizaciones/', {
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
      logger.error('❌ Error obteniendo mis polinizaciones:', error);
      return [];
    }
  },

  /**
   * Obtiene las polinizaciones del usuario autenticado con paginación
   */
  getMisPolinizacionesPaginated: async (params: {
    page?: number | undefined;
    page_size?: number | undefined;
    search?: string | undefined;
    dias_recientes?: number | undefined;
    tipo_registro?: 'historicos' | 'nuevos' | undefined;
  } = {}) => {
    const page = params.page || 1;
    const page_size = params.page_size || 20;
    const dias_recientes = params.dias_recientes !== undefined ? params.dias_recientes : 7; // Por defecto 7 días

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

      // Agregar filtro de tipo de registro
      if (params.tipo_registro) {
        queryParams.tipo_registro = params.tipo_registro;
      }

      const response = await api.get('polinizaciones/mis-polinizaciones/', {
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
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      
      const response = await api.get('polinizaciones/');
      
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
    
    try {
      // Verificar si hay token antes de hacer la llamada
      const token = await SecureStore.secureStore.getItem('authToken');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      const response = await api.get('polinizaciones/todas_admin/');
      
      // El endpoint todas_admin devuelve un ARRAY DIRECTO de todas las polinizaciones
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback: si por alguna razón devuelve formato paginado
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }

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
    page?: number | undefined;
    page_size?: number | undefined;
    search?: string | undefined;
    fechapol_desde?: string | undefined;
    fechapol_hasta?: string | undefined;
    fechamad_desde?: string | undefined;
    fechamad_hasta?: string | undefined;
    tipo_polinizacion?: string | undefined;
    madre_codigo?: string | undefined;
    madre_genero?: string | undefined;
    madre_especie?: string | undefined;
    padre_codigo?: string | undefined;
    padre_genero?: string | undefined;
    padre_especie?: string | undefined;
    nueva_codigo?: string | undefined;
    nueva_genero?: string | undefined;
    nueva_especie?: string | undefined;
    ubicacion_tipo?: string | undefined;
    ubicacion_nombre?: string | undefined;
    responsable?: string | undefined;
    estado?: string | undefined;
    tipo_registro?: 'historicos' | 'nuevos' | undefined;
    ordering?: string | undefined;
  } = {}) => {
    // Para simplificar, usar getMisPolinizacionesPaginated que ya maneja el filtro tipo_registro
    return await polinizacionService.getMisPolinizacionesPaginated({
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      dias_recientes: 0, // Mostrar todas las polinizaciones sin filtro de fecha
      tipo_registro: params.tipo_registro
    });
  },


  // Método optimizado para obtener solo el total de polinizaciones
  getTotalCount: async () => {
    
    try {
      const token = await SecureStore.secureStore.getItem('authToken');
      
      if (!token) {
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
    // Siempre incluir cantidad_solicitada y cantidad_disponible, incluso si son 0 o string
    mappedData.cantidad_solicitada = data.cantidad_solicitada ? parseInt(data.cantidad_solicitada) || 0 : 0;
    mappedData.cantidad_disponible = data.cantidad_disponible ? parseInt(data.cantidad_disponible) || 0 : 0;

    // Mapear otros campos
    if (data.responsable) mappedData.responsable = data.responsable;
    if (data.observaciones) mappedData.observaciones = data.observaciones;
    if (data.codigo) mappedData.codigo = data.codigo;
    if (data.estado) mappedData.estado = data.estado;
    
    // Mapear campos de predicción ML si existen
    if (data.dias_maduracion_predichos) mappedData.dias_maduracion_predichos = parseInt(data.dias_maduracion_predichos) || null;
    if (data.fecha_maduracion_predicha) mappedData.fecha_maduracion_predicha = data.fecha_maduracion_predicha;
    if (data.metodo_prediccion) mappedData.metodo_prediccion = data.metodo_prediccion;
    if (data.confianza_prediccion) mappedData.confianza_prediccion = parseFloat(data.confianza_prediccion) || null;

    // Mapear campos de predicción legacy (compatibilidad)
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

    const response = await api.post('polinizaciones/', mappedData);
    return response.data;
  },

  update: async (id: number, data: any) => {
    // Asegurar que los campos de cantidad y predicción se envíen correctamente
    const updateData: any = {
      ...data,
      cantidad_solicitada: data.cantidad_solicitada ? parseInt(data.cantidad_solicitada) || 0 : 0,
      cantidad_disponible: data.cantidad_disponible ? parseInt(data.cantidad_disponible) || 0 : 0,
    };

    // Agregar campos de predicción ML si existen
    if (data.dias_maduracion_predichos) updateData.dias_maduracion_predichos = parseInt(data.dias_maduracion_predichos) || null;
    if (data.fecha_maduracion_predicha) updateData.fecha_maduracion_predicha = data.fecha_maduracion_predicha;
    if (data.metodo_prediccion) updateData.metodo_prediccion = data.metodo_prediccion;
    if (data.confianza_prediccion) updateData.confianza_prediccion = parseFloat(data.confianza_prediccion) || null;

    const response = await api.put(`polinizaciones/${id}/`, updateData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`polinizaciones/${id}/`);
    return response.data;
  },

  getStats: async (soloNuevos: boolean = false) => {
    const params: any = {};
    if (soloNuevos) params.solo_nuevos = 'true';
    const response = await api.get('estadisticas/polinizaciones/', { params });
    return response.data;
  },



  // NUEVAS FUNCIONES PARA AUTO-COMPLETADO DE GERMINACIONES
  getCodigosNuevasPlantas: async (): Promise<string[]> => {
    
    try {
      const allPolinizaciones = await polinizacionService.getAllForAdmin();
      const codigos = allPolinizaciones
        .map((polinizacion: any) => polinizacion.nueva_planta_codigo)
        .filter((codigo: string) => codigo && codigo.trim() !== '');

      return codigos;
    } catch (error: any) {
      logger.error('❌ polinizacionService.getCodigosNuevasPlantas() - Error:', error);
      return [];
    }
  },

  getCodigosConEspecies: async (): Promise<{codigo: string, especie: string, genero: string, clima: string}[]> => {

    try {
      // Obtener códigos desde el endpoint de germinaciones
      const response = await api.get('germinaciones/codigos-disponibles/');

      return response.data || [];
    } catch (error: any) {
      logger.error('❌ polinizacionService.getCodigosConEspecies() - Error:', error);
      return [];
    }
  },

  getPolinizacionByCodigoNuevaPlanta: async (codigo: string): Promise<{codigo: string, especie: string, genero: string} | null> => {

    try {
      const allPolinizaciones = await polinizacionService.getAllForAdmin();
      
      const polinizacion = allPolinizaciones.find((p: any) => {
        return p.nueva_planta_codigo === codigo;
      });


      if (polinizacion) {
        const result = {
          codigo: polinizacion.nueva_planta_codigo,
          especie: polinizacion.nueva_planta_especie || '',
          genero: polinizacion.nueva_planta_genero || ''
        };
        return result;
      }
      return null;
    } catch (error: any) {
      logger.error('❌ polinizacionService.getPolinizacionByCodigoNuevaPlanta() - Error:', error);
      return null;
    }
  },

  // Obtener opciones para filtros y estadísticas
  getFilterOptions: async () => {

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

      const response = await api.get('polinizaciones/alertas_polinizacion/');

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

      if (!codigo || codigo.trim() === '') {
        return null;
      }

      const response = await api.get('polinizaciones/buscar-planta-info/', {
        params: { codigo: codigo.trim() }
      });

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error buscando información de planta:', error);

      // Si es un 404, significa que no se encontró la planta
      if (error.response?.status === 404) {
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
      const response = await api.get('polinizaciones/opciones-ubicacion/');
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
      // Preparar datos para actualizar
      const updateData: any = {
        estado: nuevoEstado
      };
      
      // Si el estado es LISTA o LISTO, agregar la fecha actual como fecha de maduración
      if (nuevoEstado === 'LISTA' || nuevoEstado === 'LISTO') {
        const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        updateData.fechamad = fechaActual;
      }
      
      const response = await api.patch(`polinizaciones/${id}/`, updateData);
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

      const response = await api.post('polinizaciones/predecir-maduracion/', {
        genero: data.genero,
        especie: data.especie,
        tipo: data.tipo,
        fecha_pol: data.fecha_pol,
        cantidad: data.cantidad || 1
      });

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

      const response = await api.get('polinizaciones/info-modelo-ml/');

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

      const data: any = {};
      if (estado) data.estado = estado;
      if (progreso !== undefined) data.progreso = progreso;
      if (diasProximaRevision) data.dias_proxima_revision = diasProximaRevision;

      const response = await api.post(`polinizaciones/${id}/marcar-revisado/`, data);

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error marcando polinización como revisada:', error);
      throw error;
    }
  },

  // Obtener polinizaciones pendientes de revisión
  getPendientesRevision: async () => {
    try {

      const response = await api.get('polinizaciones/pendientes-revision/');

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
      
      const response = await api.post(`polinizaciones/${id}/cambiar-estado/`, {
        estado,
        fecha_maduracion: fechaMaduracion,
      });
      
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
      
      const response = await api.post(`polinizaciones/${id}/cambiar-estado/`, {
        progreso,
        fecha_maduracion: fechaMaduracion,
      });
      
      return response.data.polinizacion;
    } catch (error: any) {
      logger.error('❌ Error actualizando progreso de polinización:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('No se pudo actualizar el progreso de la polinización.');
    }
  },

  /**
   * Genera predicciones para todas las polinizaciones del usuario que no las tengan
   */
  generarPrediccionesUsuario: async () => {
    try {

      const response = await api.post('polinizaciones/generar-predicciones-usuario/');

      return response.data;
    } catch (error: any) {
      logger.error('❌ Error generando predicciones:', error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error('No se pudieron generar las predicciones.');
    }
  },

  /**
   * Busca el género correspondiente a una especie en las polinizaciones
   * Útil para autocompletar el género en formularios de germinación
   */
  buscarGeneroPorEspecie: async (especie: string): Promise<{ found: boolean; genero: string | null }> => {
    try {
      if (!especie || especie.trim() === '') {
        return { found: false, genero: null };
      }

      const response = await api.get('polinizaciones/buscar-genero-por-especie/', {
        params: { especie: especie.trim() }
      });

      return {
        found: response.data.found || false,
        genero: response.data.genero || null
      };
    } catch (error: any) {
      logger.error('Error buscando genero por especie:', error);
      return { found: false, genero: null };
    }
  }
};

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { polinizacionService } from '@/services/polinizacion.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'expo-router';
import { logger } from '@/services/logger';

export const usePolinizaciones = () => {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Estados principales
  const [polinizaciones, setPolinizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [usePagination] = useState(true);
  
  // Estados para predicción
  const [prediccion, setPrediccion] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  
  // Función para obtener el nombre completo del usuario
  const getUserFullName = () => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim();
  };

  const loadPolinizaciones = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      
      if (!user) {
        logger.warn(' Usuario no autenticado, saltando carga de polinizaciones');
        setLoading(false);
        return;
      }

      logger.start(' Cargando polinizaciones...', showOnlyMine ? 'Solo mías' : 'Todas', 'Página:', page);
      
      let data;
      let paginationInfo = null;
      
      if (showOnlyMine) {
        data = await polinizacionService.getMisPolinizaciones();
      } else if (usePagination) {
        paginationInfo = await polinizacionService.getPaginated({ page, page_size: pageSize });
        data = paginationInfo.results;
        
        setTotalPages(paginationInfo.totalPages);
        setTotalCount(paginationInfo.totalCount);
        setHasNext(paginationInfo.hasNext);
        setHasPrevious(paginationInfo.hasPrevious);
        setCurrentPage(paginationInfo.currentPage);
      } else {
        const paginatedData = await polinizacionService.getPaginated({ page: 1, page_size: 1000 });
        data = paginatedData.results || [];
      }
      
      if (data && data.length > 0) {
        if (!usePagination || showOnlyMine) {
          const sortedData = data.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha_creacion || a.fechapol || new Date());
            const dateB = new Date(b.fecha_creacion || b.fechapol || new Date());
            return dateB.getTime() - dateA.getTime();
          });
          setPolinizaciones(sortedData);
        } else {
          setPolinizaciones(data);
        }
      } else {
        setPolinizaciones([]);
      }
    } catch (error) {
      logger.error('❌ Error loading polinizaciones', error);

      if ((error as any).response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        router.replace('/login');
      } else if ((error as any).response?.status === 403) {
        toast.error('No tienes permisos para acceder a estas polinizaciones.');
      } else {
        toast.error('No se pudieron cargar las polinizaciones. Verifica tu conexión.');
      }

      setPolinizaciones([]);
    } finally {
      setLoading(false);
    }
  }, [showOnlyMine, user, usePagination, pageSize, currentPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPolinizaciones();
    setRefreshing(false);
  }, [loadPolinizaciones]);

  // Comentado para evitar conflictos con el hook de paginación
  // useEffect(() => {
  //   if (user) {
  //     loadPolinizaciones();
  //   }
  // }, [loadPolinizaciones, user]);

  // Función para generar predicción
  const handlePrediccion = async (form: any): Promise<any> => {
    // Validar campos requeridos
    if (!form.tipo_polinizacion) {
      toast.error('Para generar una predicción necesitas seleccionar el tipo de polinización.');
      return null;
    }

    // Obtener género y especie
    let generoParaPrediccion = '';
    let especieParaPrediccion = '';
    
    if (form.madre_genero?.trim() && form.madre_especie?.trim()) {
      generoParaPrediccion = form.madre_genero.trim();
      especieParaPrediccion = form.madre_especie.trim();
    } else if (form.nueva_genero?.trim() && form.nueva_especie?.trim()) {
      generoParaPrediccion = form.nueva_genero.trim();
      especieParaPrediccion = form.nueva_especie.trim();
    } else if (form.padre_genero?.trim() && form.padre_especie?.trim()) {
      generoParaPrediccion = form.padre_genero.trim();
      especieParaPrediccion = form.padre_especie.trim();
    }

    if (!generoParaPrediccion || !especieParaPrediccion) {
      toast.error('Para generar una predicción necesitas especificar género y especie de al menos una planta.');
      return null;
    }

    setIsPredicting(true);
    try {
      // Preparar datos para la predicción ML
      const fechaPolinizacion = form.fecha_polinizacion || new Date().toISOString().split('T')[0];
      
      // Mapear tipo de polinización al formato del backend
      let tipoML = form.tipo_polinizacion;
      if (tipoML === 'SIBLING') tipoML = 'SIBBLING'; // Corregir ortografía
      if (tipoML === 'HIBRIDA') tipoML = 'HYBRID'; // Traducir

      logger.info('🔮 Solicitando predicción ML con:', {
        genero: generoParaPrediccion,
        especie: especieParaPrediccion,
        tipo: tipoML,
        fecha_pol: fechaPolinizacion,
        cantidad: form.cantidad_capsulas || 1
      });

      // Usar el nuevo endpoint de predicción ML
      const resultado = await polinizacionService.predecirMaduracion({
        genero: generoParaPrediccion,
        especie: especieParaPrediccion,
        tipo: tipoML,
        fecha_pol: fechaPolinizacion,
        cantidad: form.cantidad_capsulas || 1
      });

      if (!resultado.success || !resultado.prediccion) {
        throw new Error('No se recibió predicción del servidor');
      }

      const pred = resultado.prediccion;
      const fechaEstimada = new Date(pred.fecha_estimada);

      // Calcular días restantes desde hoy hasta la fecha estimada
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaEstimada.setHours(0, 0, 0, 0);
      const diasRestantes = Math.ceil((fechaEstimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      const prediccionConFecha = {
        dias_estimados: pred.dias_estimados,
        fecha_estimada_semillas: pred.fecha_estimada,
        fecha_estimada_formateada: fechaEstimada.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dias_restantes: diasRestantes,
        confianza: pred.confianza,
        nivel_confianza: pred.nivel_confianza,
        metodo: pred.metodo,
        modelo: pred.modelo,
        rango_probable: pred.rango_probable,
        // Formato para el modal
        tipo_prediccion: 'ML',
        especie_info: {
          especie: `${generoParaPrediccion} ${especieParaPrediccion}`,
          tipo: tipoML,
          metodo: pred.metodo,
          modelo: pred.modelo,
          factores_considerados: [
            `Género: ${generoParaPrediccion}`,
            `Especie: ${especieParaPrediccion}`,
            `Tipo de polinización: ${tipoML}`,
            `Modelo: ${pred.modelo}`,
            `Confianza: ${pred.confianza.toFixed(1)}%`
          ]
        },
        parametros_usados: {
          especie: `${generoParaPrediccion} ${especieParaPrediccion}`,
          genero: generoParaPrediccion,
          tipo: tipoML
        }
      };

      setPrediccion(prediccionConFecha);

      toast.success(`Predicción generada: ${pred.dias_estimados} días hasta maduración`);

      return prediccionConFecha;
    } catch (error: any) {
      logger.error('❌ Error generando predicción ML:', error);

      let errorMessage = 'No se pudo generar la predicción.';
      if (error.message?.includes('timeout')) {
        errorMessage = 'La predicción tardó demasiado tiempo. Intenta nuevamente.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return null;
    } finally {
      setIsPredicting(false);
    }
  };

  // Función para guardar polinización
  const handleSave = async (form: any, isEdit: boolean = false) => {
    try {
      setSaving(true);

      if (!form.fecha_polinizacion || !form.tipo_polinizacion) {
        toast.error('Por favor completa todos los campos requeridos');
        return false;
      }

      // Validaciones específicas según el tipo de polinización
      if (form.tipo_polinizacion === 'SELF') {
        if (!form.madre_codigo || !form.madre_genero || !form.madre_especie) {
          toast.error('Para polinización SELF, la información de la planta madre es requerida');
          return false;
        }
        if (!form.nueva_codigo || !form.nueva_genero || !form.nueva_especie) {
          toast.error('Para polinización SELF, la información de la nueva planta es requerida');
          return false;
        }
      } else if (form.tipo_polinizacion === 'SIBLING' || form.tipo_polinizacion === 'HIBRIDA') {
        if (!form.madre_codigo || !form.madre_genero || !form.madre_especie) {
          toast.error(`Para polinización ${form.tipo_polinizacion}, la información de la planta madre es requerida`);
          return false;
        }
        if (!form.padre_codigo || !form.padre_genero || !form.padre_especie) {
          toast.error(`Para polinización ${form.tipo_polinizacion}, la información de la planta padre es requerida`);
          return false;
        }
        if (!form.nueva_codigo || !form.nueva_genero || !form.nueva_especie) {
          toast.error(`Para polinización ${form.tipo_polinizacion}, la información de la nueva planta es requerida`);
          return false;
        }
      }

      const polinizacionData = {
        ...form,
        fecha_polinizacion: form.fecha_polinizacion,
        fecha_maduracion: form.fecha_maduracion || null,
        cantidad_solicitada: parseInt(form.cantidad_solicitada) || 0,
        cantidad_disponible: parseInt(form.cantidad_disponible) || 0,
        ...(prediccion && {
          prediccion_dias_estimados: prediccion.dias_estimados,
          prediccion_confianza: prediccion.confianza,
          prediccion_fecha_estimada: prediccion.fecha_estimada_semillas,
          prediccion_tipo: prediccion.tipo_prediccion,
          // Guardar información adicional de la predicción
          prediccion_condiciones_climaticas: prediccion.condiciones_climaticas || '',
          prediccion_especie_info: JSON.stringify(prediccion.especie_info || {}),
          prediccion_parametros_usados: JSON.stringify(prediccion.parametros_usados || {}),
        }),
      };

      logger.info('📝 Datos a guardar:', polinizacionData);

      if (isEdit && form.id) {
        // Actualizar polinización existente
        await polinizacionService.update(form.id, polinizacionData);
        toast.success('Polinización actualizada correctamente');
      } else {
        // Crear nueva polinización
        await polinizacionService.create(polinizacionData);
        toast.success('Polinización creada correctamente');
      }

      loadPolinizaciones();
      return true;
    } catch (error) {
      logger.error('Error saving polinización:', error);
      toast.error(`No se pudo ${isEdit ? 'actualizar' : 'guardar'} la polinización`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    // Estados
    polinizaciones,
    loading,
    refreshing,
    showOnlyMine,
    saving,
    prediccion,
    isPredicting,
    
    // Paginación
    currentPage,
    totalPages,
    totalCount,
    hasNext,
    hasPrevious,
    usePagination,
    
    // Funciones
    loadPolinizaciones,
    onRefresh,
    setShowOnlyMine,
    getUserFullName,
    setPrediccion,
    handlePrediccion,
    handleSave,
  };
};
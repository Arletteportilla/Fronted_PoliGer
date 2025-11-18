import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { polinizacionService } from '@/services/polinizacion.service';
import { prediccionService } from '@/services/prediccion.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export const usePolinizaciones = () => {
  const { user } = useAuth();
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
        console.log('⚠️ Usuario no autenticado, saltando carga de polinizaciones');
        setLoading(false);
        return;
      }

      console.log('🔄 Cargando polinizaciones...', showOnlyMine ? 'Solo mías' : 'Todas', 'Página:', page);
      
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
      console.error('❌ Error loading polinizaciones', error);
      
      if ((error as any).response?.status === 401) {
        Alert.alert(
          'Sesión Expirada', 
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ text: 'Ir a Login', onPress: () => router.replace('/login') }]
        );
      } else if ((error as any).response?.status === 403) {
        Alert.alert(
          'Sin Permisos', 
          'No tienes permisos para acceder a estas polinizaciones.',
          [{ text: 'Cambiar Vista', onPress: () => setShowOnlyMine(!showOnlyMine) }]
        );
      } else {
        Alert.alert('Error', 'No se pudieron cargar las polinizaciones. Verifica tu conexión.');
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
    if (!form.tipo_polinizacion) {
      Alert.alert('Error', 'Para generar una predicción necesitas seleccionar el tipo de polinización.');
      return null;
    }

    // Usar los nombres correctos de los campos del formulario
    let especieParaPrediccion = '';
    if (form.madre_especie?.trim()) {
      especieParaPrediccion = form.madre_especie.trim();
    } else if (form.nueva_especie?.trim()) {
      especieParaPrediccion = form.nueva_especie.trim();
    } else if (form.padre_especie?.trim()) {
      especieParaPrediccion = form.padre_especie.trim();
    }

    if (!especieParaPrediccion) {
      Alert.alert('Error', 'Para generar una predicción necesitas especificar al menos una especie de planta.');
      return null;
    }

    setIsPredicting(true);
    try {
      // Preparar datos para la predicción
      const fechaPolinizacion = form.fecha_polinizacion || new Date().toISOString().split('T')[0];

      const resultado = await prediccionService.predecirPolinizacionInicial({
        especie: especieParaPrediccion,
        clima: form.madre_clima || form.nueva_clima || form.padre_clima,
        ubicacion: form.vivero || form.ubicacion,
        fecha_polinizacion: fechaPolinizacion,
      });

      // El backend ya devuelve fecha_estimada_semillas calculada correctamente
      const fechaEstimada = new Date(resultado.fecha_estimada_semillas);

      // Calcular días restantes desde hoy hasta la fecha estimada
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaEstimada.setHours(0, 0, 0, 0);
      const diasRestantes = Math.ceil((fechaEstimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      const prediccionConFecha = {
        ...resultado,
        fecha_estimada_formateada: fechaEstimada.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dias_restantes: diasRestantes
      };

      setPrediccion(prediccionConFecha);
      
      Alert.alert(
        'Predicción Generada', 
        `La polinización de ${especieParaPrediccion} debería madurar en aproximadamente ${resultado.dias_estimados} días.\n\nFecha estimada: ${prediccionConFecha.fecha_estimada_formateada}\nConfianza: ${resultado.confianza}%`,
        [{ text: 'OK' }]
      );
      
      return prediccionConFecha;
    } catch (error: any) {
      console.error('❌ Error generando predicción:', error);
      
      let errorMessage = 'No se pudo generar la predicción.';
      if (error.message?.includes('timeout')) {
        errorMessage = 'La predicción tardó demasiado tiempo. Intenta nuevamente.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error en Predicción', errorMessage);
      return null;
    } finally {
      setIsPredicting(false);
    }
  };

  // Función para guardar polinización
  const handleSave = async (form: any) => {
    try {
      setSaving(true);
      
      if (!form.fecha_polinizacion || !form.tipo_polinizacion) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return false;
      }

      // Validaciones específicas según el tipo de polinización
      if (form.tipo_polinizacion === 'SELF') {
        if (!form.madre_codigo || !form.madre_genero || !form.madre_especie) {
          Alert.alert('Error', 'Para polinización SELF, la información de la planta madre es requerida');
          return false;
        }
        if (!form.nueva_codigo || !form.nueva_genero || !form.nueva_especie) {
          Alert.alert('Error', 'Para polinización SELF, la información de la nueva planta es requerida');
          return false;
        }
      } else if (form.tipo_polinizacion === 'SIBLING' || form.tipo_polinizacion === 'HIBRIDO') {
        if (!form.madre_codigo || !form.madre_genero || !form.madre_especie) {
          Alert.alert('Error', `Para polinización ${form.tipo_polinizacion}, la información de la planta madre es requerida`);
          return false;
        }
        if (!form.padre_codigo || !form.padre_genero || !form.padre_especie) {
          Alert.alert('Error', `Para polinización ${form.tipo_polinizacion}, la información de la planta padre es requerida`);
          return false;
        }
        if (!form.nueva_codigo || !form.nueva_genero || !form.nueva_especie) {
          Alert.alert('Error', `Para polinización ${form.tipo_polinizacion}, la información de la nueva planta es requerida`);
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

      console.log('📝 Datos a guardar:', polinizacionData);

      await polinizacionService.create(polinizacionData);
      
      Alert.alert('Éxito', 'Polinización creada correctamente');
      loadPolinizaciones();
      return true;
    } catch (error) {
      console.error('Error saving polinización:', error);
      Alert.alert('Error', 'No se pudo guardar la polinización');
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
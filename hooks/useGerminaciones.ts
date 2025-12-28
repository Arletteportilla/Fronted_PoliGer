// Custom hook for germinaciones logic - extracted from germinaciones.tsx
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { germinacionService } from '../services/germinacion.service';
import { validateRequiredFields, getResponsableName } from '../utils/formValidation';
import { usePagination } from './usePagination';
import { useToast } from '../contexts/ToastContext';

export const useGerminaciones = (user: any) => {
  const toast = useToast();
  const [germinaciones, setGerminaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [search, setSearch] = useState('');
  const [codigosDisponibles, setCodigosDisponibles] = useState<string[]>([]);
  const [codigosConEspecies, setCodigosConEspecies] = useState<{codigo: string, especie: string}[]>([]);
  const [especiesDisponibles, setEspeciesDisponibles] = useState<string[]>([]);
  const [perchasDisponibles, setPerchasDisponibles] = useState<string[]>([]);
  const [nivelesDisponibles, setNivelesDisponibles] = useState<string[]>([]);

  const pagination = usePagination(20);

  // Initial form state
  const initialFormState = {
    fecha_polinizacion: '',
    fecha_siembra: '',
    codigo: '',
    genero: '',
    especie_variedad: '',
    clima: 'I',
    percha: '',
    nivel: '',
    clima_lab: 'I',
    finca: '',
    numero_vivero: '',
    cantidad_solicitada: '',
    no_capsulas: '',
    estado_capsula: 'CERRADA',
    estado_semilla: 'MADURA',
    cantidad_semilla: 'ABUNDANTE',
    semilla_en_stock: false,
    observaciones: '',
    responsable: getResponsableName(user),
    etapa_actual: 'INGRESADO',
  };

  const [form, setForm] = useState(initialFormState);

  // Load available codes for autocomplete
  const loadCodigosDisponibles = useCallback(async () => {
    try {
      console.log('🔍 useGerminaciones: Cargando códigos desde PostgreSQL para autocompletado...');
      const codes = await germinacionService.getCodes();
      setCodigosDisponibles(codes);
      console.log('✅ useGerminaciones: Códigos cargados y guardados en estado:', codes.length);
      console.log('📋 useGerminaciones: Primeros 10 códigos disponibles:', codes.slice(0, 10));
    } catch (error) {
      console.error('❌ useGerminaciones: Error cargando códigos:', error);
      setCodigosDisponibles([]);
    }
  }, []);

  // Load codes with species for autocomplete
  const loadCodigosConEspecies = useCallback(async () => {
    try {
      console.log('🔍 Cargando códigos con especies para autocompletado...');
      const codesWithSpecies = await germinacionService.getCodesWithSpecies();
      setCodigosConEspecies(codesWithSpecies);
      
      // Extraer especies únicas para el autocompletado
      const especiesUnicas = Array.from(new Set(codesWithSpecies.map(item => item.especie).filter(Boolean)));
      setEspeciesDisponibles(especiesUnicas);
      
      console.log('✅ Códigos con especies cargados:', codesWithSpecies.length);
      console.log('✅ Especies únicas extraídas:', especiesUnicas.length);
      console.log('📋 Primeras 5 especies:', especiesUnicas.slice(0, 5));
    } catch (error) {
      console.error('❌ Error cargando códigos con especies:', error);
      setCodigosConEspecies([]);
      setEspeciesDisponibles([]);
    }
  }, []);

  // Load available perchas and niveles for selectors
  const loadPerchasDisponibles = useCallback(async () => {
    try {
      console.log('🔍 useGerminaciones: Cargando perchas y niveles disponibles...');
      const opciones = await germinacionService.getFiltrosOpciones();

      // Eliminar duplicados usando Set por si acaso
      const perchasUnicas = Array.from(new Set(opciones.perchas));
      const nivelesUnicos = Array.from(new Set(opciones.niveles));

      setPerchasDisponibles(perchasUnicas);
      setNivelesDisponibles(nivelesUnicos);

      console.log('✅ useGerminaciones: Perchas cargadas:', perchasUnicas.length);
      console.log('✅ useGerminaciones: Niveles cargados:', nivelesUnicos.length);
      console.log('📋 useGerminaciones: Primeras 5 perchas:', perchasUnicas.slice(0, 5));
      console.log('📋 useGerminaciones: Niveles:', nivelesUnicos);
    } catch (error) {
      console.error('❌ useGerminaciones: Error cargando perchas y niveles:', error);
      setPerchasDisponibles([]);
      setNivelesDisponibles([]);
    }
  }, []);

  // Handle code selection and auto-complete species and genus
  const handleCodigoSelection = useCallback(async (codigoSeleccionado: string) => {
    try {
      console.log('🔍 DEBUG - handleCodigoSelection llamado con:', codigoSeleccionado);

      setForm(prev => ({ ...prev, codigo: codigoSeleccionado }));

      // Buscar la germinación por código para autocompletar género y especie
      const germinacion = await germinacionService.getGerminacionByCode(codigoSeleccionado);

      if (germinacion) {
        console.log('✅ DEBUG - Germinación encontrada:', germinacion);

        // Preparar los campos a autocompletar
        const updatedFields: any = {
          codigo: codigoSeleccionado,
        };

        // Autocompletar especie/variedad si está disponible
        if (germinacion.especie) {
          updatedFields.especie_variedad = germinacion.especie;
          console.log('✅ DEBUG - Autocompletando especie_variedad:', germinacion.especie);
        }

        // Autocompletar género si está disponible
        if (germinacion.genero) {
          updatedFields.genero = germinacion.genero;
          console.log('✅ DEBUG - Autocompletando genero:', germinacion.genero);
        }

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
      } else {
        console.log('⚠️ DEBUG - No se encontró germinación para el código:', codigoSeleccionado);
      }
    } catch (error) {
      console.error('❌ Error en handleCodigoSelection:', error);
    }
  }, []);

  // Handle species selection and auto-complete code and genus
  const handleEspecieSelection = useCallback(async (especieSeleccionada: string) => {
    try {
      console.log('🔍 DEBUG - handleEspecieSelection llamado con:', especieSeleccionada);

      setForm(prev => ({ ...prev, especie_variedad: especieSeleccionada }));

      // Buscar la germinación por especie para autocompletar código y género
      const germinacion = await germinacionService.getGerminacionByEspecie(especieSeleccionada);

      if (germinacion) {
        console.log('✅ DEBUG - Germinación encontrada por especie:', germinacion);

        // Preparar los campos a autocompletar
        const updatedFields: any = {
          especie_variedad: especieSeleccionada,
        };

        // Autocompletar código si está disponible
        if (germinacion.codigo) {
          updatedFields.codigo = germinacion.codigo;
          console.log('✅ DEBUG - Autocompletando codigo:', germinacion.codigo);
        }

        // Autocompletar género si está disponible
        if (germinacion.genero) {
          updatedFields.genero = germinacion.genero;
          console.log('✅ DEBUG - Autocompletando genero:', germinacion.genero);
        }

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
      } else {
        console.log('⚠️ DEBUG - No se encontró germinación para la especie:', especieSeleccionada);
      }
    } catch (error) {
      console.error('❌ Error en handleEspecieSelection:', error);
    }
  }, []);

  // Load germinaciones
  const loadGerminaciones = useCallback(async (page: number = 1) => {
    try {
      if (!user) {
        console.log('⚠️ Usuario no autenticado, saltando carga de germinaciones');
        setLoading(false);
        return;
      }

      console.log('🔄 Cargando germinaciones...', showOnlyMine ? 'Solo mías' : 'Todas', 'Página:', page);
      console.log('🔍 Estado actual:', { showOnlyMine, user: user?.username });

      let data;

      if (showOnlyMine) {
        console.log('📞 Llamando a getMisGerminaciones()...');
        data = await germinacionService.getMisGerminaciones();
      } else {
        console.log('📞 Llamando a getAllForAdmin()...');
        data = await germinacionService.getAllForAdmin();
      }

      console.log('✅ Germinaciones cargadas desde el servicio:', data?.length || 0);
      console.log('📊 Primera germinación:', data && data.length > 0 ? { id: data[0].id, codigo: data[0].codigo } : 'Sin datos');

      // Always sort by date (most recent first)
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.fecha_creacion || a.fecha_ingreso || new Date());
        const dateB = new Date(b.fecha_creacion || b.fecha_ingreso || new Date());
        return dateB.getTime() - dateA.getTime();
      });
      console.log('📝 Seteando germinaciones ordenadas:', sortedData.length);
      setGerminaciones(sortedData);

      console.log('🎯 Estado de germinaciones actualizado. Total en estado:', sortedData.length);

    } catch (error: any) {
      console.error('❌ Error loading germinaciones', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('❌ Error request:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }

      if (error.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        toast.error('No tienes permisos para acceder a estas germinaciones.');
      } else {
        toast.error('No se pudieron cargar las germinaciones. Verifica tu conexión.');
      }

      setGerminaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showOnlyMine, user]);

  // Create germinacion
  const handleAddGerminacion = useCallback(async (prediccionData?: any) => {
    console.log('🌱 Iniciando creación de germinación...');

    const requiredFields = [
      { key: 'fecha_siembra', label: 'Fecha de siembra' },
      { key: 'codigo', label: 'Código' },
      { key: 'genero', label: 'Género' },
      { key: 'especie_variedad', label: 'Especie/Variedad' },
      { key: 'clima', label: 'Clima' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'percha', label: 'Percha' },
      { key: 'nivel', label: 'Nivel' },
      { key: 'cantidad_solicitada', label: 'Cantidad solicitada' },
      { key: 'estado_capsula', label: 'Estado de cápsula' },
      { key: 'estado_semilla', label: 'Estado de semilla' },
      { key: 'cantidad_semilla', label: 'Cantidad de semilla' },
    ];

    if (!validateRequiredFields(form, requiredFields)) {
      return;
    }

    try {
      const { GerminacionValidator } = require('../utils/germinacionValidation');

      const germinacionData = GerminacionValidator.prepareDataForSubmission({
        fecha_polinizacion: form.fecha_polinizacion || undefined,
        fecha_siembra: form.fecha_siembra,
        codigo: form.codigo,
        genero: form.genero,
        especie_variedad: form.especie_variedad,
        clima: form.clima,
        percha: form.percha,
        nivel: form.nivel,
        clima_lab: form.clima_lab,
        cantidad_solicitada: form.cantidad_solicitada,
        no_capsulas: form.no_capsulas,
        estado_capsula: form.estado_capsula,
        estado_semilla: form.estado_semilla,
        cantidad_semilla: form.cantidad_semilla,
        semilla_en_stock: form.semilla_en_stock,
        observaciones: form.observaciones,
        responsable: form.responsable,
        // Incluir datos de predicción si están disponibles
        ...(prediccionData?.prediccion && {
          prediccion_dias_estimados: prediccionData.prediccion.dias_estimados,
          prediccion_confianza: prediccionData.prediccion.confianza,
          prediccion_fecha_estimada: prediccionData.prediccion.fecha_estimada,
          prediccion_tipo: prediccionData.prediccion.modelo_usado,
          prediccion_condiciones_climaticas: JSON.stringify({
            clima: prediccionData.parametros_usados?.clima,
            nivel_confianza: prediccionData.prediccion.nivel_confianza,
            rango_dias: prediccionData.prediccion.rango_dias,
          }),
          prediccion_especie_info: JSON.stringify({
            especie: prediccionData.parametros_usados?.especie,
            genero: prediccionData.parametros_usados?.genero,
          }),
          prediccion_parametros_usados: JSON.stringify(prediccionData.parametros_usados || {}),
        }),
      });

      console.log('📤 Enviando datos al backend:', germinacionData);

      const result = await germinacionService.create(germinacionData);

      console.log('✅ Germinación creada exitosamente:', result);

      // Mostrar notificación de éxito detallada
      const especieInfo = germinacionData.especie_variedad
        ? ` - ${germinacionData.especie_variedad}`
        : '';
      toast.success(
        `Germinación "${germinacionData.codigo}"${especieInfo} registrada correctamente. La verás en la lista después de refrescar.`,
        6000 // 6 segundos de duración
      );

      // Reset form
      setForm({ ...initialFormState, responsable: getResponsableName(user) });

      // Reload list
      await loadGerminaciones();

      return true;
    } catch (error: any) {
      console.error('❌ Error creating germinacion:', error);

      let errorMessage = 'No se pudo crear la germinación';

      if (error.message && error.message.includes(':')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return false;
    }
  }, [form, user, loadGerminaciones, initialFormState, toast]);

  // Refresh data
  const onRefresh = useCallback(() => {
    if (!user) {
      console.log('⚠️ Usuario no autenticado, saltando refresh');
      return;
    }
    setRefreshing(true);
    loadGerminaciones();
  }, [user, loadGerminaciones]);

  // Filter germinaciones
  const germinacionesFiltradas = useMemo(() => {
    console.log('🔍 Filtrando germinaciones:', {
      total: germinaciones.length,
      searchTerm: search,
      hasSearch: search.length > 0
    });

    // Si no hay término de búsqueda, retornar todas
    if (!search || search.trim() === '') {
      console.log('✅ Sin filtro de búsqueda, retornando todas:', germinaciones.length);
      return germinaciones;
    }

    const filtered = germinaciones.filter((g: any) => {
      const q = search.toLowerCase();
      return (
        (g.codigo && g.codigo.toLowerCase().includes(q)) ||
        (g.especie && g.especie.toLowerCase().includes(q)) ||
        (g.especie_variedad && g.especie_variedad.toLowerCase().includes(q)) ||
        (g.genero && g.genero.toLowerCase().includes(q)) ||
        (g.responsable && typeof g.responsable === 'string' && g.responsable.toLowerCase().includes(q))
      );
    });

    console.log('✅ Germinaciones filtradas:', filtered.length);
    return filtered;
  }, [germinaciones, search]);

  return {
    // State
    germinaciones: germinacionesFiltradas,
    loading,
    refreshing,
    showOnlyMine,
    search,
    form,
    codigosDisponibles,
    codigosConEspecies,
    especiesDisponibles,
    perchasDisponibles,
    nivelesDisponibles,
    pagination,

    // Actions
    setShowOnlyMine,
    setSearch,
    setForm,
    loadGerminaciones,
    loadCodigosDisponibles,
    loadCodigosConEspecies,
    loadPerchasDisponibles,
    handleCodigoSelection,
    handleEspecieSelection,
    handleAddGerminacion,
    onRefresh,

    // Utils
    resetForm: () => setForm({ ...initialFormState, responsable: getResponsableName(user) }),
  };
};
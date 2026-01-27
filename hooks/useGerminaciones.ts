// Custom hook for germinaciones logic - extracted from germinaciones.tsx
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { germinacionService } from '../services/germinacion.service';
import { validateRequiredFields, getResponsableName } from '../utils/formValidation';
import { usePagination } from './usePagination';
import { useToast } from '../contexts/ToastContext';
import { logger } from '@/services/logger';

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
      const codes = await germinacionService.getCodes();
      setCodigosDisponibles(codes);
    } catch (error) {
      logger.error('❌ useGerminaciones: Error cargando códigos:', error);
      setCodigosDisponibles([]);
    }
  }, []);

  // Load codes with species for autocomplete
  const loadCodigosConEspecies = useCallback(async () => {
    try {
      const codesWithSpecies = await germinacionService.getCodesWithSpecies();
      setCodigosConEspecies(codesWithSpecies);
      
      // Extraer especies únicas para el autocompletado
      const especiesUnicas = Array.from(new Set(codesWithSpecies.map(item => item.especie).filter(Boolean)));
      setEspeciesDisponibles(especiesUnicas);
      
    } catch (error) {
      logger.error('❌ Error cargando códigos con especies:', error);
      setCodigosConEspecies([]);
      setEspeciesDisponibles([]);
    }
  }, []);

  // Load available perchas and niveles for selectors
  const loadPerchasDisponibles = useCallback(async () => {
    try {
      const opciones = await germinacionService.getFiltrosOpciones();

      // Eliminar duplicados usando Set por si acaso
      const perchasUnicas = Array.from(new Set(opciones.perchas));
      const nivelesUnicos = Array.from(new Set(opciones.niveles));

      setPerchasDisponibles(perchasUnicas);
      setNivelesDisponibles(nivelesUnicos);

    } catch (error) {
      logger.error('❌ useGerminaciones: Error cargando perchas y niveles:', error);
      setPerchasDisponibles([]);
      setNivelesDisponibles([]);
    }
  }, []);

  // Handle code selection and auto-complete species and genus
  const handleCodigoSelection = useCallback(async (codigoSeleccionado: string) => {
    try {

      setForm(prev => ({ ...prev, codigo: codigoSeleccionado }));

      // Buscar la germinación por código para autocompletar género y especie
      const germinacion = await germinacionService.getGerminacionByCode(codigoSeleccionado);

      if (germinacion) {

        // Preparar los campos a autocompletar
        const updatedFields: any = {
          codigo: codigoSeleccionado,
        };

        // Autocompletar especie/variedad si está disponible
        if (germinacion.especie) {
          updatedFields.especie_variedad = germinacion.especie;
        }

        // Autocompletar género si está disponible
        if (germinacion.genero) {
          updatedFields.genero = germinacion.genero;
        }

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
      } else {
      }
    } catch (error) {
      logger.error('❌ Error en handleCodigoSelection:', error);
    }
  }, []);

  // Handle species selection and auto-complete code and genus
  const handleEspecieSelection = useCallback(async (especieSeleccionada: string) => {
    try {

      setForm(prev => ({ ...prev, especie_variedad: especieSeleccionada }));

      // Buscar la germinación por especie para autocompletar código y género
      const germinacion = await germinacionService.getGerminacionByEspecie(especieSeleccionada);

      if (germinacion) {

        // Preparar los campos a autocompletar
        const updatedFields: any = {
          especie_variedad: especieSeleccionada,
        };

        // Autocompletar código si está disponible
        if (germinacion.codigo) {
          updatedFields.codigo = germinacion.codigo;
        }

        // Autocompletar género si está disponible
        if (germinacion.genero) {
          updatedFields.genero = germinacion.genero;
        }

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
      } else {
      }
    } catch (error) {
      logger.error('❌ Error en handleEspecieSelection:', error);
    }
  }, []);

  // Load germinaciones
  const loadGerminaciones = useCallback(async (page: number = 1) => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }


      let data;

      if (showOnlyMine) {
        data = await germinacionService.getMisGerminaciones();
      } else {
        data = await germinacionService.getAllForAdmin();
      }


      // Always sort by date (most recent first)
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.fecha_creacion || a.fecha_ingreso || new Date());
        const dateB = new Date(b.fecha_creacion || b.fecha_ingreso || new Date());
        return dateB.getTime() - dateA.getTime();
      });
      setGerminaciones(sortedData);


    } catch (error: any) {
      logger.error('❌ Error loading germinaciones', error);
      if (error.response) {
        logger.error('❌ Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        logger.error('❌ Error request:', error.request);
      } else {
        logger.error('❌ Error message:', error.message);
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


      const result = await germinacionService.create(germinacionData);


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
      logger.error('❌ Error creating germinacion:', error);

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
      return;
    }
    setRefreshing(true);
    loadGerminaciones();
  }, [user, loadGerminaciones]);

  // Filter germinaciones
  const germinacionesFiltradas = useMemo(() => {
    // Si no hay término de búsqueda, retornar todas
    if (!search || search.trim() === '') {
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
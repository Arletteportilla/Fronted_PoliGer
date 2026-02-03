import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { polinizacionService } from '@/services/polinizacion.service';
import { germinacionService } from '@/services/germinacion.service';
import { estadisticasService } from '@/services/estadisticas.service';
import { prediccionValidacionService } from '@/services/prediccion-validacion.service';
import { CONFIG } from '@/services/config';
import { usePermissions } from '@/hooks/usePermissions';
import { useConfirmation, useModalState, useCRUDOperations } from '@/hooks';
import { useNotifications } from '@/hooks/useNotifications';
import * as SecureStore from '@/services/secureStore';
import { ResponsiveLayout } from '@/components/layout';
import { GerminacionForm } from '@/components/forms/GerminacionForm';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { CambiarEstadoModal } from '@/components/modals/CambiarEstadoModal';
import { FinalizarModal } from '@/components/modals/FinalizarModal';
import { GerminacionDetailsModal } from '@/components/modals/GerminacionDetailsModal';
import { PolinizacionDetailsModal } from '@/components/modals/PolinizacionDetailsModal';
import {
  PerfilResumen,
  PerfilHeader,
  PerfilTabSelector,
  PerfilNotificacionesTab,
  PerfilPolinizacionesTab,
  PerfilGerminacionesTab,
  PerfilUsuariosTab,
  type TabType
} from '@/components/Perfil';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';
import type { Polinizacion, Germinacion, EstadisticasUsuario } from '@/types/index';

export default function PerfilScreen() {
  const { user, forceLogout, refreshUser } = useAuth();
  const toast = useToast();
  const { canViewGerminaciones, canViewPolinizaciones, isAdmin } = usePermissions();
  const { showConfirmation } = useConfirmation();
  const params = useLocalSearchParams();
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  // Hook de notificaciones
  const { notifications, fetchNotifications } = useNotifications();

  // Estados principales
  const [tab, setTab] = useState<TabType>('resumen');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de datos
  const [polinizaciones, setPolinizaciones] = useState<Polinizacion[]>([]);
  const [germinaciones, setGerminaciones] = useState<Germinacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuario>({
    total_polinizaciones: 0,
    total_germinaciones: 0,
    polinizaciones_actuales: 0,
    germinaciones_actuales: 0,
    usuario: user?.username || 'Usuario'
  });

  // Estados para búsqueda
  const [searchPolinizaciones, setSearchPolinizaciones] = useState('');
  const [searchGerminaciones, setSearchGerminaciones] = useState('');

  // Estados de paginación para polinizaciones
  const [polinizacionesPage, setPolinizacionesPage] = useState(1);
  const [polinizacionesTotalPages, setPolinizacionesTotalPages] = useState(1);
  const [polinizacionesTotalCount, setPolinizacionesTotalCount] = useState(0);

  // Estados de paginación para germinaciones
  const [germinacionesPage, setGerminacionesPage] = useState(1);
  const [germinacionesTotalPages, setGerminacionesTotalPages] = useState(1);
  const [germinacionesTotalCount, setGerminacionesTotalCount] = useState(0);

  // Estado para modal de creación de usuario

  // Estado para modal de edición de usuario

  // Modales de polinizaciones (usando useModalState)
  const [_polinizacionDetailsModal, polinizacionDetailsControls] = useModalState<Polinizacion>();
  const [polinizacionEditModal, polinizacionEditControls] = useModalState<Polinizacion>();

  // Modales de germinaciones (usando useModalState)
  const [germinacionDetailsModal, germinacionDetailsControls] = useModalState<Germinacion>();
  const [germinacionEditModal, germinacionEditControls] = useModalState<Germinacion>();

  // Modales de cambio de estado de germinaciones (usando useModalState)
  const [changeStatusGerminacionModal, changeStatusGerminacionControls] = useModalState<Germinacion>();
  const [finalizarGerminacionModal, finalizarGerminacionControls] = useModalState<Germinacion>();

  // Modales de cambio de estado de polinizaciones (usando useModalState)
  const [changeStatusPolinizacionModal, changeStatusPolinizacionControls] = useModalState<Polinizacion>();
  const [finalizarPolinizacionModal, finalizarPolinizacionControls] = useModalState<Polinizacion>();

  // Estados para formularios de edición
  const [polinizacionEditForm, setPolinizacionEditForm] = useState<any>(null);
  const [germinacionEditForm, setGerminacionEditForm] = useState<any>(null);

  // Sincronizar formulario cuando se abre el modal de edición de polinización
  useEffect(() => {
    if (polinizacionEditModal.visible && polinizacionEditModal.selectedItem) {
      const item = polinizacionEditModal.selectedItem;
      setPolinizacionEditForm({
        id: item.id || item.numero,
        fecha_polinizacion: item.fechapol || '',
        fecha_maduracion: item.fechamad || '',
        tipo_polinizacion: item.tipo_polinizacion || item.Tipo || 'SELF',
        madre_codigo: item.madre_codigo || '',
        madre_genero: item.madre_genero || item.genero || '',
        madre_especie: item.madre_especie || item.especie || '',
        madre_clima: item.madre_clima || 'I',
        padre_codigo: item.padre_codigo || '',
        padre_genero: item.padre_genero || '',
        padre_especie: item.padre_especie || '',
        padre_clima: item.padre_clima || 'I',
        nueva_codigo: item.nueva_codigo || '',
        nueva_genero: item.nueva_genero || '',
        nueva_especie: item.nueva_especie || '',
        nueva_clima: item.nueva_clima || 'I',
        vivero: item.vivero || '',
        mesa: item.mesa || '',
        pared: item.pared || '',
        ubicacion_tipo: item.ubicacion_tipo || 'vivero',
        ubicacion_nombre: item.ubicacion_nombre || '',
        cantidad_capsulas: item.cantidad_capsulas || 1,
        cantidad: item.cantidad || 1,
        cantidad_solicitada: item.cantidad_solicitada?.toString() || '',
        cantidad_disponible: item.cantidad_disponible?.toString() || '',
        cantidad_semilla: '',
        responsable: item.responsable || '',
        observaciones: item.observaciones || '',
        estado: item.estado || 'INGRESADO',
        // Campos de predicción ML
        dias_maduracion_predichos: item.dias_maduracion_predichos || null,
        fecha_maduracion_predicha: item.fecha_maduracion_predicha || null,
        metodo_prediccion: item.metodo_prediccion || '',
        confianza_prediccion: item.confianza_prediccion || null,
        // Campos legacy
        clima: '',
        ubicacion: '',
        etapa_actual: 'Ingresado',
        planta_madre_codigo: '',
        planta_madre_genero: '',
        planta_madre_especie: '',
        planta_padre_codigo: '',
        planta_padre_genero: '',
        planta_padre_especie: '',
        nueva_planta_codigo: '',
        nueva_planta_genero: '',
        nueva_planta_especie: '',
      });
    }
  }, [polinizacionEditModal.visible, polinizacionEditModal.selectedItem]);

  // Sincronizar formulario cuando se abre el modal de edición de germinación
  useEffect(() => {
    if (germinacionEditModal.visible && germinacionEditModal.selectedItem) {
      const item = germinacionEditModal.selectedItem;
      setGerminacionEditForm({
        codigo: item.codigo || '',
        genero: item.genero || '',
        especie_variedad: item.especie_variedad || '',
        fecha_siembra: item.fecha_siembra || '',
        fecha_polinizacion: item.fecha_polinizacion || '',
        clima: item.clima || 'I',
        percha: item.percha || '',
        nivel: item.nivel || '',
        clima_lab: item.clima_lab || 'I',
        finca: item.finca || '',
        numero_vivero: item.numero_vivero || '',
        cantidad_solicitada: item.cantidad_solicitada?.toString() || '',
        no_capsulas: item.no_capsulas?.toString() || '',
        estado_capsula: item.estado_capsula || 'CERRADA',
        estado_semilla: item.estado_semilla || 'MADURA',
        cantidad_semilla: item.cantidad_semilla || 'ABUNDANTE',
        semilla_en_stock: item.semilla_en_stock || false,
        observaciones: item.observaciones || '',
        responsable: item.responsable || '',
        etapa_actual: item.etapa_actual || 'INGRESADO',
      });
    }
  }, [germinacionEditModal.visible, germinacionEditModal.selectedItem]);

  // Efectos
  useEffect(() => {
    const newTab = params['tab'];
    if (newTab && ['resumen', 'polinizaciones', 'germinaciones', 'usuarios', 'notificaciones'].includes(newTab as string)) {
      setTab(newTab as TabType);
    }
  }, [params['tab']]);

  // Función principal para obtener datos - Reutilizable
  useEffect(() => {
    fetchNotifications({ solo_propias: true });
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id || !tab) return;

    setLoading(true);
    try {
      let misPolinizaciones: Polinizacion[] = [];
      let misGerminaciones: Germinacion[] = [];
      let stats: EstadisticasUsuario | null = null;

      // Obtener datos específicos del usuario solo si la tab lo requiere
      if (tab === 'polinizaciones' || tab === 'resumen' || tab === 'notificaciones') {
        try {
          if (tab === 'polinizaciones') {
            // Usar paginación para la tab de polinizaciones
            const result = await polinizacionService.getMisPolinizacionesPaginated({
              page: polinizacionesPage,
              page_size: 20,
              ...(searchPolinizaciones && { search: searchPolinizaciones }),
              dias_recientes: 0 // 0 = ver todas las polinizaciones sin filtro de fecha
            });
            misPolinizaciones = Array.isArray(result.results) ? result.results : [];
            setPolinizacionesTotalPages(result.totalPages);
            setPolinizacionesTotalCount(result.count);
          } else {
            // Para resumen y notificaciones, obtener todas sin paginación
            const pols = await polinizacionService.getMisPolinizaciones(0); // 0 = todas
            misPolinizaciones = Array.isArray(pols) ? pols : [];
          }
        } catch (error) {
          console.error('Error obteniendo polinizaciones:', error);
          misPolinizaciones = [];
        }
      }

      if (tab === 'germinaciones' || tab === 'resumen' || tab === 'notificaciones') {
        try {
          if (tab === 'germinaciones') {
            // Usar paginación para la tab de germinaciones
            const result = await germinacionService.getMisGerminacionesPaginated({
              page: germinacionesPage,
              page_size: 20,
              ...(searchGerminaciones && { search: searchGerminaciones }),
              dias_recientes: 0, // 0 = ver todas las germinaciones sin filtro de fecha
              excluir_importadas: true // Solo mostrar las germinaciones creadas por el usuario, no las importadas
            });
            misGerminaciones = Array.isArray(result.results) ? result.results : [];
            setGerminacionesTotalPages(result.totalPages);
            setGerminacionesTotalCount(result.count);
          } else {
            // Para resumen y notificaciones, obtener todas sin paginación
            const germs = await germinacionService.getMisGerminaciones(0); // 0 = todas
            misGerminaciones = Array.isArray(germs) ? germs : [];
          }
        } catch (error) {
          console.error('Error obteniendo germinaciones:', error);
          misGerminaciones = [];
        }
      }

      // Obtener estadísticas si estamos en resumen
      if (tab === 'resumen') {
        try {
          stats = await estadisticasService.getEstadisticasUsuario();
        } catch (error) {
          console.error('Error obteniendo estadísticas:', error);
          stats = null;
        }
      }

      // La pestaña de usuarios maneja su propia carga de datos internamente

      // Calcular estadísticas si no se obtuvieron
      if (!stats && (tab === 'resumen' || tab === 'polinizaciones' || tab === 'germinaciones')) {
        stats = {
          total_polinizaciones: misPolinizaciones.length,
          total_germinaciones: misGerminaciones.length,
          polinizaciones_actuales: misPolinizaciones.filter(p =>
            p.estado_polinizacion === 'EN_PROCESO_TEMPRANO' ||
            p.estado_polinizacion === 'EN_PROCESO_AVANZADO' ||
            p.estado_polinizacion === 'INICIAL'
          ).length,
          germinaciones_actuales: misGerminaciones.filter(g =>
            g.estado_germinacion === 'INICIAL' ||
            g.estado_germinacion === 'EN_PROCESO_TEMPRANO' ||
            g.estado_germinacion === 'EN_PROCESO_AVANZADO'
          ).length,
          usuario: user?.username || 'Usuario'
        };
      }

      // Actualizar estados
      if (tab === 'polinizaciones' || tab === 'resumen' || tab === 'notificaciones') {
        setPolinizaciones(misPolinizaciones);
      }
      if (tab === 'germinaciones' || tab === 'resumen' || tab === 'notificaciones') {
        setGerminaciones(misGerminaciones);
      }
      if (stats) {
        setEstadisticas(stats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [tab, user?.id, user?.username, polinizacionesPage, germinacionesPage, searchPolinizaciones, searchGerminaciones, isAdmin]);

  // Resetear páginas cuando cambia la tab
  useEffect(() => {
    setPolinizacionesPage(1);
    setGerminacionesPage(1);
    setSearchPolinizaciones('');
    setSearchGerminaciones('');
  }, [tab]);

  // Ejecutar fetchData cuando cambian las dependencias relevantes
  useEffect(() => {
    if (user?.id && tab) {
      fetchData();
    }
  }, [tab, user?.id, fetchData]);

  // Funciones de búsqueda optimizadas con paginación
  const handleBuscarPolinizaciones = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setPolinizacionesPage(1); // Reset a página 1 al buscar
      const result = await polinizacionService.getMisPolinizacionesPaginated({
        page: 1,
        page_size: 20,
        ...(searchPolinizaciones && { search: searchPolinizaciones }),
        dias_recientes: 0 // 0 = ver todas las polinizaciones sin filtro de fecha
      });
      setPolinizaciones(Array.isArray(result.results) ? result.results : []);
      setPolinizacionesTotalPages(result.totalPages);
      setPolinizacionesTotalCount(result.count);
    } catch (error) {
      console.error('Error buscando polinizaciones:', error);
      Alert.alert('Error', 'No se pudieron buscar las polinizaciones');
    } finally {
      setLoading(false);
    }
  }, [user, searchPolinizaciones]);

  const handleBuscarGerminaciones = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setGerminacionesPage(1); // Reset a página 1 al buscar
      const result = await germinacionService.getMisGerminacionesPaginated({
        page: 1,
        page_size: 20,
        ...(searchGerminaciones && { search: searchGerminaciones }),
        dias_recientes: 0, // 0 = ver todas las germinaciones sin filtro de fecha
        excluir_importadas: true // Solo mostrar las germinaciones creadas por el usuario
      });
      setGerminaciones(Array.isArray(result.results) ? result.results : []);
      setGerminacionesTotalPages(result.totalPages);
      setGerminacionesTotalCount(result.count);
    } catch (error) {
      console.error('Error buscando germinaciones:', error);
      Alert.alert('Error', 'No se pudieron buscar las germinaciones');
    } finally {
      setLoading(false);
    }
  }, [user, searchGerminaciones]);

  // Funciones de paginación para polinizaciones
  const handlePolinizacionesPageChange = useCallback((page: number) => {
    if (page >= 1 && page <= polinizacionesTotalPages) {
      setPolinizacionesPage(page);
    }
  }, [polinizacionesTotalPages]);

  const handlePolinizacionesNextPage = useCallback(() => {
    if (polinizacionesPage < polinizacionesTotalPages) {
      setPolinizacionesPage(polinizacionesPage + 1);
    }
  }, [polinizacionesPage, polinizacionesTotalPages]);

  const handlePolinizacionesPrevPage = useCallback(() => {
    if (polinizacionesPage > 1) {
      setPolinizacionesPage(polinizacionesPage - 1);
    }
  }, [polinizacionesPage]);

  // Funciones de paginación para germinaciones
  const handleGerminacionesPageChange = useCallback((page: number) => {
    if (page >= 1 && page <= germinacionesTotalPages) {
      setGerminacionesPage(page);
    }
  }, [germinacionesTotalPages]);

  const handleGerminacionesNextPage = useCallback(() => {
    if (germinacionesPage < germinacionesTotalPages) {
      setGerminacionesPage(germinacionesPage + 1);
    }
  }, [germinacionesPage, germinacionesTotalPages]);

  const handleGerminacionesPrevPage = useCallback(() => {
    if (germinacionesPage > 1) {
      setGerminacionesPage(germinacionesPage - 1);
    }
  }, [germinacionesPage]);

  // Funciones de descarga de PDF optimizadas
  const handleDescargarPDF = useCallback(async (tipo: 'polinizaciones' | 'germinaciones') => {
    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    const search = tipo === 'polinizaciones' ? searchPolinizaciones : searchGerminaciones;
    const searchText = search ? ` (Búsqueda: "${search}")` : '';

    // Función de descarga (compartida entre web y mobile)
    const ejecutarDescarga = async () => {
      let loadingSet = false;
      try {
        setLoading(true);
        loadingSet = true;

        // Obtener token de autenticación
        const token = await SecureStore.secureStore.getItem('authToken');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Construir URL usando el endpoint específico para "mis" registros
        const params = new URLSearchParams();
        if (search) params.append('search', search);

        const url = `${CONFIG.API_BASE_URL}/${tipo}/mis-${tipo}-pdf/?${params.toString()}`;

        // Crear nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 10);
        const searchSuffix = search ? `_${search.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
        const fileName = `mis_${tipo}${searchSuffix}_${timestamp}.pdf`;

        // Detectar plataforma usando Platform

        if (Platform.OS === 'web') {
          // Descarga para web
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/pdf'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // Crear enlace de descarga
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          Alert.alert('Éxito', `PDF de ${tipo} descargado correctamente`);
        } else {
          // Descarga para móvil
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;

          const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/pdf'
            }
          });

          if (downloadResult.status === 200) {
            // Compartir archivo
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: `Mis ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} PDF`,
              });
            }
            Alert.alert('Éxito', `PDF de ${tipo} descargado correctamente`);
          } else {
            throw new Error(`Error en la descarga: ${downloadResult.status}`);
          }
        }
      } catch (error: any) {
        console.error(`❌ Error descargando PDF de ${tipo}:`, error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        let errorMessage = `Error desconocido al descargar el PDF de ${tipo}`;

        if (error.response?.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.response?.status === 403) {
          errorMessage = 'No tienes permisos para descargar este reporte.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Error del servidor. Inténtalo más tarde.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (Platform.OS === 'web') {
          alert(`Error: No se pudo descargar el PDF\n\n${errorMessage}`);
        } else {
          Alert.alert('Error', `No se pudo descargar el PDF: ${errorMessage}`);
        }
      } finally {
        if (loadingSet) {
          setLoading(false);
        }
      }
    };

    // Mostrar confirmación usando useConfirmation
    const confirmed = await showConfirmation(
      'Descargar PDF',
      `¿Deseas descargar el PDF de tus ${tipo}${searchText}?`,
      'Descargar',
      'Cancelar'
    );

    if (confirmed) {
      await ejecutarDescarga();
    }
  }, [user, searchPolinizaciones, searchGerminaciones, showConfirmation]);

  // Función de logout optimizada
  const handleLogout = useCallback(async () => {
    const confirmed = await showConfirmation(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      'Cerrar Sesión',
      'Cancelar'
    );

    if (!confirmed) {
      return;
    }

    forceLogout();
  }, [forceLogout, showConfirmation]);

  // Función de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Callback cuando se actualiza la foto de perfil
  const handlePhotoUpdated = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  // Operaciones CRUD (usando useCRUDOperations)
  const { handleDelete: handleDeletePolinizacion } = useCRUDOperations(
    polinizacionService,
    { entityName: 'polinización', idField: 'numero', codigoField: 'codigo' },
    fetchData
  );

  const { handleDelete: handleDeleteGerminacion } = useCRUDOperations(
    germinacionService,
    { entityName: 'germinación', idField: 'id', codigoField: 'codigo' },
    fetchData
  );

  // ============================================================================
  // FUNCIONES PARA POLINIZACIONES
  // ============================================================================

  const handleViewPolinizacion = (item: Polinizacion) => {
    polinizacionDetailsControls.open(item);
  };

  const handleEditPolinizacion = (item: Polinizacion) => {
    polinizacionEditControls.open(item);
  };

  // ============================================================================
  // FUNCIONES PARA GERMINACIONES
  // ============================================================================

  const handleViewGerminacion = async (item: Germinacion) => {
    try {
      // Recargar la germinación desde el servidor para tener datos frescos
      const germinacionActualizada = await germinacionService.getById(item.id);
      germinacionDetailsControls.open(germinacionActualizada);
    } catch (error) {
      console.error('Error cargando germinación:', error);
      // Si falla, usar los datos en caché
      germinacionDetailsControls.open(item);
    }
  };

  const handleEditGerminacion = (item: Germinacion) => {
    germinacionEditControls.open(item);
  };

  const handleCambiarEtapaGerminacion = async (germinacionId: number, nuevaEtapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO', fechaGerminacion?: string) => {
    try {
      setLoading(true);
      // Mapear etapas antiguas a estados nuevos compatibles con Germinacion['estado_germinacion']
      const estadoMap: Record<string, 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'> = {
        'INGRESADO': 'INICIAL',
        'EN_PROCESO': 'EN_PROCESO_TEMPRANO',
        'FINALIZADO': 'FINALIZADO'
      };
      const nuevoEstado = estadoMap[nuevaEtapa] || 'EN_PROCESO_TEMPRANO';
      await germinacionService.cambiarEstadoGerminacion(germinacionId, nuevoEstado, fechaGerminacion);

      // Actualizar la germinación seleccionada en el modal de edición con el nuevo estado
      if (germinacionEditModal.selectedItem) {
        const updatedGerminacion: Germinacion = {
          ...germinacionEditModal.selectedItem,
          estado_germinacion: nuevoEstado,
          progreso_germinacion: nuevoEstado === 'INICIAL' ? 10 :
            nuevoEstado === 'EN_PROCESO_TEMPRANO' ? 35 :
              nuevoEstado === 'EN_PROCESO_AVANZADO' ? 75 :
                nuevoEstado === 'FINALIZADO' ? 100 : 50,
          ...(nuevoEstado === 'FINALIZADO' && { fecha_germinacion: new Date().toISOString().split('T')[0] })
        };
        germinacionEditControls.setSelectedItem(updatedGerminacion);
      }

      // Cerrar el modal de cambio de estado si está abierto
      changeStatusGerminacionControls.close();

      // Recargar datos
      await fetchData();

      // Mostrar mensaje de éxito según la etapa
      const mensajes = {
        'INGRESADO': 'Germinación marcada como ingresada',
        'EN_PROCESO': 'Germinación marcada como en proceso',
        'FINALIZADO': 'Germinación finalizada y fecha de germinación registrada'
      };

      toast.success(mensajes[nuevaEtapa]);
    } catch (error: any) {
      console.error('Error cambiando etapa:', error);
      toast.error(error.response?.data?.message || 'No se pudo cambiar la etapa de la germinación');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangeStatus = (item: Germinacion) => {
    changeStatusGerminacionControls.open(item);
  };

  const handleOpenFinalizarModal = (item: Germinacion) => {
    finalizarGerminacionControls.open(item);
  };

  const handleConfirmFinalizar = async (fechaGerminacion: string) => {
    if (!finalizarGerminacionModal.selectedItem) return;

    try {
      setLoading(true);

      // Llamar al servicio y obtener la respuesta actualizada
      const response = await germinacionService.cambiarEstadoGerminacion(
        finalizarGerminacionModal.selectedItem.id,
        'FINALIZADO',
        fechaGerminacion
      );

      // Actualizar la germinación en la lista local
      setGerminaciones(prevGerminaciones =>
        prevGerminaciones.map(g =>
          g.id === finalizarGerminacionModal.selectedItem!.id
            ? {
              ...g,
              estado_germinacion: 'FINALIZADO',
              progreso_germinacion: 100,
              fecha_germinacion: fechaGerminacion
            }
            : g
        )
      );

      // Actualizar la germinación seleccionada en el modal de edición si es la misma
      if (germinacionEditModal.selectedItem && germinacionEditModal.selectedItem.id === finalizarGerminacionModal.selectedItem!.id) {
        germinacionEditControls.setSelectedItem({
          ...germinacionEditModal.selectedItem,
          estado_germinacion: 'FINALIZADO',
          progreso_germinacion: 100,
          fecha_germinacion: fechaGerminacion
        });
      }

      // Cerrar modal
      finalizarGerminacionControls.close();

      // Recargar datos del servidor para asegurar sincronización total
      await fetchData();

      toast.success('Germinación finalizada exitosamente');
    } catch (error: any) {
      console.error('Error finalizando germinación:', error);
      toast.error(error.response?.data?.error || 'No se pudo finalizar la germinación');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNCIONES PARA CAMBIO DE ESTADO DE POLINIZACIONES
  // ============================================================================

  const handleOpenChangeStatusPolinizacion = (item: Polinizacion) => {
    changeStatusPolinizacionControls.open(item);
  };

  const handleOpenFinalizarPolinizacionModal = (item: Polinizacion) => {
    finalizarPolinizacionControls.open(item);
  };

  const handleCambiarEstadoPolinizacion = async (polinizacionId: number, nuevoEstado: 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO', fechaMaduracion?: string) => {
    try {
      setLoading(true);

      await polinizacionService.cambiarEstadoPolinizacion(polinizacionId, nuevoEstado, fechaMaduracion);

      // Actualizar la polinización en la lista local
      setPolinizaciones(prevPolinizaciones =>
        prevPolinizaciones.map(p =>
          p.numero === polinizacionId
            ? {
              ...p,
              estado_polinizacion: nuevoEstado,
              progreso_polinizacion: nuevoEstado === 'INICIAL' ? 10 :
                nuevoEstado === 'EN_PROCESO_TEMPRANO' ? 35 :
                  nuevoEstado === 'EN_PROCESO_AVANZADO' ? 75 :
                    nuevoEstado === 'FINALIZADO' ? 100 : 50,
              ...(nuevoEstado === 'FINALIZADO' && fechaMaduracion && { fechamad: fechaMaduracion })
            }
            : p
        )
      );

      // Actualizar la polinización seleccionada en el modal de edición si es la misma
      if (polinizacionEditModal.selectedItem && polinizacionEditModal.selectedItem.numero === polinizacionId) {
        const updatedPolinizacion: Polinizacion = {
          ...polinizacionEditModal.selectedItem,
          estado_polinizacion: nuevoEstado,
          progreso_polinizacion: nuevoEstado === 'INICIAL' ? 10 :
            nuevoEstado === 'EN_PROCESO_TEMPRANO' ? 35 :
              nuevoEstado === 'EN_PROCESO_AVANZADO' ? 75 :
                nuevoEstado === 'FINALIZADO' ? 100 : 50,
          ...(nuevoEstado === 'FINALIZADO' && fechaMaduracion && { fechamad: fechaMaduracion })
        };
        polinizacionEditControls.setSelectedItem(updatedPolinizacion);
      }

      // Cerrar el modal de cambio de estado si está abierto
      changeStatusPolinizacionControls.close();

      // Recargar datos
      await fetchData();

      toast.success('Estado de polinización actualizado correctamente');
    } catch (error: any) {
      console.error('Error cambiando estado de polinización:', error);
      toast.error(error.response?.data?.error || 'No se pudo cambiar el estado de la polinización');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFinalizarPolinizacion = async (fechaMaduracion: string) => {
    if (!finalizarPolinizacionModal.selectedItem) return;

    try {
      setLoading(true);

      const polinizacion = finalizarPolinizacionModal.selectedItem;

      // 1. Cambiar estado a FINALIZADO
      const response = await polinizacionService.cambiarEstadoPolinizacion(
        polinizacion.numero,
        'FINALIZADO',
        fechaMaduracion
      );

      // 2. Validar predicción si existe
      const tienePrediccion = polinizacion.fecha_maduracion_predicha || polinizacion.prediccion_fecha_estimada;

      if (tienePrediccion) {
        try {
          const validacion = await prediccionValidacionService.validarPrediccionPolinizacion(
            polinizacion.numero,
            fechaMaduracion
          );

          // Mostrar resultado de validación al usuario
          const { precision, calidad, diferencia_dias } = validacion.validacion;

          let mensajeValidacion = `Polinización finalizada exitosamente.\n\n`;
          mensajeValidacion += `📊 Precisión de predicción: ${precision.toFixed(1)}% (${calidad})\n`;

          if (diferencia_dias === 0) {
            mensajeValidacion += `🎯 ¡Predicción exacta!`;
          } else if (diferencia_dias > 0) {
            mensajeValidacion += `⏱️ ${diferencia_dias} días más tarde de lo predicho`;
          } else {
            mensajeValidacion += `⏱️ ${Math.abs(diferencia_dias)} días antes de lo predicho`;
          }

          toast.success(mensajeValidacion);
        } catch (validacionError) {
          console.warn('⚠️ No se pudo validar la predicción:', validacionError);
          // No bloquear el flujo si falla la validación
          toast.success('Polinización finalizada exitosamente');
        }
      } else {
        toast.success('Polinización finalizada exitosamente');
      }

      // 3. Actualizar la polinización en la lista local
      setPolinizaciones(prevPolinizaciones =>
        prevPolinizaciones.map(p =>
          p.numero === polinizacion.numero
            ? {
              ...p,
              estado_polinizacion: 'FINALIZADO',
              progreso_polinizacion: 100,
              fechamad: fechaMaduracion
            }
            : p
        )
      );

      // 4. Actualizar la polinización seleccionada en el modal de edición si es la misma
      if (polinizacionEditModal.selectedItem && polinizacionEditModal.selectedItem.numero === polinizacion.numero) {
        polinizacionEditControls.setSelectedItem({
          ...polinizacionEditModal.selectedItem,
          estado_polinizacion: 'FINALIZADO',
          progreso_polinizacion: 100,
          fechamad: fechaMaduracion
        });
      }

      // 5. Cerrar modal
      finalizarPolinizacionControls.close();

      // 6. Recargar datos del servidor
      await fetchData();

    } catch (error: any) {
      console.error('Error finalizando polinización:', error);
      toast.error(error.response?.data?.error || 'No se pudo finalizar la polinización');
    } finally {
      setLoading(false);
    }
  };

  // Componentes de renderizado optimizados
  const renderResumen = () => {
    return (
      <PerfilResumen
        estadisticas={estadisticas}
        loading={loading}
        polinizaciones={polinizaciones}
        germinaciones={germinaciones}
        onViewPolinizacion={handleViewPolinizacion}
        onViewGerminacion={handleViewGerminacion}
        onViewAllPolinizaciones={() => setTab('polinizaciones')}
        onViewAllGerminaciones={() => setTab('germinaciones')}
        notifications={notifications}
        onViewAllNotifications={() => setTab('notificaciones')}
        canViewPolinizaciones={canViewPolinizaciones()}
        canViewGerminaciones={canViewGerminaciones()}
      />
    );
  };

  // Renderizado principal
  return (
    <ResponsiveLayout currentTab="perfil" style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Cabecera del usuario */}
        <PerfilHeader user={user} onLogout={handleLogout} onPhotoUpdated={handlePhotoUpdated} />

        {/* Navegación por pestañas */}
        <PerfilTabSelector
          currentTab={tab}
          onTabChange={setTab}
          canViewPolinizaciones={canViewPolinizaciones()}
          canViewGerminaciones={canViewGerminaciones()}
          isAdmin={isAdmin()}
        />

        {/* Contenido principal */}
        <View style={[styles.contentContainer, { paddingTop: 24 }]}>
          {tab === 'resumen' && renderResumen()}
          {tab === 'polinizaciones' && canViewPolinizaciones() && (
            <PerfilPolinizacionesTab
              loading={loading}
              polinizaciones={polinizaciones}
              searchPolinizaciones={searchPolinizaciones}
              setSearchPolinizaciones={setSearchPolinizaciones}
              setPolinizacionesPage={setPolinizacionesPage}
              fetchData={fetchData}
              handleBuscarPolinizaciones={handleBuscarPolinizaciones}
              polinizacionesTotalPages={polinizacionesTotalPages}
              polinizacionesTotalCount={polinizacionesTotalCount}
              polinizacionesPage={polinizacionesPage}
              handlePolinizacionesPageChange={handlePolinizacionesPageChange}
              handlePolinizacionesNextPage={handlePolinizacionesNextPage}
              handlePolinizacionesPrevPage={handlePolinizacionesPrevPage}
              handleViewPolinizacion={handleViewPolinizacion}
              handleEditPolinizacion={handleEditPolinizacion}
              handleDeletePolinizacion={handleDeletePolinizacion}
              onDescargarPDF={() => handleDescargarPDF('polinizaciones')}
            />
          )}
          {tab === 'germinaciones' && canViewGerminaciones() && (
            <PerfilGerminacionesTab
              loading={loading}
              germinaciones={germinaciones}
              searchGerminaciones={searchGerminaciones}
              setSearchGerminaciones={setSearchGerminaciones}
              setGerminacionesPage={setGerminacionesPage}
              fetchData={fetchData}
              handleBuscarGerminaciones={handleBuscarGerminaciones}
              germinacionesTotalPages={germinacionesTotalPages}
              germinacionesTotalCount={germinacionesTotalCount}
              germinacionesPage={germinacionesPage}
              handleGerminacionesPageChange={handleGerminacionesPageChange}
              handleGerminacionesNextPage={handleGerminacionesNextPage}
              handleGerminacionesPrevPage={handleGerminacionesPrevPage}
              handleViewGerminacion={handleViewGerminacion}
              handleEditGerminacion={handleEditGerminacion}
              handleDeleteGerminacion={handleDeleteGerminacion}
              handleOpenChangeStatus={handleOpenChangeStatus}
              onDescargarPDF={() => handleDescargarPDF('germinaciones')}
            />
          )}
          {tab === 'notificaciones' && (
            <PerfilNotificacionesTab
              polinizaciones={polinizaciones}
              germinaciones={germinaciones}
              loading={loading}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onViewPolinizacion={handleViewPolinizacion}
              onEditPolinizacion={handleEditPolinizacion}
              onDeletePolinizacion={handleDeletePolinizacion}
              onChangeStatusPolinizacion={handleOpenChangeStatusPolinizacion}
              onViewGerminacion={handleViewGerminacion}
              onEditGerminacion={handleEditGerminacion}
              onDeleteGerminacion={handleDeleteGerminacion}
              onChangeStatusGerminacion={handleOpenChangeStatus}
              canViewPolinizaciones={canViewPolinizaciones()}
              canViewGerminaciones={canViewGerminaciones()}
            />
          )}
          {tab === 'usuarios' && (
            <View style={{ marginTop: 10 }}>
              <PerfilUsuariosTab />
            </View>
          )}</View>

        {/* Modal de creación de usuario */}
        <GerminacionDetailsModal
          visible={germinacionDetailsModal.visible}
          germinacion={germinacionDetailsModal.selectedItem}
          onClose={() => germinacionDetailsControls.close()}
          onCambiarEtapa={handleCambiarEtapaGerminacion}
          onOpenFinalizar={handleOpenFinalizarModal}
        />

        {/* Modal de detalles de polinización */}
        <PolinizacionDetailsModal
          visible={_polinizacionDetailsModal.visible}
          polinizacion={_polinizacionDetailsModal.selectedItem}
          onClose={() => polinizacionDetailsControls.close()}
        />

        {/* Modal de edición de germinación */}
        {germinacionEditModal.selectedItem && germinacionEditForm && (
          <GerminacionForm
            visible={germinacionEditModal.visible}
            onClose={() => {
              germinacionEditControls.close();
            }}
            form={germinacionEditForm}
            setForm={setGerminacionEditForm}
            onSubmit={async () => {
              try {
                const item = germinacionEditModal.selectedItem!;
                // Actualizar germinación con los datos del formulario
                await germinacionService.update(item.id, {
                  codigo: germinacionEditForm.codigo,
                  genero: germinacionEditForm.genero,
                  especie_variedad: germinacionEditForm.especie_variedad,
                  fecha_siembra: germinacionEditForm.fecha_siembra,
                  fecha_polinizacion: germinacionEditForm.fecha_polinizacion,
                  clima: germinacionEditForm.clima,
                  percha: germinacionEditForm.percha,
                  nivel: germinacionEditForm.nivel,
                  clima_lab: germinacionEditForm.clima_lab,
                  finca: germinacionEditForm.finca,
                  numero_vivero: germinacionEditForm.numero_vivero,
                  cantidad_solicitada: germinacionEditForm.cantidad_solicitada,
                  no_capsulas: germinacionEditForm.no_capsulas,
                  estado_capsula: germinacionEditForm.estado_capsula,
                  estado_semilla: germinacionEditForm.estado_semilla,
                  cantidad_semilla: germinacionEditForm.cantidad_semilla,
                  semilla_en_stock: germinacionEditForm.semilla_en_stock,
                  observaciones: germinacionEditForm.observaciones,
                  responsable: germinacionEditForm.responsable,
                  etapa_actual: germinacionEditForm.etapa_actual,
                });

                Alert.alert('Éxito', 'Germinación actualizada correctamente');
                germinacionEditControls.close();
                // Recargar datos
                await fetchData();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo actualizar la germinación');
              }
            }}
            saving={false}
            codigosDisponibles={[]}
            especiesDisponibles={[]}
            perchasDisponibles={[]}
            nivelesDisponibles={[]}
            handleCodigoSelection={() => { }}
            handleEspecieSelection={() => { }}
          />
        )}

        {/* Modal de edición de polinización */}
        {polinizacionEditModal.selectedItem && polinizacionEditForm && (
          <PolinizacionForm
            visible={polinizacionEditModal.visible}
            onClose={() => {
              polinizacionEditControls.close();
            }}
            form={polinizacionEditForm}
            setForm={setPolinizacionEditForm}
            onSave={async () => {
              try {
                const item = polinizacionEditModal.selectedItem!;
                // Actualizar polinización con los datos del formulario
                await polinizacionService.update(item.id || item.numero, {
                  fechapol: polinizacionEditForm.fecha_polinizacion,
                  fechamad: polinizacionEditForm.fecha_maduracion,
                  tipo_polinizacion: polinizacionEditForm.tipo_polinizacion,
                  madre_codigo: polinizacionEditForm.madre_codigo,
                  madre_genero: polinizacionEditForm.madre_genero,
                  madre_especie: polinizacionEditForm.madre_especie,
                  madre_clima: polinizacionEditForm.madre_clima,
                  padre_codigo: polinizacionEditForm.padre_codigo,
                  padre_genero: polinizacionEditForm.padre_genero,
                  padre_especie: polinizacionEditForm.padre_especie,
                  padre_clima: polinizacionEditForm.padre_clima,
                  nueva_codigo: polinizacionEditForm.nueva_codigo,
                  nueva_genero: polinizacionEditForm.nueva_genero,
                  nueva_especie: polinizacionEditForm.nueva_especie,
                  nueva_clima: polinizacionEditForm.nueva_clima,
                  vivero: polinizacionEditForm.vivero,
                  mesa: polinizacionEditForm.mesa,
                  pared: polinizacionEditForm.pared,
                  ubicacion_tipo: polinizacionEditForm.ubicacion_tipo,
                  ubicacion_nombre: polinizacionEditForm.ubicacion_nombre,
                  cantidad_capsulas: polinizacionEditForm.cantidad_capsulas,
                  cantidad: polinizacionEditForm.cantidad,
                  cantidad_solicitada: polinizacionEditForm.cantidad_solicitada,
                  cantidad_disponible: polinizacionEditForm.cantidad_disponible,
                  responsable: polinizacionEditForm.responsable,
                  observaciones: polinizacionEditForm.observaciones,
                  estado: polinizacionEditForm.estado,
                  // Campos de predicción ML
                  dias_maduracion_predichos: polinizacionEditForm.dias_maduracion_predichos,
                  fecha_maduracion_predicha: polinizacionEditForm.fecha_maduracion_predicha,
                  metodo_prediccion: polinizacionEditForm.metodo_prediccion,
                  confianza_prediccion: polinizacionEditForm.confianza_prediccion,
                });

                Alert.alert('Éxito', 'Polinización actualizada correctamente');
                polinizacionEditControls.close();

                // Recargar datos
                await fetchData();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo actualizar la polinización');
              }
            }}
            onPrediccion={() => {
              Alert.alert('Info', 'Función de predicción en desarrollo');
            }}
            saving={false}
            isPredicting={false}
            prediccion={null}
          />
        )}

        {/* Modal genérico de cambio de estado para germinaciones */}
        <CambiarEstadoModal
          visible={changeStatusGerminacionModal.visible}
          onClose={() => {
            changeStatusGerminacionControls.close();
          }}
          onCambiarEstado={(estado) => {
            if (changeStatusGerminacionModal.selectedItem) {
              if (estado === 'FINALIZADO') {
                // Abrir modal de finalizar con calendario
                handleOpenFinalizarModal(changeStatusGerminacionModal.selectedItem);
              } else {
                // Mapear INICIAL a INGRESADO para compatibilidad
                const estadoMapeado = estado === 'INICIAL' ? 'INGRESADO' : estado;
                handleCambiarEtapaGerminacion(changeStatusGerminacionModal.selectedItem.id, estadoMapeado as 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO');
              }
            }
          }}
          item={changeStatusGerminacionModal.selectedItem}
          tipo="germinacion"
        />

        {/* Modal genérico de cambio de estado para polinizaciones */}
        <CambiarEstadoModal
          visible={changeStatusPolinizacionModal.visible}
          onClose={() => {
            changeStatusPolinizacionControls.close();
          }}
          onCambiarEstado={(estado) => {
            if (changeStatusPolinizacionModal.selectedItem) {
              if (estado === 'FINALIZADO') {
                // Abrir modal de finalizar con calendario
                handleOpenFinalizarPolinizacionModal(changeStatusPolinizacionModal.selectedItem);
              } else {
                // Cambiar estado directamente
                handleCambiarEstadoPolinizacion(changeStatusPolinizacionModal.selectedItem.numero, estado);
              }
            }
          }}
          item={changeStatusPolinizacionModal.selectedItem}
          tipo="polinizacion"
        />

        {/* Modal genérico de finalizar con calendario para germinaciones */}
        <FinalizarModal
          visible={finalizarGerminacionModal.visible}
          onClose={() => {
            finalizarGerminacionControls.close();
          }}
          onConfirm={handleConfirmFinalizar}
          item={finalizarGerminacionModal.selectedItem as any}
          tipo="germinacion"
        />

        {/* Modal genérico de finalizar con calendario para polinizaciones */}
        <FinalizarModal
          visible={finalizarPolinizacionModal.visible}
          onClose={() => {
            finalizarPolinizacionControls.close();
          }}
          onConfirm={handleConfirmFinalizarPolinizacion}
          item={finalizarPolinizacionModal.selectedItem}
          tipo="polinizacion"
        />

      </ScrollView>
    </ResponsiveLayout>
  );
}

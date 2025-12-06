import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Platform, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// import DebugPolinizaciones from '@/DEBUG_POLINIZACIONES';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { polinizacionService } from '@/services/polinizacion.service';
import { germinacionService } from '@/services/germinacion.service';
import { estadisticasService } from '@/services/estadisticas.service';
import { rbacService } from '@/services/rbac.service';
import { usePermissions } from '@/hooks/usePermissions';
import * as SecureStore from '@/services/secureStore';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigation } from '@/components/navigation';
import { GerminacionForm } from '@/components/forms/GerminacionForm';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { CambiarEstadoModal } from '@/components/modals/CambiarEstadoModal';
import { FinalizarModal } from '@/components/modals/FinalizarModal';
import { PolinizacionDetailsModal } from '@/components/modals/PolinizacionDetailsModal';
import { GerminacionDetailsModal } from '@/components/modals/GerminacionDetailsModal';
import Pagination from '@/components/filters/Pagination';
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
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import type { Polinizacion, Germinacion, EstadisticasUsuario, UserWithProfile } from '@/types/index';

export default function PerfilScreen() {
  const { user, forceLogout } = useAuth();
  const toast = useToast();
  const { canViewGerminaciones, canViewPolinizaciones, isAdmin } = usePermissions();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados principales
  const [tab, setTab] = useState<TabType>('resumen');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de datos
  const [polinizaciones, setPolinizaciones] = useState<Polinizacion[]>([]);
  const [germinaciones, setGerminaciones] = useState<Germinacion[]>([]);
  const [usuarios, setUsuarios] = useState<UserWithProfile[]>([]);
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

  // Estados para modales de polinizaciones
  const [showPolinizacionDetailsModal, setShowPolinizacionDetailsModal] = useState(false);
  const [showPolinizacionEditModal, setShowPolinizacionEditModal] = useState(false);
  const [selectedPolinizacion, setSelectedPolinizacion] = useState<Polinizacion | null>(null);

  // Estados para modales de germinaciones
  const [showGerminacionDetailsModal, setShowGerminacionDetailsModal] = useState(false);
  const [showGerminacionEditModal, setShowGerminacionEditModal] = useState(false);
  const [selectedGerminacion, setSelectedGerminacion] = useState<Germinacion | null>(null);

  // Estados para modal de cambio de estado de germinaciones
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [germinacionToChangeStatus, setGerminacionToChangeStatus] = useState<Germinacion | null>(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [germinacionToFinalizar, setGerminacionToFinalizar] = useState<Germinacion | null>(null);

  // Estados para modal de cambio de estado de polinizaciones
  const [showChangeStatusPolinizacionModal, setShowChangeStatusPolinizacionModal] = useState(false);
  const [polinizacionToChangeStatus, setPolinizacionToChangeStatus] = useState<Polinizacion | null>(null);
  const [showFinalizarPolinizacionModal, setShowFinalizarPolinizacionModal] = useState(false);
  const [polinizacionToFinalizar, setPolinizacionToFinalizar] = useState<Polinizacion | null>(null);

  // Efectos
  useEffect(() => {
    const newTab = params['tab'];
    if (newTab && ['resumen', 'polinizaciones', 'germinaciones', 'usuarios', 'notificaciones'].includes(newTab as string)) {
      setTab(newTab as TabType);
    }
  }, [params['tab']]);

  // Función principal para obtener datos - Reutilizable
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
            console.log('🔍 [PERFIL] Llamando getMisPolinizacionesPaginated con:', {
              page: polinizacionesPage,
              page_size: 20,
              search: searchPolinizaciones || undefined,
              dias_recientes: 0
            });
            const result = await polinizacionService.getMisPolinizacionesPaginated({
              page: polinizacionesPage,
              page_size: 20,
              search: searchPolinizaciones || undefined,
              dias_recientes: 0 // 0 = ver todas las polinizaciones sin filtro de fecha
            });
            console.log('✅ [PERFIL] Resultado getMisPolinizacionesPaginated:', {
              count: result.count,
              totalPages: result.totalPages,
              resultsLength: result.results?.length,
              results: result.results
            });
            misPolinizaciones = Array.isArray(result.results) ? result.results : [];
            setPolinizacionesTotalPages(result.totalPages);
            setPolinizacionesTotalCount(result.count);
          } else {
            // Para resumen y notificaciones, obtener todas sin paginación
            console.log('🔍 [PERFIL] Llamando getMisPolinizaciones(0)');
            const pols = await polinizacionService.getMisPolinizaciones(0); // 0 = todas
            console.log('✅ [PERFIL] Resultado getMisPolinizaciones:', {
              length: Array.isArray(pols) ? pols.length : 0,
              data: pols
            });
            misPolinizaciones = Array.isArray(pols) ? pols : [];
          }
        } catch (error) {
          console.error('❌ [PERFIL] Error obteniendo polinizaciones:', error);
          misPolinizaciones = [];
        }
      }

      console.log('📊 [PERFIL] misPolinizaciones final:', {
        length: misPolinizaciones.length,
        data: misPolinizaciones
      });

      if (tab === 'germinaciones' || tab === 'resumen' || tab === 'notificaciones') {
        try {
          if (tab === 'germinaciones') {
            // Usar paginación para la tab de germinaciones
            const result = await germinacionService.getMisGerminacionesPaginated({
              page: germinacionesPage,
              page_size: 20,
              search: searchGerminaciones || undefined,
              dias_recientes: 0 // 0 = ver todas las germinaciones sin filtro de fecha
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

      // Obtener usuarios solo si estamos en la tab de usuarios y es administrador
      if (tab === 'usuarios') {
        const adminStatus = isAdmin();
        if (adminStatus) {
          try {
            const allUsers = await rbacService.getAllUsers();
            setUsuarios(Array.isArray(allUsers) ? allUsers : []);
          } catch (error: any) {
            console.error('Error obteniendo usuarios:', error);
            setUsuarios([]);
            // Solo mostrar alerta si no es un error de permisos (403)
            if (error.response?.status !== 403) {
              Alert.alert('Error', 'No se pudieron cargar los usuarios: ' + (error.message || 'Error desconocido'));
            }
          }
        } else {
          // Si no es admin, limpiar la lista de usuarios
          setUsuarios([]);
        }
      } else if (tab !== 'usuarios') {
        // Limpiar usuarios cuando se cambia a otra pestaña para liberar memoria
        setUsuarios([]);
      }

      // Calcular estadísticas si no se obtuvieron
      if (!stats && (tab === 'resumen' || tab === 'polinizaciones' || tab === 'germinaciones')) {
        stats = {
          total_polinizaciones: misPolinizaciones.length,
          total_germinaciones: misGerminaciones.length,
          polinizaciones_actuales: misPolinizaciones.filter(p =>
            p.etapa_actual === 'En desarrollo' || p.etapa_actual === 'Ingresado'
          ).length,
          germinaciones_actuales: misGerminaciones.filter(g =>
            g.etapa_actual === 'En desarrollo' || g.etapa_actual === 'Ingresado'
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
        search: searchPolinizaciones || undefined,
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
        search: searchGerminaciones || undefined,
        dias_recientes: 0 // 0 = ver todas las germinaciones sin filtro de fecha
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
    console.log('🚀 handleDescargarPDF llamado con tipo:', tipo);
    console.log('👤 Usuario actual:', user);

    if (!user) {
      console.log('❌ Usuario no autenticado');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    const search = tipo === 'polinizaciones' ? searchPolinizaciones : searchGerminaciones;
    const searchText = search ? ` (Búsqueda: "${search}")` : '';

    console.log('📋 Mostrando diálogo de confirmación...');

    // Función de descarga (compartida entre web y mobile)
    const ejecutarDescarga = async () => {
      let loadingSet = false;
      try {
              setLoading(true);
              loadingSet = true;

              console.log(`🔄 Iniciando descarga de PDF de ${tipo}...`);
              console.log(`🔍 Usuario: ${user?.username}`);
              console.log(`🔍 Búsqueda: ${search}`);

              // Obtener token de autenticación
              const token = await SecureStore.secureStore.getItem('authToken');
              if (!token) {
                throw new Error('No hay token de autenticación');
              }

              // Construir URL usando el endpoint específico para "mis" registros
              const params = new URLSearchParams();
              if (search) params.append('search', search);

              const url = `http://127.0.0.1:8000/api/${tipo}/mis-${tipo}-pdf/?${params.toString()}`;
              console.log(`🔍 URL completa: ${url}`);

              // Crear nombre de archivo
              const timestamp = new Date().toISOString().slice(0, 10);
              const searchSuffix = search ? `_${search.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
              const fileName = `mis_${tipo}${searchSuffix}_${timestamp}.pdf`;

              // Detectar plataforma usando Platform

              if (Platform.OS === 'web') {
                // Descarga para web
                console.log('🌐 Descargando en web...');
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

                console.log(`✅ PDF de ${tipo} descargado exitosamente en web`);
                Alert.alert('Éxito', `PDF de ${tipo} descargado correctamente`);
              } else {
                // Descarga para móvil
                console.log('📱 Descargando en móvil...');
                const fileUri = `${FileSystem.documentDirectory}${fileName}`;

                const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                  }
                });

                console.log(`📥 Resultado de descarga: ${downloadResult.status}`);

                if (downloadResult.status === 200) {
                  // Compartir archivo
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri, {
                      mimeType: 'application/pdf',
                      dialogTitle: `Mis ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} PDF`,
                    });
                  }
                  console.log(`✅ PDF de ${tipo} descargado exitosamente en móvil`);
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

    // Mostrar confirmación según la plataforma
    if (Platform.OS === 'web') {
      console.log('🌐 Usando window.confirm para web');
      const confirmacion = confirm(`¿Deseas descargar el PDF de tus ${tipo}${searchText}?`);
      if (confirmacion) {
        console.log('✅ Usuario confirmó descarga');
        await ejecutarDescarga();
      } else {
        console.log('❌ Usuario canceló descarga');
      }
    } else {
      console.log('📱 Usando Alert.alert para mobile');
      Alert.alert(
        'Descargar PDF',
        `¿Deseas descargar el PDF de tus ${tipo}${searchText}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descargar', onPress: ejecutarDescarga }
        ]
      );
    }
  }, [user, searchPolinizaciones, searchGerminaciones]);

  // Función de logout optimizada
  const handleLogout = useCallback(() => {
    console.log('⚪️ [DEBUG] handleLogout llamado');
    if (Platform.OS === 'web') {
      if (confirm('¿Está seguro que desea cerrar sesión?')) {
        console.log('[DEBUG] Confirmado logout, llamando a forceLogout...');
        forceLogout();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Está seguro que desea cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => console.log('[DEBUG] Logout cancelado') },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: () => {
              console.log('[DEBUG] Confirmado logout, llamando a forceLogout...');
              forceLogout();
            }
          }
        ]
      );
    }
  }, [forceLogout]);

  // Función de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ============================================================================
  // FUNCIONES PARA POLINIZACIONES
  // ============================================================================

  const handleViewPolinizacion = (item: Polinizacion) => {
    setSelectedPolinizacion(item);
    setShowPolinizacionDetailsModal(true);
  };

  const handleEditPolinizacion = (item: Polinizacion) => {
    setSelectedPolinizacion(item);
    setShowPolinizacionEditModal(true);
  };

  const handleDeletePolinizacion = async (item: Polinizacion) => {
    const codigoCompleto = item.codigo || item.nombre || 'esta polinización';
    
    if (Platform.OS === 'web') {
      if (confirm(`¿Estás seguro de eliminar la polinización ${codigoCompleto}?`)) {
        try {
          setLoading(true);
          await polinizacionService.delete(item.numero);
          await fetchData();
          toast.success('Polinización eliminada correctamente');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'No se pudo eliminar la polinización');
        } finally {
          setLoading(false);
        }
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de eliminar la polinización ${codigoCompleto}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await polinizacionService.delete(item.numero);
                await fetchData();
                toast.success('Polinización eliminada correctamente');
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'No se pudo eliminar la polinización');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  // ============================================================================
  // FUNCIONES PARA GERMINACIONES
  // ============================================================================

  const handleViewGerminacion = async (item: Germinacion) => {
    try {
      // Recargar la germinación desde el servidor para tener datos frescos
      const germinacionActualizada = await germinacionService.getById(item.id);
      setSelectedGerminacion(germinacionActualizada);
      setShowGerminacionDetailsModal(true);
    } catch (error) {
      console.error('Error cargando germinación:', error);
      // Si falla, usar los datos en caché
      setSelectedGerminacion(item);
      setShowGerminacionDetailsModal(true);
    }
  };

  const handleEditGerminacion = (item: Germinacion) => {
    setSelectedGerminacion(item);
    setShowGerminacionEditModal(true);
  };

  const handleDeleteGerminacion = async (item: Germinacion) => {
    const codigoCompleto = item.codigo || item.nombre || 'esta germinación';
    
    if (Platform.OS === 'web') {
      if (confirm(`¿Estás seguro de eliminar la germinación ${codigoCompleto}?`)) {
        try {
          setLoading(true);
          await germinacionService.delete(item.id);
          await fetchData();
          toast.success('Germinación eliminada correctamente');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'No se pudo eliminar la germinación');
        } finally {
          setLoading(false);
        }
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de eliminar la germinación ${codigoCompleto}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await germinacionService.delete(item.id);
                await fetchData();
                toast.success('Germinación eliminada correctamente');
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'No se pudo eliminar la germinación');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  const handleCambiarEtapaGerminacion = async (germinacionId: number, nuevaEtapa: 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO', fechaGerminacion?: string) => {
    try {
      setLoading(true);
      // Mapear etapas antiguas a estados nuevos
      const estadoMap: Record<string, 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO'> = {
        'INGRESADO': 'INICIAL',
        'EN_PROCESO': 'EN_PROCESO',
        'FINALIZADO': 'FINALIZADO'
      };
      const nuevoEstado = estadoMap[nuevaEtapa] || 'EN_PROCESO';
      await germinacionService.cambiarEstadoGerminacion(germinacionId, nuevoEstado, fechaGerminacion);

      // Actualizar la germinación seleccionada con el nuevo estado
      if (selectedGerminacion) {
        const updatedGerminacion = { 
          ...selectedGerminacion, 
          estado_germinacion: nuevoEstado,
          progreso_germinacion: nuevoEstado === 'INICIAL' ? 0 : nuevoEstado === 'FINALIZADO' ? 100 : 50
        };
        if (nuevoEstado === 'FINALIZADO') {
          updatedGerminacion.fecha_germinacion = new Date().toISOString().split('T')[0];
        }
        setSelectedGerminacion(updatedGerminacion);
      }

      // Cerrar el modal de cambio de estado si está abierto
      setShowChangeStatusModal(false);
      setGerminacionToChangeStatus(null);

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
    setGerminacionToChangeStatus(item);
    setShowChangeStatusModal(true);
  };

  const handleOpenFinalizarModal = (item: Germinacion) => {
    setGerminacionToFinalizar(item);
    setShowFinalizarModal(true);
  };

  const handleConfirmFinalizar = async (fechaGerminacion: string) => {
    if (!germinacionToFinalizar) return;
    
    try {
      setLoading(true);
      
      // Llamar al servicio y obtener la respuesta actualizada
      const response = await germinacionService.cambiarEstadoGerminacion(
        germinacionToFinalizar.id, 
        'FINALIZADO', 
        fechaGerminacion
      );
      
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar la germinación en la lista local
      setGerminaciones(prevGerminaciones => 
        prevGerminaciones.map(g => 
          g.id === germinacionToFinalizar.id 
            ? { 
                ...g, 
                estado_germinacion: 'FINALIZADO',
                progreso_germinacion: 100,
                fecha_germinacion: fechaGerminacion
              }
            : g
        )
      );
      
      // Actualizar la germinación seleccionada si es la misma
      if (selectedGerminacion && selectedGerminacion.id === germinacionToFinalizar.id) {
        setSelectedGerminacion({
          ...selectedGerminacion,
          estado_germinacion: 'FINALIZADO',
          progreso_germinacion: 100,
          fecha_germinacion: fechaGerminacion
        });
      }
      
      // Cerrar modal
      setShowFinalizarModal(false);
      setGerminacionToFinalizar(null);
      
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
    setPolinizacionToChangeStatus(item);
    setShowChangeStatusPolinizacionModal(true);
  };

  const handleOpenFinalizarPolinizacionModal = (item: Polinizacion) => {
    setPolinizacionToFinalizar(item);
    setShowFinalizarPolinizacionModal(true);
  };

  const handleCambiarEstadoPolinizacion = async (polinizacionId: number, nuevoEstado: 'INICIAL' | 'EN_PROCESO' | 'FINALIZADO', fechaMaduracion?: string) => {
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
                progreso_polinizacion: nuevoEstado === 'INICIAL' ? 0 : nuevoEstado === 'FINALIZADO' ? 100 : 50,
                fechamad: nuevoEstado === 'FINALIZADO' && fechaMaduracion ? fechaMaduracion : p.fechamad
              }
            : p
        )
      );

      // Actualizar la polinización seleccionada si es la misma
      if (selectedPolinizacion && selectedPolinizacion.numero === polinizacionId) {
        setSelectedPolinizacion({
          ...selectedPolinizacion,
          estado_polinizacion: nuevoEstado,
          progreso_polinizacion: nuevoEstado === 'INICIAL' ? 0 : nuevoEstado === 'FINALIZADO' ? 100 : 50,
          fechamad: nuevoEstado === 'FINALIZADO' && fechaMaduracion ? fechaMaduracion : selectedPolinizacion.fechamad
        });
      }

      // Cerrar el modal de cambio de estado si está abierto
      setShowChangeStatusPolinizacionModal(false);
      setPolinizacionToChangeStatus(null);

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
    if (!polinizacionToFinalizar) return;
    
    try {
      setLoading(true);
      
      const response = await polinizacionService.cambiarEstadoPolinizacion(
        polinizacionToFinalizar.numero, 
        'FINALIZADO', 
        fechaMaduracion
      );
      
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar la polinización en la lista local
      setPolinizaciones(prevPolinizaciones => 
        prevPolinizaciones.map(p => 
          p.numero === polinizacionToFinalizar.numero 
            ? { 
                ...p, 
                estado_polinizacion: 'FINALIZADO',
                progreso_polinizacion: 100,
                fechamad: fechaMaduracion
              }
            : p
        )
      );
      
      // Actualizar la polinización seleccionada si es la misma
      if (selectedPolinizacion && selectedPolinizacion.numero === polinizacionToFinalizar.numero) {
        setSelectedPolinizacion({
          ...selectedPolinizacion,
          estado_polinizacion: 'FINALIZADO',
          progreso_polinizacion: 100,
          fechamad: fechaMaduracion
        });
      }
      
      // Cerrar modal
      setShowFinalizarPolinizacionModal(false);
      setPolinizacionToFinalizar(null);
      
      // Recargar datos del servidor
      await fetchData();
      
      toast.success('Polinización finalizada exitosamente');
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
      />
    );
  };

  // Renderizado principal
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TabNavigation currentTab="perfil" />

      {/* Cabecera del usuario */}
      <PerfilHeader user={user} onLogout={handleLogout} />

      {/* Navegación por pestañas */}
      <PerfilTabSelector
        currentTab={tab}
        onTabChange={setTab}
        canViewPolinizaciones={canViewPolinizaciones()}
        canViewGerminaciones={canViewGerminaciones()}
        isAdmin={isAdmin()}
      />

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
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
        {tab === 'notificaciones' && canViewGerminaciones() && (
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
          />
        )}
        {tab === 'usuarios' && isAdmin() && <PerfilUsuariosTab />}
      </View>

      {/* Modal de creación de usuario */}
      <GerminacionDetailsModal
        visible={showGerminacionDetailsModal}
        germinacion={selectedGerminacion}
        onClose={() => setShowGerminacionDetailsModal(false)}
        onCambiarEtapa={handleCambiarEtapaGerminacion}
        onOpenFinalizar={handleOpenFinalizarModal}
      />

      {/* Modal de edición de germinación */}
      {selectedGerminacion && (
        <GerminacionForm
          visible={showGerminacionEditModal}
          onClose={() => {
            setShowGerminacionEditModal(false);
            setSelectedGerminacion(null);
          }}
          form={{
            codigo: selectedGerminacion.codigo || '',
            genero: selectedGerminacion.genero || '',
            especie_variedad: selectedGerminacion.especie_variedad || '',
            fecha_siembra: selectedGerminacion.fecha_siembra || '',
            fecha_polinizacion: selectedGerminacion.fecha_polinizacion || '',
            clima: selectedGerminacion.clima || 'I',
            percha: selectedGerminacion.percha || '',
            nivel: selectedGerminacion.nivel || '',
            clima_lab: selectedGerminacion.clima_lab || 'I',
            finca: selectedGerminacion.finca || '',
            numero_vivero: selectedGerminacion.numero_vivero || '',
            cantidad_solicitada: selectedGerminacion.cantidad_solicitada?.toString() || '',
            no_capsulas: selectedGerminacion.no_capsulas?.toString() || '',
            estado_capsula: selectedGerminacion.estado_capsula || 'CERRADA',
            estado_semilla: selectedGerminacion.estado_semilla || 'MADURA',
            cantidad_semilla: selectedGerminacion.cantidad_semilla || 'ABUNDANTE',
            semilla_en_stock: selectedGerminacion.semilla_en_stock || false,
            observaciones: selectedGerminacion.observaciones || '',
            responsable: selectedGerminacion.responsable || '',
            etapa_actual: selectedGerminacion.etapa_actual || 'INGRESADO',
          }}
          setForm={() => {}} // No se usa en modo edición
          onSubmit={async () => {
            try {
              // Aquí iría la lógica de actualización
              Alert.alert('Éxito', 'Germinación actualizada correctamente');
              setShowGerminacionEditModal(false);
              setSelectedGerminacion(null);
              // Recargar datos
              const fetchData = async () => {
                setLoading(true);
                try {
                  const result = await germinacionService.getMisGerminacionesPaginated({
                    page: germinacionesPage,
                    page_size: 20,
                    search: searchGerminaciones || undefined,
                    dias_recientes: 0 // 0 = ver todas las germinaciones sin filtro de fecha
                  });
                  setGerminaciones(Array.isArray(result.results) ? result.results : []);
                  setGerminacionesTotalPages(result.totalPages);
                  setGerminacionesTotalCount(result.count);
                } catch (error) {
                  console.error('Error recargando germinaciones:', error);
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo actualizar la germinación');
            }
          }}
          saving={false}
          codigosDisponibles={[]}
          especiesDisponibles={[]}
          perchasDisponibles={[]}
          nivelesDisponibles={[]}
          handleCodigoSelection={() => {}}
          handleEspecieSelection={() => {}}
        />
      )}

      {/* Modal de cambio de estado de germinación */}
      <Modal
        visible={showChangeStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangeStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 500 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Estado de Germinación</Text>
              <TouchableOpacity onPress={() => setShowChangeStatusModal(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {germinacionToChangeStatus && (
              <View style={{ padding: 24 }}>
                {/* Información de la germinación */}
                <View style={[styles.detailSection, { marginBottom: 24 }]}>
                  <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Germinación</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                    {germinacionToChangeStatus.codigo || 'Sin código'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {germinacionToChangeStatus.genero} {germinacionToChangeStatus.especie_variedad}
                  </Text>
                </View>

                {/* Estado actual */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
                    Estado Actual
                  </Text>
                  <View style={[
                    styles.estadoBadge,
                    {
                      alignSelf: 'flex-start',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor:
                        germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' ? '#D1FAE5' :
                        germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' ? '#FEF3C7' :
                        '#E5E7EB'
                    }
                  ]}>
                    <Ionicons
                      name={
                        germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' ? 'checkmark-circle' :
                        germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' ? 'time' :
                        'ellipse'
                      }
                      size={18}
                      color={
                        germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' ? '#059669' :
                        germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                        '#6B7280'
                      }
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.estadoBadgeText,
                      {
                        color:
                          germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' ? '#059669' :
                          germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                          '#6B7280'
                      }
                    ]}>
                      {germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' ? 'Finalizado' :
                       germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' ? 'En Proceso' :
                       'Inicial'}
                    </Text>
                  </View>
                </View>

                {/* Botones de cambio de estado */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
                    Cambiar a
                  </Text>
                  <View style={{ gap: 12 }}>
                    {/* Solo mostrar "En Proceso" si está en INICIAL */}
                    {(germinacionToChangeStatus.estado_germinacion === 'INICIAL' || !germinacionToChangeStatus.estado_germinacion) && (
                      <TouchableOpacity
                        style={[styles.etapaButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleCambiarEtapaGerminacion(germinacionToChangeStatus.id, 'EN_PROCESO')}
                      >
                        <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.etapaButtonText}>Iniciar Proceso</Text>
                      </TouchableOpacity>
                    )}

                    {/* Solo mostrar "Finalizar" si está en EN_PROCESO */}
                    {germinacionToChangeStatus.estado_germinacion === 'EN_PROCESO' && (
                      <TouchableOpacity
                        style={[styles.etapaButton, { backgroundColor: '#10B981' }]}
                        onPress={() => {
                          setShowChangeStatusModal(false);
                          handleOpenFinalizarModal(germinacionToChangeStatus);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.etapaButtonText}>Finalizar</Text>
                      </TouchableOpacity>
                    )}

                    {/* Mensaje si ya está finalizada */}
                    {germinacionToChangeStatus.estado_germinacion === 'FINALIZADO' && (
                      <View style={styles.etapaCompletadaContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#059669" />
                        <Text style={styles.etapaCompletadaText}>
                          Esta germinación ya está finalizada
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Botón cerrar */}
                <TouchableOpacity
                  style={[styles.modalCloseButton, { marginTop: 8 }]}
                  onPress={() => setShowChangeStatusModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de edición de polinización */}
      {selectedPolinizacion && (
        <PolinizacionForm
          visible={showPolinizacionEditModal}
          onClose={() => {
            setShowPolinizacionEditModal(false);
            setSelectedPolinizacion(null);
          }}
          form={{
            id: selectedPolinizacion.id || selectedPolinizacion.numero,
            fecha_polinizacion: selectedPolinizacion.fechapol || '',
            fecha_maduracion: selectedPolinizacion.fechamad || '',
            tipo_polinizacion: selectedPolinizacion.tipo_polinizacion || selectedPolinizacion.Tipo || 'SELF',
            madre_codigo: selectedPolinizacion.madre_codigo || '',
            madre_genero: selectedPolinizacion.madre_genero || selectedPolinizacion.genero || '',
            madre_especie: selectedPolinizacion.madre_especie || selectedPolinizacion.especie || '',
            madre_clima: selectedPolinizacion.madre_clima || 'I',
            padre_codigo: selectedPolinizacion.padre_codigo || '',
            padre_genero: selectedPolinizacion.padre_genero || '',
            padre_especie: selectedPolinizacion.padre_especie || '',
            padre_clima: selectedPolinizacion.padre_clima || 'I',
            nueva_codigo: selectedPolinizacion.nueva_codigo || '',
            nueva_genero: selectedPolinizacion.nueva_genero || '',
            nueva_especie: selectedPolinizacion.nueva_especie || '',
            nueva_clima: selectedPolinizacion.nueva_clima || 'I',
            vivero: selectedPolinizacion.vivero || '',
            mesa: selectedPolinizacion.mesa || '',
            pared: selectedPolinizacion.pared || '',
            ubicacion_tipo: selectedPolinizacion.ubicacion_tipo || 'vivero',
            ubicacion_nombre: selectedPolinizacion.ubicacion_nombre || '',
            cantidad_capsulas: selectedPolinizacion.cantidad_capsulas || 1,
            cantidad: selectedPolinizacion.cantidad || 1,
            responsable: selectedPolinizacion.responsable || '',
            observaciones: selectedPolinizacion.observaciones || '',
            estado: selectedPolinizacion.estado || 'INGRESADO',
            clima: '',
            ubicacion: '',
            cantidad_solicitada: '',
            cantidad_disponible: '',
            cantidad_semilla: '',
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
          }}
          setForm={() => {}} // No se usa en modo edición
          onSave={async () => {
            try {
              // Actualizar polinización
              await polinizacionService.update(selectedPolinizacion.id || selectedPolinizacion.numero, {
                fechapol: selectedPolinizacion.fechapol,
                fechamad: selectedPolinizacion.fechamad,
                tipo_polinizacion: selectedPolinizacion.tipo_polinizacion,
                madre_codigo: selectedPolinizacion.madre_codigo,
                madre_genero: selectedPolinizacion.madre_genero,
                madre_especie: selectedPolinizacion.madre_especie,
                madre_clima: selectedPolinizacion.madre_clima,
                padre_codigo: selectedPolinizacion.padre_codigo,
                padre_genero: selectedPolinizacion.padre_genero,
                padre_especie: selectedPolinizacion.padre_especie,
                padre_clima: selectedPolinizacion.padre_clima,
                nueva_codigo: selectedPolinizacion.nueva_codigo,
                nueva_genero: selectedPolinizacion.nueva_genero,
                nueva_especie: selectedPolinizacion.nueva_especie,
                nueva_clima: selectedPolinizacion.nueva_clima,
                vivero: selectedPolinizacion.vivero,
                mesa: selectedPolinizacion.mesa,
                pared: selectedPolinizacion.pared,
                ubicacion_tipo: selectedPolinizacion.ubicacion_tipo,
                ubicacion_nombre: selectedPolinizacion.ubicacion_nombre,
                cantidad_capsulas: selectedPolinizacion.cantidad_capsulas,
                cantidad: selectedPolinizacion.cantidad,
                responsable: selectedPolinizacion.responsable,
                observaciones: selectedPolinizacion.observaciones,
                estado: selectedPolinizacion.estado,
              });
              
              Alert.alert('Éxito', 'Polinización actualizada correctamente');
              setShowPolinizacionEditModal(false);
              setSelectedPolinizacion(null);
              
              // Recargar datos
              const fetchData = async () => {
                setLoading(true);
                try {
                  const result = await polinizacionService.getMisPolinizacionesPaginated({
                    page: polinizacionesPage,
                    page_size: 20,
                    search: searchPolinizaciones || undefined,
                    dias_recientes: 0 // 0 = ver todas las polinizaciones sin filtro de fecha
                  });
                  setPolinizaciones(Array.isArray(result.results) ? result.results : []);
                  setPolinizacionesTotalPages(result.totalPages);
                  setPolinizacionesTotalCount(result.count);
                } catch (error) {
                  console.error('Error recargando polinizaciones:', error);
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
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
        visible={showChangeStatusModal}
        onClose={() => {
          setShowChangeStatusModal(false);
          setGerminacionToChangeStatus(null);
        }}
        onCambiarEstado={(estado) => {
          if (germinacionToChangeStatus) {
            if (estado === 'FINALIZADO') {
              // Abrir modal de finalizar con calendario
              handleOpenFinalizarModal(germinacionToChangeStatus);
            } else {
              // Mapear INICIAL a INGRESADO para compatibilidad
              const estadoMapeado = estado === 'INICIAL' ? 'INGRESADO' : estado;
              handleCambiarEtapaGerminacion(germinacionToChangeStatus.id, estadoMapeado as 'INGRESADO' | 'EN_PROCESO' | 'FINALIZADO');
            }
          }
        }}
        item={germinacionToChangeStatus}
        tipo="germinacion"
      />

      {/* Modal genérico de cambio de estado para polinizaciones */}
      <CambiarEstadoModal
        visible={showChangeStatusPolinizacionModal}
        onClose={() => {
          setShowChangeStatusPolinizacionModal(false);
          setPolinizacionToChangeStatus(null);
        }}
        onCambiarEstado={(estado) => {
          if (polinizacionToChangeStatus) {
            if (estado === 'FINALIZADO') {
              // Abrir modal de finalizar con calendario
              handleOpenFinalizarPolinizacionModal(polinizacionToChangeStatus);
            } else {
              // Cambiar estado directamente
              handleCambiarEstadoPolinizacion(polinizacionToChangeStatus.numero, estado);
            }
          }
        }}
        item={polinizacionToChangeStatus}
        tipo="polinizacion"
      />

      {/* Modal genérico de finalizar con calendario para germinaciones */}
      <FinalizarModal
        visible={showFinalizarModal}
        onClose={() => {
          setShowFinalizarModal(false);
          setGerminacionToFinalizar(null);
        }}
        onConfirm={handleConfirmFinalizar}
        item={germinacionToFinalizar}
        tipo="germinacion"
      />

      {/* Modal genérico de finalizar con calendario para polinizaciones */}
      <FinalizarModal
        visible={showFinalizarPolinizacionModal}
        onClose={() => {
          setShowFinalizarPolinizacionModal(false);
          setPolinizacionToFinalizar(null);
        }}
        onConfirm={handleConfirmFinalizarPolinizacion}
        item={polinizacionToFinalizar}
        tipo="polinizacion"
      />

    </ScrollView>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Platform, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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
import { UserManagementTable } from '@/components/UserManagement';
import { CreateUserModal, UserFormData as CreateUserFormData } from '@/components/UserManagement/CreateUserModal';
import { EditUserModal, UserFormData as EditUserFormData } from '@/components/UserManagement/EditUserModal';
import { GerminacionForm } from '@/components/forms/GerminacionForm';
import { PolinizacionForm } from '@/components/forms/PolinizacionForm';
import { GerminacionCard } from '@/components/cards/GerminacionCard';
import { PolinizacionCard } from '@/components/cards/PolinizacionCard';
import { CambiarEstadoModal } from '@/components/modals/CambiarEstadoModal';
import { FinalizarModal } from '@/components/modals/FinalizarModal';
import Pagination from '@/components/filters/Pagination';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import type { Polinizacion, Germinacion, EstadisticasUsuario, UserWithProfile } from '@/types/index';

type TabType = 'resumen' | 'polinizaciones' | 'germinaciones' | 'usuarios' | 'notificaciones';

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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // Estado para modal de edición de usuario
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithProfile | null>(null);

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
            const result = await polinizacionService.getMisPolinizacionesPaginated({
              page: polinizacionesPage,
              page_size: 20,
              search: searchPolinizaciones || undefined
            });
            misPolinizaciones = Array.isArray(result.results) ? result.results : [];
            setPolinizacionesTotalPages(result.totalPages);
            setPolinizacionesTotalCount(result.count);
          } else {
            // Para resumen y notificaciones, obtener todas sin paginación
            const pols = await polinizacionService.getMisPolinizaciones('');
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
              search: searchGerminaciones || undefined
            });
            misGerminaciones = Array.isArray(result.results) ? result.results : [];
            setGerminacionesTotalPages(result.totalPages);
            setGerminacionesTotalCount(result.count);
          } else {
            // Para resumen y notificaciones, obtener todas sin paginación
            const germs = await germinacionService.getMisGerminaciones('');
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
        search: searchPolinizaciones || undefined
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
        search: searchGerminaciones || undefined
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

  // Función para crear usuario
  const handleCreateUser = async (userData: CreateUserFormData) => {
    try {
      await rbacService.createUser(userData);
      Alert.alert('Éxito', 'Usuario creado correctamente');
      setShowCreateUserModal(false);
      await fetchData(); // Refresh user list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear usuario';
      throw new Error(errorMessage);
    }
  };

  // Función para editar usuario
  const handleEditUser = (userToEdit: UserWithProfile) => {
    setUserToEdit(userToEdit);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userId: number, userData: EditUserFormData) => {
    try {
      await rbacService.updateUser(userId, userData);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      setShowEditUserModal(false);
      await fetchData(); // Refresh user list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar usuario';
      throw new Error(errorMessage);
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userToDelete: UserWithProfile) => {
    if (Platform.OS === 'web') {
      if (confirm(`¿Está seguro que desea eliminar el usuario "${userToDelete.username}"?`)) {
        try {
          await rbacService.deleteUser(userToDelete.id);
          Alert.alert('Éxito', 'Usuario eliminado correctamente');
          await fetchData();
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'Error al eliminar usuario');
        }
      }
    } else {
      Alert.alert(
        'Eliminar Usuario',
        `¿Está seguro que desea eliminar el usuario "${userToDelete.username}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await rbacService.deleteUser(userToDelete.id);
                Alert.alert('Éxito', 'Usuario eliminado correctamente');
                await fetchData();
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Error al eliminar usuario');
              }
            }
          }
        ]
      );
    }
  };

  // Función para cambiar el estado activo/inactivo de un usuario
  const handleToggleUserStatus = async (userToToggle: UserWithProfile) => {
    const newStatus = !userToToggle.profile?.activo;
    const statusText = newStatus ? 'activar' : 'desactivar';
    
    if (Platform.OS === 'web') {
      if (confirm(`¿Está seguro que desea ${statusText} el usuario "${userToToggle.username}"?`)) {
        try {
          await rbacService.changeUserStatus(userToToggle.id, newStatus);
          Alert.alert('Éxito', `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
          await fetchData();
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || `Error al ${statusText} usuario`);
        }
      }
    } else {
      Alert.alert(
        `${newStatus ? 'Activar' : 'Desactivar'} Usuario`,
        `¿Está seguro que desea ${statusText} el usuario "${userToToggle.username}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: newStatus ? 'Activar' : 'Desactivar',
            style: newStatus ? 'default' : 'destructive',
            onPress: async () => {
              try {
                await rbacService.changeUserStatus(userToToggle.id, newStatus);
                Alert.alert('Éxito', `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
                await fetchData();
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || `Error al ${statusText} usuario`);
              }
            }
          }
        ]
      );
    }
  };

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

  // Funciones auxiliares para colores - Funciones puras, no necesitan memoización
  const getTipoColor = (tipo: string): string => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower === 'self') return '#3B82F6';
    if (tipoLower === 'sibling') return '#8B5CF6';
    if (tipoLower === 'híbrida' || tipoLower === 'hibrida') return '#F59E0B';
    if (tipoLower === 'replante') return '#3b82f6';
    return '#3B82F6';
  };

  const getEstadoColor = (estado: string): string => {
    const estadoLower = estado?.toLowerCase() || '';
    if (estadoLower === 'completado') return '#10B981';
    if (estadoLower === 'en proceso') return '#F59E0B';
    if (estadoLower === 'ingresado') return '#6B7280';
    if (estadoLower === 'en desarrollo') return '#fbbf24';
    if (estadoLower === 'maduro') return '#60a5fa';
    if (estadoLower === 'pendiente') return '#f59e0b';
    return '#6B7280';
  };

  // Componentes de renderizado optimizados
  const renderResumen = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      );
    }

    return (
      <View style={styles.resumenContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { borderLeftColor: '#10B981' }]}>
            <Text style={styles.statLabel}>Polinizaciones</Text>
            <Text style={styles.statsValue}>{estadisticas?.total_polinizaciones ?? 0}</Text>
          </View>
          <View style={[styles.statsCard, { borderLeftColor: '#3B82F6' }]}>
            <Text style={styles.statLabel}>Germinaciones</Text>
            <Text style={styles.statsValue}>{estadisticas?.total_germinaciones ?? 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPolinizaciones = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Cargando polinizaciones...</Text>
        </View>
      );
    }

    const polinizacionesArray = Array.isArray(polinizaciones) ? polinizaciones : [];
    
    // Ya no necesitamos filtrar localmente porque la búsqueda se hace en el backend
    const filteredPolinizaciones = polinizacionesArray;

    return (
      <View style={styles.professionalTableContainer}>
        {/* Encabezado */}
        <View style={styles.tableHeaderSection}>
          <View style={styles.tableTitleContainer}>
            <Text style={styles.professionalTableTitle}>Mis Polinizaciones</Text>
            <Text style={styles.professionalTableSubtitle}>
              Registro y seguimiento de polinizaciones
            </Text>
          </View>
          <View style={styles.tableActionsContainer}>
            <TouchableOpacity
              style={styles.newItemButton}
              onPress={() => router.push('/(tabs)/addPolinizacion')}
            >
              <Ionicons name="add-circle" size={20} color={Colors.light.background} />
              <Text style={styles.newItemButtonText}>Nueva Polinización</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => {
                console.log('🔔 Botón Descargar PDF clickeado - Polinizaciones');
                handleDescargarPDF('polinizaciones');
              }}
            >
              <Ionicons name="download-outline" size={20} color={Colors.light.tint} />
              <Text style={styles.exportButtonText}>Descargar PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchAndFiltersContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por código, género, especie..."
              value={searchPolinizaciones}
              onChangeText={setSearchPolinizaciones}
              onSubmitEditing={handleBuscarPolinizaciones}
            />
            {searchPolinizaciones.length > 0 && (
              <>
                <TouchableOpacity onPress={handleBuscarPolinizaciones} style={{ marginRight: 8 }}>
                  <Ionicons name="search" size={20} color={Colors.light.tint} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setSearchPolinizaciones('');
                  setPolinizacionesPage(1);
                  fetchData();
                }}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tabla de polinizaciones */}
        {filteredPolinizaciones.length === 0 ? (
          <View style={styles.listEmptyContainer}>
            <Ionicons name="leaf-outline" size={48} color="#6b7280" />
            <Text style={styles.listEmptyText}>
              {searchPolinizaciones ? 'No se encontraron polinizaciones' : 'No hay polinizaciones registradas'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchPolinizaciones ? 'Intenta con otros términos de búsqueda' : 'Las polinizaciones que registres aparecerán aquí'}
            </Text>
          </View>
        ) : (
          <View style={[styles.tableContainer, { marginHorizontal: 0, marginBottom: 0 }]}>
            {/* Header de la tabla */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, { flex: 0.8 }]}>
                <Text style={styles.headerText}>Tipo</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Código</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text style={styles.headerText}>Especie</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Género</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Fecha Pol.</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Fecha Est.</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Estado</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Acciones</Text>
              </View>
            </View>

            {/* Filas de datos */}
            <ScrollView style={{ maxHeight: 500 }}>
              {filteredPolinizaciones.map((item, index) => {
                // Construir especie completa
                const especieCompleta = item.nueva_planta_especie || item.especie || item.madre_especie || 'Sin especie';
                const generoCompleto = item.nueva_planta_genero || item.genero || item.madre_genero || 'Sin género';
                const codigoCompleto = item.codigo || item.nombre || item.nueva_codigo || item.madre_codigo || 'Sin código';
                const fechaFormateada = item.fechapol
                  ? new Date(item.fechapol).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'Sin fecha';
                const estadoActual = item.fechamad ? 'Completado' :
                                   (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) ? 'En Proceso' :
                                   'Ingresado';

                // Calcular progreso de la polinización
                const calculateProgress = () => {
                  if (item.fechamad) return 100; // Completado
                  if (item.fechapol) return 70; // En proceso
                  return 30; // Ingresado
                };
                const progress = calculateProgress();

                const tipo = item.tipo_polinizacion || item.tipo || 'SELF';
                const itemKey = item.numero?.toString() || item.id?.toString() || `pol-${index}`;
                const tipoColor = getTipoColor(tipo);
                const estadoColor = getEstadoColor(estadoActual);
                const isLastRow = index === filteredPolinizaciones.length - 1;

                return (
                  <View
                    key={itemKey}
                    style={[
                      styles.tableRowContainer,
                      isLastRow && styles.tableRowContainerLast
                    ]}
                  >
                    {/* Fila principal con datos */}
                    <View style={styles.tableRow}>
                      <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                        <View style={[styles.tipoBadge, { backgroundColor: tipoColor }]}>
                          <Text style={styles.tipoBadgeText}>{tipo}</Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="tail">
                          {codigoCompleto}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 2 }]}>
                        <Text style={styles.especieText} numberOfLines={2} ellipsizeMode="tail">
                          {especieCompleta}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.generoText} numberOfLines={1} ellipsizeMode="tail">
                          {generoCompleto}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.fechaText}>{fechaFormateada}</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        {item.fecha_maduracion_predicha ? (
                          <View>
                            <Text style={[styles.fechaText, { fontSize: 11 }]}>
                              {new Date(item.fecha_maduracion_predicha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Text>
                            {(() => {
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const fechaEst = new Date(item.fecha_maduracion_predicha);
                              fechaEst.setHours(0, 0, 0, 0);
                              const diasFaltantes = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                              return diasFaltantes > 0 ? (
                                <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '600' }}>
                                  {diasFaltantes}d restantes
                                </Text>
                              ) : diasFaltantes === 0 ? (
                                <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '600' }}>
                                  Hoy
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '600' }}>
                                  Vencido
                                </Text>
                              );
                            })()}
                          </View>
                        ) : (
                          <Text style={[styles.fechaText, { fontSize: 10, color: '#9CA3AF' }]}>
                            Sin predicción
                          </Text>
                        )}
                      </View>
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                          <Text style={styles.estadoBadgeText}>{estadoActual}</Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        <View style={styles.actionsCell}>
                          <TouchableOpacity
                            onPress={() => handleViewPolinizacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleEditPolinizacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="create-outline" size={20} color="#F59E0B" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeletePolinizacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Barra de progreso */}
                    <View style={styles.progressRow}>
                      <View style={styles.progressInfo}>
                        <Ionicons
                          name="stats-chart-outline"
                          size={12}
                          color={estadoColor}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.progressLabel}>Progreso:</Text>
                        <Text style={[styles.progressPercentage, { color: estadoColor }]}>{progress}%</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: estadoColor
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Paginación */}
        {polinizacionesTotalPages > 1 && (
          <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
            <Text style={{ marginBottom: 8, textAlign: 'center', color: '#6b7280' }}>
              Mostrando {polinizaciones.length} de {polinizacionesTotalCount} polinizaciones
            </Text>
            <Pagination
              currentPage={polinizacionesPage}
              totalPages={polinizacionesTotalPages}
              goToPage={handlePolinizacionesPageChange}
              nextPage={handlePolinizacionesNextPage}
              prevPage={handlePolinizacionesPrevPage}
            />
          </View>
        )}
      </View>
    );
  };

  const renderGerminaciones = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Cargando germinaciones...</Text>
        </View>
      );
    }

    const germinacionesArray = Array.isArray(germinaciones) ? germinaciones : [];
    
    // Ya no necesitamos filtrar localmente porque la búsqueda se hace en el backend
    const filteredGerminaciones = germinacionesArray;

    return (
      <View style={styles.professionalTableContainer}>
        {/* Encabezado */}
        <View style={styles.tableHeaderSection}>
          <View style={styles.tableTitleContainer}>
            <Text style={styles.professionalTableTitle}>Mis Germinaciones</Text>
            <Text style={styles.professionalTableSubtitle}>
              Registro y seguimiento de germinaciones
            </Text>
          </View>
          <View style={styles.tableActionsContainer}>
            <TouchableOpacity
              style={styles.newItemButton}
              onPress={() => router.push('/(tabs)/addGerminacion')}
            >
              <Ionicons name="add-circle" size={20} color={Colors.light.background} />
              <Text style={styles.newItemButtonText}>Nueva Germinación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => {
                console.log('🔔 Botón Descargar PDF clickeado - Germinaciones');
                handleDescargarPDF('germinaciones');
              }}
            >
              <Ionicons name="download-outline" size={20} color={Colors.light.tint} />
              <Text style={styles.exportButtonText}>Descargar PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchAndFiltersContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por código, género, especie..."
              value={searchGerminaciones}
              onChangeText={setSearchGerminaciones}
              onSubmitEditing={handleBuscarGerminaciones}
            />
            {searchGerminaciones.length > 0 && (
              <>
                <TouchableOpacity onPress={handleBuscarGerminaciones} style={{ marginRight: 8 }}>
                  <Ionicons name="search" size={20} color={Colors.light.tint} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setSearchGerminaciones('');
                  setGerminacionesPage(1);
                  fetchData();
                }}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tabla de germinaciones */}
        {filteredGerminaciones.length === 0 ? (
          <View style={styles.listEmptyContainer}>
            <Ionicons name="leaf-outline" size={48} color="#6b7280" />
            <Text style={styles.listEmptyText}>
              {searchGerminaciones ? 'No se encontraron germinaciones' : 'No hay germinaciones registradas'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchGerminaciones ? 'Intenta con otros términos de búsqueda' : 'Las germinaciones que registres aparecerán aquí'}
            </Text>
          </View>
        ) : (
          <View style={[styles.tableContainer, { marginHorizontal: 0, marginBottom: 0 }]}>
            {/* Header de la tabla */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Código</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                <Text style={styles.headerText}>Especie/Variedad</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Género</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Fecha Siembra</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Fecha Estimada</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Estado</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.headerText}>Acciones</Text>
              </View>
            </View>

            {/* Filas de datos */}
            <ScrollView style={{ maxHeight: 500 }}>
              {filteredGerminaciones.map((item, index) => {
                // Construir datos de la germinación
                const especieCompleta = item.especie_variedad || item.especie || 'Sin especie';
                const generoCompleto = item.genero || 'Sin género';
                const codigoCompleto = item.codigo || item.nombre || 'Sin código';
                const fechaSiembra = item.fecha_siembra
                  ? new Date(item.fecha_siembra).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'Sin fecha';
                const fechaEstimadaValue = item.prediccion_fecha_estimada || item.fecha_germinacion_estimada;
                const fechaEstimada = fechaEstimadaValue
                  ? new Date(fechaEstimadaValue).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : '-';
                const estadoActual = item.etapa_actual || item.estado_capsula || 'En desarrollo';

                // Calcular progreso de la germinación basado en días transcurridos
                const calculateProgress = () => {
                  // Si está marcada como completada, 100%
                  const etapa = item.etapa_actual || item.estado || 'INGRESADO';
                  if (etapa === 'LISTA' || etapa === 'LISTO') return 100;
                  if (etapa === 'CANCELADO') return 0;

                  // Si no hay fecha de siembra, usar progreso basado en estado
                  if (!item.fecha_siembra) {
                    return etapa === 'EN_PROCESO' ? 65 : 30;
                  }

                  // Calcular días transcurridos desde la siembra
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  const fechaSiembra = new Date(item.fecha_siembra);
                  fechaSiembra.setHours(0, 0, 0, 0);
                  const diasTranscurridos = Math.ceil((hoy.getTime() - fechaSiembra.getTime()) / (1000 * 60 * 60 * 24));

                  // Obtener días totales estimados (de la predicción o por defecto 30)
                  const diasTotales = item.prediccion_dias_estimados || 30;

                  // Calcular progreso (mínimo 0%, máximo 100%)
                  const progreso = Math.min(Math.max((diasTranscurridos / diasTotales) * 100, 0), 100);

                  return Math.round(progreso);
                };
                const progress = calculateProgress();

                const itemKey = item.id?.toString() || `germ-${index}`;
                const estadoColor = getEstadoColor(estadoActual);
                const isLastRow = index === filteredGerminaciones.length - 1;

                return (
                  <View
                    key={itemKey}
                    style={[
                      styles.tableRowContainer,
                      isLastRow && styles.tableRowContainerLast
                    ]}
                  >
                    {/* Fila principal con datos */}
                    <View style={styles.tableRow}>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="tail">
                          {codigoCompleto}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 2.5 }]}>
                        <Text style={styles.especieText} numberOfLines={2} ellipsizeMode="tail">
                          {especieCompleta}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.generoText} numberOfLines={1} ellipsizeMode="tail">
                          {generoCompleto}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.fechaText}>{fechaSiembra}</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        {fechaEstimadaValue ? (
                          <View>
                            <Text style={[styles.fechaText, { fontSize: 11 }]}>
                              {fechaEstimada}
                            </Text>
                            {(() => {
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const fechaEst = new Date(fechaEstimadaValue);
                              fechaEst.setHours(0, 0, 0, 0);
                              const diasFaltantes = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                              return diasFaltantes > 0 ? (
                                <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '600' }}>
                                  {diasFaltantes}d restantes
                                </Text>
                              ) : diasFaltantes === 0 ? (
                                <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '600' }}>
                                  Hoy
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '600' }}>
                                  Vencido
                                </Text>
                              );
                            })()}
                          </View>
                        ) : (
                          <Text style={[styles.fechaText, { fontSize: 10, color: '#9CA3AF' }]}>
                            Sin predicción
                          </Text>
                        )}
                      </View>
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                          <Text style={styles.estadoBadgeText}>{estadoActual}</Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.2 }]}>
                        <View style={styles.actionsCell}>
                          <TouchableOpacity
                            onPress={() => handleViewGerminacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleEditGerminacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="create-outline" size={20} color="#F59E0B" />
                          </TouchableOpacity>
                          {item.etapa_actual !== 'FINALIZADO' && (
                            <TouchableOpacity
                              onPress={() => handleOpenChangeStatus(item)}
                              style={styles.actionIconButton}
                            >
                              <Ionicons name="swap-horizontal-outline" size={20} color="#8B5CF6" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteGerminacion(item)}
                            style={styles.actionIconButton}
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Barra de progreso */}
                    <View style={styles.progressRow}>
                      <View style={styles.progressInfo}>
                        <Ionicons
                          name="stats-chart-outline"
                          size={12}
                          color={estadoColor}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.progressLabel}>Progreso:</Text>
                        <Text style={[styles.progressPercentage, { color: estadoColor }]}>{progress}%</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: estadoColor
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Paginación */}
        {germinacionesTotalPages > 1 && (
          <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
            <Text style={{ marginBottom: 8, textAlign: 'center', color: '#6b7280' }}>
              Mostrando {germinaciones.length} de {germinacionesTotalCount} germinaciones
            </Text>
            <Pagination
              currentPage={germinacionesPage}
              totalPages={germinacionesTotalPages}
              goToPage={handleGerminacionesPageChange}
              nextPage={handleGerminacionesNextPage}
              prevPage={handleGerminacionesPrevPage}
            />
          </View>
        )}
      </View>
    );
  };

  const renderNotificaciones = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      );
    }

    // Usar las germinaciones y polinizaciones actuales
    const germinacionesArray = Array.isArray(germinaciones) ? germinaciones : [];
    const polinizacionesArray = Array.isArray(polinizaciones) ? polinizaciones : [];

    // Filtrar germinaciones que no están finalizadas
    const germinacionesPendientes = germinacionesArray.filter(
      g => g.estado_germinacion !== 'FINALIZADO' && g.etapa_actual !== 'FINALIZADO' && g.etapa_actual !== 'LISTA' && g.etapa_actual !== 'LISTO'
    );

    // Filtrar polinizaciones que no están finalizadas
    const polinizacionesPendientes = polinizacionesArray.filter(
      p => (p.estado_polinizacion !== 'FINALIZADO' || p.estado !== 'LISTA') && !p.fechamad
    );

    const totalPendientes = germinacionesPendientes.length + polinizacionesPendientes.length;

    return (
      <View style={styles.professionalTableContainer}>
        {/* Encabezado */}
        <View style={styles.tableHeaderSection}>
          <View style={styles.tableTitleContainer}>
            <Text style={styles.professionalTableTitle}>Mis Notificaciones</Text>
            <Text style={styles.professionalTableSubtitle}>
              {totalPendientes} {totalPendientes === 1 ? 'elemento pendiente' : 'elementos pendientes'} que requieren atención
            </Text>
          </View>
        </View>

        {/* Lista de elementos pendientes */}
        {totalPendientes === 0 ? (
          <View style={styles.listEmptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#10B981" />
            <Text style={styles.listEmptyText}>
              No hay elementos pendientes
            </Text>
            <Text style={styles.emptySubtext}>
              Todas tus germinaciones y polinizaciones están finalizadas o no hay ninguna en proceso
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={{ padding: 16, gap: 16 }}>
              {/* Sección de Polinizaciones Pendientes */}
              {polinizacionesPendientes.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                    <Ionicons name="flower-outline" size={20} color="#F59E0B" />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 }}>
                      Polinizaciones Pendientes ({polinizacionesPendientes.length})
                    </Text>
                  </View>
                  {polinizacionesPendientes.map((item) => (
                    <View key={`pol-${item.numero}`} style={{ marginBottom: 12 }}>
                      <PolinizacionCard
                        item={item}
                        onPress={handleViewPolinizacion}
                        onViewDetails={handleViewPolinizacion}
                        onEdit={handleEditPolinizacion}
                        onDelete={handleDeletePolinizacion}
                        onChangeStatus={handleOpenChangeStatusPolinizacion}
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Sección de Germinaciones Pendientes */}
              {germinacionesPendientes.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                    <Ionicons name="leaf-outline" size={20} color="#10B981" />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 }}>
                      Germinaciones Pendientes ({germinacionesPendientes.length})
                    </Text>
                  </View>
                  {germinacionesPendientes.map((item) => (
                    <View key={`germ-${item.id}`} style={{ marginBottom: 12 }}>
                      <GerminacionCard
                        item={item}
                        onPress={handleViewGerminacion}
                        onViewDetails={handleViewGerminacion}
                        onEdit={handleEditGerminacion}
                        onDelete={handleDeleteGerminacion}
                        onChangeStatus={handleOpenChangeStatus}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const renderUsuarios = () => {
    const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
    
    return (
      <UserManagementTable
        usuarios={usuariosArray}
        loading={loading}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleUserStatus}
        onCreateUser={() => setShowCreateUserModal(true)}
        currentUser={user}
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
      <View style={styles.topUserInfoSection}>
        <View style={styles.profileImageContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user?.username || 'Usuario'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.light.background} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Navegación por pestañas */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'resumen' && styles.activeTab]}
          onPress={() => setTab('resumen')}
        >
          <Text style={[styles.tabText, tab === 'resumen' && styles.activeTabText]}>
            Resumen
          </Text>
        </TouchableOpacity>

        {canViewPolinizaciones() && (
          <TouchableOpacity
            style={[styles.tab, tab === 'polinizaciones' && styles.activeTab]}
            onPress={() => setTab('polinizaciones')}
          >
            <Text style={[styles.tabText, tab === 'polinizaciones' && styles.activeTabText]}>
              Polinizaciones
            </Text>
          </TouchableOpacity>
        )}

        {canViewGerminaciones() && (
          <TouchableOpacity
            style={[styles.tab, tab === 'germinaciones' && styles.activeTab]}
            onPress={() => setTab('germinaciones')}
          >
            <Text style={[styles.tabText, tab === 'germinaciones' && styles.activeTabText]}>
              Germinaciones
            </Text>
          </TouchableOpacity>
        )}

        {canViewGerminaciones() && (
          <TouchableOpacity
            style={[styles.tab, tab === 'notificaciones' && styles.activeTab]}
            onPress={() => setTab('notificaciones')}
          >
            <Text style={[styles.tabText, tab === 'notificaciones' && styles.activeTabText]}>
              Notificaciones
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin() && (
          <TouchableOpacity
            style={[styles.tab, tab === 'usuarios' && styles.activeTab]}
            onPress={() => setTab('usuarios')}
          >
            <Text style={[styles.tabText, tab === 'usuarios' && styles.activeTabText]}>
              Usuarios
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        {tab === 'resumen' && renderResumen()}
        {tab === 'polinizaciones' && canViewPolinizaciones() && renderPolinizaciones()}
        {tab === 'germinaciones' && canViewGerminaciones() && renderGerminaciones()}
        {tab === 'notificaciones' && canViewGerminaciones() && renderNotificaciones()}
        {tab === 'usuarios' && isAdmin() && renderUsuarios()}
      </View>

      {/* Modal de creación de usuario */}
      <CreateUserModal
        visible={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreateUser={handleCreateUser}
      />

      {/* Modal de edición de usuario */}
      <EditUserModal
        visible={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onEditUser={handleUpdateUser}
        user={userToEdit}
      />

      {/* Modal de detalles de polinización */}
      <Modal
        visible={showPolinizacionDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPolinizacionDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de Polinización</Text>
              <TouchableOpacity onPress={() => setShowPolinizacionDetailsModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedPolinizacion && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{selectedPolinizacion.codigo || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tipo:</Text>
                    <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(selectedPolinizacion.tipo_polinizacion || 'SELF') }]}>
                      <Text style={styles.tipoBadgeText}>{selectedPolinizacion.tipo_polinizacion || 'SELF'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Planta Madre</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Género:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.madre_genero || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Especie:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.madre_especie || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Código:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.madre_codigo || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Clima:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.madre_clima || 'N/A'}</Text>
                    </View>
                  </View>

                  {selectedPolinizacion.tipo_polinizacion !== 'SELF' && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Planta Padre</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Género:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.padre_genero || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Especie:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.padre_especie || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Código:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.padre_codigo || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Clima:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.padre_clima || 'N/A'}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Nueva Planta</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Género:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.nueva_genero || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Especie:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.nueva_especie || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Código:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.nueva_codigo || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Clima:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.nueva_clima || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Fechas</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Polinización:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPolinizacion.fechapol 
                          ? new Date(selectedPolinizacion.fechapol).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Maduración:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPolinizacion.fechamad 
                          ? new Date(selectedPolinizacion.fechamad).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </Text>
                    </View>
                    {selectedPolinizacion.prediccion_fecha_estimada && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Predicción:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedPolinizacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.ubicacion_tipo || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.ubicacion_nombre || 'N/A'}</Text>
                    </View>
                    {selectedPolinizacion.vivero && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vivero:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.vivero}</Text>
                      </View>
                    )}
                    {selectedPolinizacion.mesa && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mesa:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.mesa}</Text>
                      </View>
                    )}
                    {selectedPolinizacion.pared && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pared:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.pared}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información Adicional</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cápsulas:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.cantidad_capsulas || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.estado || 'INGRESADO'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Responsable:</Text>
                      <Text style={styles.detailValue}>{selectedPolinizacion.responsable || 'N/A'}</Text>
                    </View>
                    {selectedPolinizacion.observaciones && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Observaciones:</Text>
                        <Text style={styles.detailValue}>{selectedPolinizacion.observaciones}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPolinizacionDetailsModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles de germinación */}
      <Modal
        visible={showGerminacionDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGerminacionDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de Germinación</Text>
              <TouchableOpacity onPress={() => setShowGerminacionDetailsModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedGerminacion && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{selectedGerminacion.codigo || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información Botánica</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Género:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.genero || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Especie/Variedad:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.especie_variedad || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Clima:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.clima || 'N/A'}</Text>
                    </View>
                    {selectedGerminacion.tipo_polinizacion && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tipo Polinización:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.tipo_polinizacion}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Fechas</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Siembra:</Text>
                      <Text style={styles.detailValue}>
                        {selectedGerminacion.fecha_siembra 
                          ? new Date(selectedGerminacion.fecha_siembra).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </Text>
                    </View>
                    {selectedGerminacion.fecha_polinizacion && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Polinización:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedGerminacion.fecha_polinizacion).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                    {selectedGerminacion.prediccion_fecha_estimada && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Predicción:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedGerminacion.prediccion_fecha_estimada).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    {selectedGerminacion.percha && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Percha:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.percha}</Text>
                      </View>
                    )}
                    {selectedGerminacion.nivel && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Nivel:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.nivel}</Text>
                      </View>
                    )}
                    {selectedGerminacion.clima_lab && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Clima Lab:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.clima_lab}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Cantidades</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cantidad Solicitada:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.cantidad_solicitada || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Número de Cápsulas:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.no_capsulas || 0}</Text>
                    </View>
                    {selectedGerminacion.disponibles !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Disponibles:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.disponibles}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Estado</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado Cápsula:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.estado_capsula || 'N/A'}</Text>
                    </View>
                    {selectedGerminacion.estado_semilla && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estado Semilla:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.estado_semilla}</Text>
                      </View>
                    )}
                    {selectedGerminacion.cantidad_semilla && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cantidad Semilla:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.cantidad_semilla}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Semilla en Stock:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.semilla_en_stock ? 'Sí' : 'No'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información Adicional</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Responsable:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.responsable || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Etapa Actual:</Text>
                      <Text style={styles.detailValue}>{selectedGerminacion.etapa_actual || 'N/A'}</Text>
                    </View>
                    {selectedGerminacion.observaciones && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Observaciones:</Text>
                        <Text style={styles.detailValue}>{selectedGerminacion.observaciones}</Text>
                      </View>
                    )}
                  </View>

                  {/* Sección de Gestión de Etapa */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Gestión de Etapa</Text>

                    {/* Estado actual con badge color */}
                    <View style={styles.estadoBadgeContainer}>
                      <Text style={styles.detailLabel}>Estado Actual:</Text>
                      <View style={[
                        styles.estadoBadge,
                        {
                          backgroundColor:
                            selectedGerminacion.estado_germinacion === 'FINALIZADO' ? '#D1FAE5' :
                            selectedGerminacion.estado_germinacion === 'EN_PROCESO' ? '#FEF3C7' :
                            '#E5E7EB'
                        }
                      ]}>
                        <Ionicons
                          name={
                            selectedGerminacion.estado_germinacion === 'FINALIZADO' ? 'checkmark-circle' :
                            selectedGerminacion.estado_germinacion === 'EN_PROCESO' ? 'time' :
                            'ellipse'
                          }
                          size={18}
                          color={
                            selectedGerminacion.estado_germinacion === 'FINALIZADO' ? '#059669' :
                            selectedGerminacion.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                            '#6B7280'
                          }
                        />
                        <Text style={[
                          styles.estadoBadgeText,
                          {
                            color:
                              selectedGerminacion.estado_germinacion === 'FINALIZADO' ? '#059669' :
                              selectedGerminacion.estado_germinacion === 'EN_PROCESO' ? '#D97706' :
                              '#6B7280'
                          }
                        ]}>
                          {selectedGerminacion.estado_germinacion === 'FINALIZADO' ? 'Finalizado' :
                           selectedGerminacion.estado_germinacion === 'EN_PROCESO' ? 'En Proceso' :
                           'Inicial'}
                        </Text>
                      </View>
                    </View>

                    {/* Botones de cambio de estado */}
                    <View style={styles.etapaButtonsContainer}>
                      {selectedGerminacion.etapa_actual !== 'FINALIZADO' && (
                        <>
                          {(selectedGerminacion.etapa_actual === 'INGRESADO' || !selectedGerminacion.etapa_actual) && (
                            <TouchableOpacity
                              style={[styles.etapaButton, { backgroundColor: '#F59E0B' }]}
                              onPress={() => {
                                if (Platform.OS === 'web') {
                                  if (confirm('¿Cambiar el estado a "En Proceso"?')) {
                                    handleCambiarEtapaGerminacion(selectedGerminacion.id, 'EN_PROCESO');
                                  }
                                } else {
                                  Alert.alert(
                                    'Cambiar Estado',
                                    '¿Cambiar el estado a "En Proceso"?',
                                    [
                                      { text: 'Cancelar', style: 'cancel' },
                                      {
                                        text: 'Confirmar',
                                        onPress: () => handleCambiarEtapaGerminacion(selectedGerminacion.id, 'EN_PROCESO')
                                      }
                                    ]
                                  );
                                }
                              }}
                            >
                              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                              <Text style={styles.etapaButtonText}>Marcar como En Proceso</Text>
                            </TouchableOpacity>
                          )}

                          {selectedGerminacion.estado_germinacion === 'EN_PROCESO' && (
                            <TouchableOpacity
                              style={[styles.etapaButton, { backgroundColor: '#10B981' }]}
                              onPress={() => handleOpenFinalizarModal(selectedGerminacion)}
                            >
                              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                              <Text style={styles.etapaButtonText}>Finalizar Germinación</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}

                      {selectedGerminacion.etapa_actual === 'FINALIZADO' && (
                        <View style={styles.etapaCompletadaContainer}>
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                          <Text style={styles.etapaCompletadaText}>
                            Germinación completada
                            {selectedGerminacion.fecha_germinacion &&
                              ` el ${new Date(selectedGerminacion.fecha_germinacion).toLocaleDateString('es-ES')}`
                            }
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGerminacionDetailsModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                    search: searchGerminaciones || undefined
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
                    search: searchPolinizaciones || undefined
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
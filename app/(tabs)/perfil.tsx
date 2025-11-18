import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Platform, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
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
import Pagination from '@/components/filters/Pagination';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import type { Polinizacion, Germinacion, EstadisticasUsuario, UserWithProfile } from '@/types/index';

type TabType = 'resumen' | 'polinizaciones' | 'germinaciones' | 'usuarios' | 'notificaciones';

export default function PerfilScreen() {
  const { user, forceLogout } = useAuth();
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
      if (tab === 'polinizaciones' || tab === 'resumen') {
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
            // Para resumen, obtener solo el total sin paginación
            const pols = await polinizacionService.getMisPolinizaciones('');
            misPolinizaciones = Array.isArray(pols) ? pols : [];
          }
        } catch (error) {
          console.error('Error obteniendo polinizaciones:', error);
          misPolinizaciones = [];
        }
      }

      if (tab === 'germinaciones' || tab === 'resumen') {
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
            // Para resumen, obtener solo el total sin paginación
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
      if (tab === 'polinizaciones' || tab === 'resumen') {
        setPolinizaciones(misPolinizaciones);
      }
      if (tab === 'germinaciones' || tab === 'resumen') {
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
          Alert.alert('Éxito', 'Polinización eliminada correctamente');
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la polinización');
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
                Alert.alert('Éxito', 'Polinización eliminada correctamente');
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la polinización');
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

  const handleViewGerminacion = (item: Germinacion) => {
    setSelectedGerminacion(item);
    setShowGerminacionDetailsModal(true);
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
          Alert.alert('Éxito', 'Germinación eliminada correctamente');
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la germinación');
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
                Alert.alert('Éxito', 'Germinación eliminada correctamente');
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la germinación');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
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
              <View style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                <Text style={styles.headerText}>Especie</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Género</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.headerText}>Fecha</Text>
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
                const tipo = item.tipo_polinizacion || item.tipo || 'SELF';
                const itemKey = item.numero?.toString() || item.id?.toString() || `pol-${index}`;
                const tipoColor = getTipoColor(tipo);
                const estadoColor = getEstadoColor(estadoActual);
                const isLastRow = index === filteredPolinizaciones.length - 1;

                return (
                  <View
                    key={itemKey}
                    style={[
                      styles.tableRow,
                      isLastRow && styles.tableRowLast
                    ]}
                  >
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
                      <Text style={styles.fechaText}>{fechaFormateada}</Text>
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
                const estadoActual = item.etapa_actual || item.estado_capsula || 'En desarrollo';
                const itemKey = item.id?.toString() || `germ-${index}`;
                const estadoColor = getEstadoColor(estadoActual);
                const isLastRow = index === filteredGerminaciones.length - 1;

                return (
                  <View
                    key={itemKey}
                    style={[
                      styles.tableRow,
                      isLastRow && styles.tableRowLast
                    ]}
                  >
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
                        <TouchableOpacity 
                          onPress={() => handleDeleteGerminacion(item)}
                          style={styles.actionIconButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
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
    </ScrollView>
  );
}
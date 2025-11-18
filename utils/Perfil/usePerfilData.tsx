import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { polinizacionService } from '@/services/polinizacion.service';
import { germinacionService } from '@/services/germinacion.service';
import { rbacService } from '@/services/rbac.service';

export function usePerfilData() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados principales
  const [tab, setTab] = useState<string>('resumen');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de datos
  const [polinizaciones, setPolinizaciones] = useState([]);
  const [germinaciones, setGerminaciones] = useState([]);
  const [estadisticas] = useState(null);
  const [alertas] = useState([]);
  const [notificaciones] = useState([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    total_usuarios: 0,
    usuarios_activos: 0,
    usuarios_inactivos: 0,
    por_rol: {}
  });
  
  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToMetas, setUserToMetas] = useState(null);
  
  // Estados de operaciones
  const [editingUser] = useState(false);
  const [assigningMetas] = useState(false);
  const [deletingUser] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  
  // Datos de formularios
  const [editUserData, setEditUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    rol: 'TIPO_1'
  });

  const [metasData, setMetasData] = useState({
    meta_polinizaciones: 0,
    meta_germinaciones: 0,
    tasa_exito_objetivo: 0
  });
  
  const [createUserData, setCreateUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    rol: 'TIPO_1'
  });

  // Efectos
  useEffect(() => {
    if (params['tab'] && ['resumen', 'polinizaciones', 'germinaciones', 'alertas', 'notificaciones'].includes(params['tab'] as string)) {
      setTab(params['tab'] as string);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [tab, user, refreshTrigger]); // Agregar refreshTrigger para refrescar automáticamente

  useEffect(() => {
    if (refreshTrigger > 0 && tab === 'alertas') {
      generarAlertasPersonalizadas();
    }
  }, [refreshTrigger, tab]);

  // Funciones principales
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      switch (tab) {
        case 'polinizaciones':
          const misPolinizaciones = await polinizacionService.getMisPolinizaciones();
          setPolinizaciones(misPolinizaciones);
          break;
        case 'germinaciones':
          const misGerminaciones = await germinacionService.getMisGerminaciones();
          setGerminaciones(misGerminaciones);
          break;
        case 'usuarios':
          if (user.permisos?.administracion?.usuarios) {
            const [usersData, statsData] = await Promise.all([
              rbacService.getAllUsers(),
              rbacService.getUserStats()
            ]);
            setUsuarios(usersData);
            setUserStats(statsData);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Funciones para modales
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };
  
  const closeCreateUserModal = () => {
    setShowCreateUserModal(false);
    setCreateUserData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
      rol: 'TIPO_1'
    });
  };
  
  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setUserToEdit(null);
  };
  
  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
  };
  
  const closeMetasModal = () => {
    setShowMetasModal(false);
    setUserToMetas(null);
  };

  // Funciones para abrir modales
  const openCreateUserModal = () => setShowCreateUserModal(true);
  
  const openEditUserModal = (user: any) => {
    setUserToEdit(user);
    setEditUserData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      telefono: user.profile?.telefono || '',
      rol: user.profile?.rol || 'TIPO_1'
    });
    setShowEditUserModal(true);
  };
  
  const openDeleteConfirmModal = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };
  
  const openMetasModal = (user: any) => {
    setUserToMetas(user);
    setMetasData({
      meta_polinizaciones: user.profile?.meta_polinizaciones || 0,
      meta_germinaciones: user.profile?.meta_germinaciones || 0,
      tasa_exito_objetivo: user.profile?.tasa_exito_objetivo || 80
    });
    setShowMetasModal(true);
  };

  // Funciones para operaciones CRUD
  const handleDeleteUser = async () => {
    // Implementar lógica de eliminación de usuario
  };

  const handleEditUser = async () => {
    // Implementar lógica de edición de usuario
  };

  const handleAssignMetas = async () => {
    // Implementar lógica de asignación de metas
  };

  const handleCreateUser = async (userData: any) => {
    setCreatingUser(true);
    try {
      await rbacService.createUser(userData);
      setShowCreateUserModal(false);
      setCreateUserData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        rol: 'TIPO_1'
      });
      Alert.alert('Éxito', 'Usuario creado exitosamente');
      await fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'No se pudo crear el usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  // Otras funciones específicas
  const generarAlertasPersonalizadas = async () => {
    // Implementar lógica de generación de alertas
  };

  // Retornar todos los estados y funciones necesarios
  return {
    // Estados
    tab, setTab,
    loading, refreshing,
    polinizaciones, germinaciones, estadisticas,
    alertas, notificaciones,
    usuarios, userStats,
    user,
    refreshTrigger, setRefreshTrigger,
    
    // Modales
    showDetailModal, selectedItem,
    showCreateUserModal,
    showDeleteConfirmModal, userToDelete,
    showEditUserModal, userToEdit,
    showMetasModal, userToMetas,
    
    // Funciones
    fetchData, onRefresh,
    handleDeleteUser, handleEditUser, handleAssignMetas, handleCreateUser,
    openCreateUserModal, openEditUserModal, openDeleteConfirmModal, openMetasModal,
    closeDetailModal, closeCreateUserModal, closeEditUserModal,
    closeDeleteConfirmModal, closeMetasModal,
    
    // Estados de operaciones
    editingUser, assigningMetas, deletingUser, creatingUser,
    
    // Datos de formularios
    editUserData, setEditUserData,
    metasData, setMetasData,
    createUserData, setCreateUserData
  };
}
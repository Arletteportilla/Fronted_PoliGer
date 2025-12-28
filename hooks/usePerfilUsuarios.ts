import { useState, useCallback } from 'react';
import { rbacService } from '@/services/rbac.service';
import type { UserWithProfile } from '@/types/index';
import type { UserFormData as CreateUserFormData } from '@/components/UserManagement/CreateUserModal';
import type { UserFormData as EditUserFormData } from '@/components/UserManagement/EditUserModal';

export function usePerfilUsuarios() {
  const [usuarios, setUsuarios] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithProfile | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rbacService.getAllUsers();
      setUsuarios(response);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (userData: CreateUserFormData) => {
    try {
      console.log('🚀 usePerfilUsuarios.handleCreate - Iniciando creación de usuario');
      console.log('📋 Datos del usuario a crear:', userData);
      
      // Verificar token de autenticación
      const token = await import('@/services/secureStore').then(m => m.secureStore.getItem('authToken'));
      console.log('🔑 Token disponible:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      // Verificar usuario actual
      const { useAuth } = await import('@/contexts/AuthContext');
      console.log('👤 Usuario actual en contexto disponible');
      
      console.log('🌐 Llamando a rbacService.createUser...');
      const result = await rbacService.createUser(userData);
      console.log('✅ Usuario creado exitosamente:', result);
      
      await fetchUsuarios();
      setShowCreateModal(false);
      
      return result;
    } catch (error: any) {
      console.error('❌ Error al crear usuario:', error);
      console.error('📊 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('🔗 Error config URL:', error.config?.url);
      console.error('🔑 Error config headers:', error.config?.headers);
      throw error;
    }
  }, [fetchUsuarios]);

  const handleEdit = useCallback((user: UserWithProfile) => {
    setUserToEdit(user);
    setShowEditModal(true);
  }, []);

  const handleUpdate = useCallback(async (userId: number, userData: Partial<EditUserFormData>, onSuccess?: () => void) => {
    try {
      await rbacService.updateUser(userId, userData);
      await fetchUsuarios();
      setShowEditModal(false);
      setUserToEdit(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }, [fetchUsuarios]);

  const handleDelete = useCallback(async (user: UserWithProfile, onSuccess?: () => void) => {
    try {
      console.log('🗑️ Iniciando eliminación del usuario:', user.id);
      await rbacService.deleteUser(user.id);
      console.log('✅ Usuario eliminado exitosamente');
      await fetchUsuarios();
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error);
      console.error('📊 Error response:', error.response?.data);
      console.error('📊 Error status:', error.response?.status);
      throw error;
    }
  }, [fetchUsuarios]);

  const handleToggleStatus = useCallback(async (user: UserWithProfile, onSuccess?: () => void) => {
    try {
      const newStatus = !user.is_active;
      await rbacService.changeUserStatus(user.id, newStatus);
      await fetchUsuarios();
      onSuccess?.();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  }, [fetchUsuarios]);

  return {
    // Estados
    usuarios,
    loading,
    showCreateModal,
    showEditModal,
    userToEdit,

    // Setters
    setShowCreateModal,
    setShowEditModal,

    // Funciones
    fetchUsuarios,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
}

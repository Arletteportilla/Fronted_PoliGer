import { useState, useCallback } from 'react';
import { rbacService } from '@/services/rbac.service';
import type { UserWithProfile } from '@/types/index';
import type { UserFormData as CreateUserFormData } from '@/components/UserManagement/CreateUserModal';
import type { UserFormData as EditUserFormData } from '@/components/UserManagement/EditUserModal';
import { logger } from '@/services/logger';

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
      logger.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (userData: CreateUserFormData) => {
    try {
      logger.info('🚀 usePerfilUsuarios.handleCreate - Iniciando creación de usuario');
      logger.info('📋 Datos del usuario a crear:', userData);
      
      // Verificar token de autenticación
      const token = await import('@/services/secureStore').then(m => m.secureStore.getItem('authToken'));
      logger.info('🔑 Token disponible:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      // Verificar usuario actual
      const { useAuth } = await import('@/contexts/AuthContext');
      logger.info('👤 Usuario actual en contexto disponible');
      
      logger.info('🌐 Llamando a rbacService.createUser...');
      const result = await rbacService.createUser(userData);
      logger.success(' Usuario creado exitosamente:', result);
      
      await fetchUsuarios();
      setShowCreateModal(false);
      
      return result;
    } catch (error: any) {
      logger.error('❌ Error al crear usuario:', error);
      logger.error('📊 Error status:', error.response?.status);
      logger.error('📝 Error data:', error.response?.data);
      logger.error('🔗 Error config URL:', error.config?.url);
      logger.error('🔑 Error config headers:', error.config?.headers);
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
      logger.error('Error al actualizar usuario:', error);
      throw error;
    }
  }, [fetchUsuarios]);

  const handleDelete = useCallback(async (user: UserWithProfile, onSuccess?: () => void) => {
    try {
      logger.info('🗑️ Iniciando eliminación del usuario:', user.id);
      await rbacService.deleteUser(user.id);
      logger.success(' Usuario eliminado exitosamente');
      await fetchUsuarios();
      onSuccess?.();
    } catch (error: any) {
      logger.error('❌ Error al eliminar usuario:', error);
      logger.error('📊 Error response:', error.response?.data);
      logger.error('📊 Error status:', error.response?.status);
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
      logger.error('Error al cambiar estado del usuario:', error);
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

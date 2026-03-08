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
      const result = await rbacService.createUser(userData);
      
      await fetchUsuarios();
      setShowCreateModal(false);
      
      return result;
    } catch (error: any) {
      logger.error('Error al crear usuario:', { status: error.response?.status, data: error.response?.data, url: error.config?.url });
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
      await rbacService.deleteUser(user.id);
      await fetchUsuarios();
      onSuccess?.();
    } catch (error: any) {
      logger.error(' Error al eliminar usuario:', error);
      logger.error(' Error response:', error.response?.data);
      logger.error(' Error status:', error.response?.status);
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

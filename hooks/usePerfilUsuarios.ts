import { useState, useCallback } from 'react';
import { rbacService } from '@/services/rbac.service';
import type { UserWithProfile } from '@/types/index';
import type { CreateUserFormData } from '@/components/UserManagement/CreateUserModal';
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

  const handleCreate = useCallback(async (userData: CreateUserFormData, onSuccess?: () => void) => {
    try {
      await rbacService.createUser(userData);
      await fetchUsuarios();
      setShowCreateModal(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }, [fetchUsuarios]);

  const handleEdit = useCallback((user: UserWithProfile) => {
    setUserToEdit(user);
    setShowEditModal(true);
  }, []);

  const handleUpdate = useCallback(async (userId: number, userData: EditUserFormData, onSuccess?: () => void) => {
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
      await rbacService.deleteUser(user.id);
      await fetchUsuarios();
      onSuccess?.();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
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

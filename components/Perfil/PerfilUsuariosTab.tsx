import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePerfilUsuarios } from '@/hooks/usePerfilUsuarios';
import { UserManagementTable } from '@/components/UserManagement';

export function PerfilUsuariosTab() {
  const { user } = useAuth();
  const {
    usuarios,
    loading,
    handleEditUser,
    handleDeleteUser,
    handleToggleStatus,
    handleCreateUser,
    showCreateUserModal,
    setShowCreateUserModal,
    showEditUserModal,
    setShowEditUserModal,
    userToEdit,
    handleCreateUserSubmit,
    handleUpdateUserSubmit
  } = usePerfilUsuarios();

  return (
    <>
      <UserManagementTable
        usuarios={usuarios}
        loading={loading}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onCreateUser={() => setShowCreateUserModal(true)}
        currentUser={user}
      />
    </>
  );
}

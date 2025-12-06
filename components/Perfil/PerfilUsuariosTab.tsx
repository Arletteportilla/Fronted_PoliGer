import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePerfilUsuarios } from '@/hooks/usePerfilUsuarios';
import { UserManagementTable } from '@/components/UserManagement';
import { CreateUserModal } from '@/components/UserManagement/CreateUserModal';
import { EditUserModal } from '@/components/UserManagement/EditUserModal';

export function PerfilUsuariosTab() {
  const { user } = useAuth();
  const {
    usuarios,
    loading,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    userToEdit,
    fetchUsuarios,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleToggleStatus
  } = usePerfilUsuarios();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return (
    <>
      <UserManagementTable
        usuarios={usuarios}
        loading={loading}
        onEditUser={handleEdit}
        onDeleteUser={handleDelete}
        onToggleStatus={handleToggleStatus}
        onCreateUser={() => setShowCreateModal(true)}
        currentUser={user}
      />

      {/* Modal de creación de usuario */}
      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateUser={(formData) => handleCreate(formData)}
      />

      {/* Modal de edición de usuario */}
      <EditUserModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEditUser={(formData) => userToEdit && handleUpdate(userToEdit.id, formData)}
        user={userToEdit}
      />
    </>
  );
}

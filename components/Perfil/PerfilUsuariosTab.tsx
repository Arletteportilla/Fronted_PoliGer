import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePerfilUsuarios } from '@/hooks/usePerfilUsuarios';
import { UserManagementTable } from '@/components/UserManagement';
import { CreateUserModal } from '@/components/UserManagement/CreateUserModal';
import { EditUserModal } from '@/components/UserManagement/EditUserModal';
import { ChangePasswordModal } from '@/components/UserManagement/ChangePasswordModal';
import type { UserWithProfile } from '@/types';

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

  // Estado para modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<UserWithProfile | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Manejar apertura del modal de cambio de contraseña
  const handleChangePassword = (user: UserWithProfile) => {
    setUserToChangePassword(user);
    setShowPasswordModal(true);
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = async (userId: number, password: string, confirmPassword: string) => {
    try {
      const { userManagementService } = await import('@/services/user-management.service');
      await userManagementService.changePassword(userId, password, confirmPassword);
      setShowPasswordModal(false);
      setUserToChangePassword(null);
    } catch (error: any) {
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <>
      <UserManagementTable
        usuarios={usuarios}
        loading={loading}
        onEditUser={handleEdit}
        onDeleteUser={handleDelete}
        onToggleStatus={handleToggleStatus}
        onChangePassword={handleChangePassword}
        onCreateUser={() => setShowCreateModal(true)}
        onRefresh={fetchUsuarios}
        currentUser={user}
      />

      {/* Modal de creación de usuario */}
      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateUser={async (formData) => { await handleCreate(formData); }}
      />

      {/* Modal de edición de usuario */}
      <EditUserModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEditUser={async (userId, formData) => {
          await handleUpdate(userId, formData);
        }}
        user={userToEdit}
      />

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setUserToChangePassword(null);
        }}
        onChangePassword={handlePasswordChange}
        user={userToChangePassword}
      />
    </>
  );
}

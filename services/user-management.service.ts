import api from './api';

export const userManagementService = {
  /**
   * Cambiar contraseña de un usuario (solo admin)
   * @param userId ID del usuario
   * @param password Nueva contraseña
   * @param confirmPassword Confirmación de la contraseña
   */
  changePassword: async (userId: number, password: string, confirmPassword: string) => {
    const response = await api.post(`user-management/${userId}/cambiar-password/`, {
      password,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  /**
   * Subir foto de perfil del usuario
   * @param userId ID del usuario
   * @param photoUri URI de la foto (local)
   */
  uploadPhoto: async (userId: number, photoUri: string) => {
    const formData = new FormData();

    // Crear el objeto de imagen para FormData
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('foto', {
      uri: photoUri,
      name: filename,
      type,
    } as any);

    const response = await api.post(`user-management/${userId}/subir-foto/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Activar/desactivar múltiples usuarios
   * @param userIds IDs de los usuarios
   * @param status true para activar, false para desactivar
   */
  bulkToggleStatus: async (userIds: number[], status: boolean) => {
    const response = await api.post('user-management/bulk-toggle-status/', {
      user_ids: userIds,
      status,
    });
    return response.data;
  },
};

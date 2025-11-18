import api from './api';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('login/', { username, password });
    return response.data;
  },

  register: async (userData: { username: string, email: string, password: string }) => {
    const response = await api.post('register/', userData);
    return response.data;
  },

  getProtectedData: async () => {
    // Usar el endpoint /api/protected/ que devuelve el usuario autenticado
    const response = await api.get('protected/');
    // El backend devuelve { message: ..., user: {...} }
    // Extraemos solo el usuario
    return response.data.user || response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};
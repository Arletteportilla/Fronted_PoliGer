import api from './api';
import { UserProfile, UserWithProfile, UserPermissions } from '@/types';
import { logger } from '@/services/logger';

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  rol: 'TIPO_1' | 'TIPO_2' | 'TIPO_3' | 'TIPO_4';
  telefono?: string;
  departamento?: string;
  fecha_ingreso?: string;
}

export interface UpdateProfileRequest {
  rol?: 'TIPO_1' | 'TIPO_2' | 'TIPO_3' | 'TIPO_4';
  telefono?: string;
  departamento?: string;
  fecha_ingreso?: string;
  activo?: boolean;
}

class RBACService {
  // ============================================================================
  // GESTIÓN DE PERFILES
  // ============================================================================
  
  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get('user-profiles/mi_perfil/');
    return response.data;
  }
  
  async updateMyProfile(data: Partial<UpdateProfileRequest>): Promise<UserProfile> {
    // Primero obtenemos nuestro perfil actual
    const currentProfile = await this.getMyProfile();
    const response = await api.patch(`user-profiles/${currentProfile.id}/`, data);
    return response.data;
  }
  
  // ============================================================================
  // GESTIÓN DE USUARIOS (Solo Administradores)
  // ============================================================================
  
  async getAllUsers(): Promise<UserWithProfile[]> {
    try {
      logger.api(' Fetching all users from backend...');
      const response = await api.get('user-management/');
      logger.info('📊 Response received:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasResults: response.data?.results ? true : false,
        totalCount: response.data?.count || 'N/A'
      });
      
      let users: UserWithProfile[] = [];
      
      // Manejar respuesta paginada
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          // Respuesta directa como array
          users = response.data;
          logger.success(' Direct array response with', users.length, 'users');
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Respuesta paginada con results
          users = response.data.results;
          logger.success(' Paginated response with', users.length, 'users');
          logger.info('📊 Total users in database:', response.data.count || 'unknown');
          
          // Si hay más páginas, obtener todas
          if (response.data.count && response.data.count > users.length) {
            logger.info('📄 Multiple pages detected, fetching all users...');
            const allUsers = await this.getAllUsersPaginated();
            return allUsers;
          }
        } else {
          logger.warn('⚠️ Unexpected response structure:', Object.keys(response.data));
          users = [];
        }
      } else {
        logger.warn('⚠️ Invalid response data type:', typeof response.data);
        users = [];
      }
      
      logger.info('👥 Final users array:', users.length, 'users');
      return users;
      
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
  
  /**
   * Obtiene todos los usuarios manejando paginación automáticamente
   */
  private async getAllUsersPaginated(): Promise<UserWithProfile[]> {
    try {
      logger.info('📄 Fetching all users with pagination...');
      let allUsers: UserWithProfile[] = [];
      let nextUrl = 'user-management/';
      let page = 1;
      
      while (nextUrl) {
        logger.info(`📄 Fetching page ${page}...`);
        const response = await api.get(nextUrl);
        
        if (response.data?.results && Array.isArray(response.data.results)) {
          allUsers = [...allUsers, ...response.data.results];
          logger.success(` Page ${page}: ${response.data.results.length} users (total: ${allUsers.length})`);
          
          // Verificar si hay siguiente página
          // Eliminar la URL base del backend para usar solo el path relativo
          nextUrl = response.data.next ? response.data.next.replace(/^https?:\/\/[^\/]+\/api\//, '') : null;
          page++;
        } else {
          logger.warn('⚠️ Invalid page response structure');
          break;
        }
        
        // Prevenir bucle infinito
        if (page > 20) {
          logger.warn('⚠️ Too many pages, stopping pagination');
          break;
        }
      }
      
      logger.success(' All users fetched:', allUsers.length, 'total users');
      return allUsers;
      
    } catch (error) {
      console.error('❌ Error in paginated fetch:', error);
      throw error;
    }
  }
  
  async createUser(userData: CreateUserRequest): Promise<UserWithProfile> {
    try {
      logger.info('🚀 rbacService.createUser - Enviando datos:', userData);
      logger.info('🌐 URL del endpoint:', 'user-management/');
      
      const response = await api.post('user-management/', userData);
      
      logger.success(' rbacService.createUser - Respuesta exitosa:', response.data);
      logger.info('📊 Status:', response.status);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ rbacService.createUser - Error:', error);
      console.error('📊 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('🔗 Error config:', error.config);
      throw error;
    }
  }
  
  async updateUser(userId: number, userData: Partial<UserWithProfile>): Promise<UserWithProfile> {
    const response = await api.patch(`user-management/${userId}/`, userData);
    return response.data;
  }
  
  async deleteUser(userId: number): Promise<void> {
    try {
      const endpoint = `user-management/${userId}/`;
      logger.info('🌐 rbacService.deleteUser - Endpoint:', endpoint);
      logger.info('🔑 userId:', userId);
      logger.api(' Sending DELETE request...');

      const response = await api.delete(endpoint);

      logger.success(' rbacService.deleteUser - Success');
      logger.info('📊 Response status:', response.status);
      logger.info('📝 Response data:', response.data);
    } catch (error: any) {
      console.error('❌ rbacService.deleteUser - Error:', error);
      console.error('📊 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('🔗 Error URL:', error.config?.url);
      console.error('🔗 Error method:', error.config?.method);
      throw error;
    }
  }

  async changeUserStatus(userId: number, active: boolean): Promise<{
    message: string;
    usuario: string;
    activo: boolean;
  }> {
    const response = await api.post(`user-management/${userId}/cambiar_estado/`, {
      activo: active
    });
    return response.data;
  }
  
  async getUserStats(): Promise<{
    por_rol: Record<string, { nombre: string; total: number }>;
    usuarios_activos: number;
    usuarios_inactivos: number;
    total_usuarios: number;
  }> {
    const response = await api.get('user-management/estadisticas_usuarios/');
    return response.data;
  }
  
  // ============================================================================
  // UTILIDADES DE PERMISOS
  // ============================================================================
  
  /**
   * Verifica si el usuario actual tiene un permiso específico
   */
  hasPermission(permissions: UserPermissions | null, module: string, action: string): boolean {
    if (!permissions) return false;
    
    try {
      const modulePermissions = permissions[module as keyof UserPermissions];
      if (!modulePermissions) return false;
      
      return modulePermissions[action as keyof typeof modulePermissions] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
  
  /**
   * Verifica si el usuario puede ver germinaciones
   */
  canViewGerminaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'germinaciones', 'ver');
  }
  
  /**
   * Verifica si el usuario puede crear germinaciones
   */
  canCreateGerminaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'germinaciones', 'crear');
  }
  
  /**
   * Verifica si el usuario puede editar germinaciones
   */
  canEditGerminaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'germinaciones', 'editar');
  }
  
  /**
   * Verifica si el usuario puede ver polinizaciones
   */
  canViewPolinizaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'polinizaciones', 'ver');
  }
  
  /**
   * Verifica si el usuario puede crear polinizaciones
   */
  canCreatePolinizaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'polinizaciones', 'crear');
  }
  
  /**
   * Verifica si el usuario puede editar polinizaciones
   */
  canEditPolinizaciones(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'polinizaciones', 'editar');
  }
  
  /**
   * Verifica si el usuario puede ver reportes
   */
  canViewReportes(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'reportes', 'ver');
  }
  
  /**
   * Verifica si el usuario puede generar reportes
   */
  canGenerateReportes(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'reportes', 'generar');
  }
  
  /**
   * Verifica si el usuario puede exportar datos
   */
  canExportData(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'reportes', 'exportar');
  }
  
  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'administracion', 'usuarios');
  }
  
  /**
   * Verifica si el usuario puede ver estadísticas globales
   */
  canViewGlobalStats(permissions: UserPermissions | null): boolean {
    return this.hasPermission(permissions, 'administracion', 'estadisticas_globales');
  }

  /**
   * Obtiene las tabs disponibles según los permisos del usuario
   */
  getAvailableTabs(permissions: UserPermissions | null): string[] {
    const availableTabs: string[] = [];

    // Tab de inicio siempre disponible
    availableTabs.push('index');

    // Verificar permisos para cada tab
    if (this.canViewGerminaciones(permissions)) {
      availableTabs.push('germinaciones');
    }

    if (this.canViewPolinizaciones(permissions)) {
      availableTabs.push('polinizaciones');
    }

    if (this.canViewReportes(permissions)) {
      availableTabs.push('reportes');
    }

    // Tab de perfil siempre disponible
    availableTabs.push('perfil');

    return availableTabs;
  }
  
  /**
   * Obtiene el nombre descriptivo del rol
   */
  getRoleDisplayName(role: string): string {
    const roleNames = {
      'TIPO_1': 'Técnico de Laboratorio Senior',
      'TIPO_2': 'Especialista en Polinización',
      'TIPO_3': 'Especialista en Germinación',
      'TIPO_4': 'Gestor del Sistema'
    };
    
    return roleNames[role as keyof typeof roleNames] || role;
  }
  
  /**
   * Obtiene la descripción de permisos de un rol
   */
  getRolePermissionsDescription(role: string): string {
    const descriptions = {
      'TIPO_1': 'Acceso completo a germinaciones, polinizaciones, reportes y perfil',
      'TIPO_2': 'Acceso a polinizaciones y perfil únicamente',
      'TIPO_3': 'Acceso a germinaciones y perfil únicamente',
      'TIPO_4': 'Acceso total a todas las funcionalidades del sistema'
    };
    
    return descriptions[role as keyof typeof descriptions] || 'Permisos no definidos';
  }
  
  /**
   * Obtiene el color asociado a un rol (para UI)
   */
  getRoleColor(role: string): string {
    const colors = {
      'TIPO_1': '#2196F3', // Azul
      'TIPO_2': '#FF9800', // Naranja
      'TIPO_3': '#4CAF50', // Verde
      'TIPO_4': '#F44336'  // Rojo
    };
    
    return colors[role as keyof typeof colors] || '#757575';
  }
  

  /**
   * Verifica si un rol puede tener meta de polinizaciones
   */
  canHavePolinizacionesMeta(role: string): boolean {
    return ['TIPO_1', 'TIPO_2', 'TIPO_4'].includes(role);
  }

  /**
   * Verifica si un rol puede tener meta de germinaciones
   */
  canHaveGerminacionesMeta(role: string): boolean {
    return ['TIPO_1', 'TIPO_3', 'TIPO_4'].includes(role);
  }

  /**
   * Actualiza el progreso mensual de un usuario
   */
  async updateUserProgress(userId: number): Promise<any> {
    try {
      const response = await api.post(`/user-metas/${userId}/actualizar_progreso/`);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando progreso:', error);
      throw error;
    }
  }
}

export const rbacService = new RBACService();
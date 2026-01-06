import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'expo-router';
import type { UserWithProfile, UserPermissions } from '@/types/index';
import { useToast } from '@/contexts/ToastContext';

// Lazy imports to improve startup time
const getTokenManager = () => import('@/services/tokenManager').then(m => m.tokenManager);
const getAuthService = () => import('@/services/auth.service').then(m => m.authService);

const getApiService = () => import('@/services/api').then(m => m.setLoggingOut);

interface AuthContextType {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: { username: string, email: string, password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  isLoading: boolean;
  user: UserWithProfile | null;
  permissions: UserPermissions | null;
  hasPermission: (module: string, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadUserPermissions = useCallback(async () => {
    try {
      // Los permisos ya vienen incluidos en los datos del usuario desde el endpoint protected
      // No necesitamos hacer una llamada adicional
    } catch (error) {
      setPermissions(null);
    }
  }, []);

  const logout = useCallback(async () => {
    // Usar una referencia para evitar múltiples ejecuciones simultáneas
    if (isLoggingOut) {
      console.log('⚠️ Logout ya en progreso, ignorando solicitud...');
      return;
    }
    
    try {
      console.log('🔄 Iniciando proceso de logout...');
      setIsLoggingOut(true);
      
      // Limpiar estado del usuario INMEDIATAMENTE para evitar llamadas API
      console.log('🔄 Reseteando estado del usuario...');
      setToken(null);
      setUser(null);
      setPermissions(null);
      
      // Limpiar tokens de almacenamiento seguro
      try {
        const tokenManager = await getTokenManager();
        console.log('🧹 Limpiando tokens...');
        await tokenManager.clearTokens();
        console.log('✅ Tokens limpiados exitosamente');
      } catch (tokenError) {
        console.warn('⚠️ Error limpiando tokens:', tokenError);
        // Continuar aunque falle la limpieza de tokens
      }
      
      // Marcar en el servicio API que estamos en logout (después de limpiar estado)
      try {
        const setLoggingOut = await getApiService();
        setLoggingOut(true);
        console.log('✅ Flag de logout marcado en API');
      } catch (apiError) {
        console.warn('⚠️ Error marcando logout en API:', apiError);
        // Continuar aunque falle
      }
      
      console.log('🚀 Redirigiendo a login...');
      
      // Navegación inmediata sin esperar
      try {
        // Usar push en lugar de replace para asegurar navegación
        router.push('/login');
        console.log('✅ Navegación con router.push exitosa');
      } catch (routerError) {
        console.error('❌ Error con router.push, intentando replace:', routerError);
        try {
          router.replace('/login');
          console.log('✅ Navegación con router.replace exitosa');
        } catch (replaceError) {
          console.error('❌ Error con router.replace, usando fallback:', replaceError);
          // Fallback: usar window.location si está disponible (web)
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login';
            console.log('✅ Fallback web ejecutado');
          } else {
            // Fallback para React Native - intentar de nuevo
            setTimeout(() => {
              try {
                router.replace('/login');
                console.log('✅ Reintento de navegación exitoso');
              } catch (retryError) {
                console.error('❌ Error en reintento de navegación:', retryError);
              }
            }, 100);
          }
        }
      }
      
      console.log('✅ Logout completado exitosamente');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      toast.error('Error al cerrar sesión');
      
      // Limpiar estado local en caso de error
      setToken(null);
      setUser(null);
      setPermissions(null);
      
      // Fallback de navegación en caso de error
      try {
        router.replace('/login');
        console.log('✅ Navegación de fallback exitosa');
      } catch (navError) {
        console.error('❌ Error de navegación de fallback:', navError);
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
          console.log('✅ Fallback web de emergencia ejecutado');
        }
      }
    } finally {
      // Asegurar que siempre se resetee el estado de logout
      console.log('🔄 Reseteando estado de logout...');
      setIsLoggingOut(false);
      
      // Resetear el flag en el servicio API
      try {
        const setLoggingOut = await getApiService();
        setLoggingOut(false);
        console.log('✅ Flag de logout reseteado en API');
      } catch (error) {
        console.warn('Error reseteando flag de logout en API:', error);
      }
    }
  }, [router, isLoggingOut]); // Agregar isLoggingOut de vuelta pero con mejor manejo

  // Función de logout forzado (sin async, para casos de emergencia)
  const forceLogout = useCallback(() => {
    console.log('🚨 [DEBUG] Forzando logout inmediato...');
    
    // Limpiar estado inmediatamente
    console.log('[DEBUG] Limpiando estado de autenticación...');
    setToken(null);
    setUser(null);
    setPermissions(null);
    setIsLoggingOut(false);
    console.log('[DEBUG] Estado de autenticación limpiado.');
    
    // Limpiar tokens de forma síncrona si es posible
    try {
      console.log('[DEBUG] Intentando limpiar tokens de almacenamiento...');
      const { tokenManager } = require('@/services/tokenManager');
      tokenManager.clearTokens().then(() => {
        console.log('[DEBUG] Limpieza de tokens completada.');
      }).catch((error: any) => {
        console.warn('⚠️ [DEBUG] Error limpiando tokens en forceLogout:', error);
      });
    } catch (error) {
      console.warn('⚠️ [DEBUG] No se pudo limpiar tokens síncronamente:', error);
    }
    
    // Navegación inmediata con múltiples intentos
    console.log('[DEBUG] Intentando redirigir a /login...');
    try {
      router.push('/login');
      console.log('✅ [DEBUG] Force logout - router.push exitoso');
    } catch (error) {
      console.error('❌ [DEBUG] Error en forceLogout router.push:', error);
      try {
        router.replace('/login');
        console.log('✅ [DEBUG] Force logout - router.replace exitoso');
      } catch (replaceError) {
        console.error('❌ [DEBUG] Error en forceLogout router.replace:', replaceError);
        // Fallback para web
        if (typeof window !== 'undefined' && window.location) {
          console.log('[DEBUG] Usando fallback de window.location.href');
          window.location.href = '/login';
          console.log('✅ [DEBUG] Force logout - fallback web ejecutado');
        } else {
          // Fallback para React Native - reintentar
          console.log('[DEBUG] Usando fallback de reintento con setTimeout');
          setTimeout(() => {
            try {
              router.replace('/login');
              console.log('✅ [DEBUG] Force logout - reintento exitoso');
            } catch (retryError) {
              console.error('❌ [DEBUG] Error en reintento de forceLogout:', retryError);
            }
          }, 100);
        }
      }
    }
  }, [router]);

  // Función para cargar datos del usuario
  const loadUserData = useCallback(async () => {
    try {
      const authService = await getAuthService();
      const userData = await authService.getProtectedData();
      // El backend devuelve directamente el usuario, no envuelto en {user: ...}
      if (userData) {
        setUser(userData);
        setPermissions(userData.permisos || null);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const tokenManager = await getTokenManager();
        const storedToken = await tokenManager.getAccessToken();
        if (storedToken) {
          setToken(storedToken);

          const userDataLoaded = await loadUserData();
          if (!userDataLoaded) {
            // No hacer return aquí, dejar que llegue al finally
            const logoutFn = await getTokenManager();
            await logoutFn.clearTokens();
            setToken(null);
            setUser(null);
            setPermissions(null);
            // Limpiar isLoading antes de redirigir
            setIsLoading(false);
            router.replace('/login');
          } else {
            await loadUserPermissions();
          }
        } else {
          // No hay token, limpiar isLoading y redirigir a login
          setIsLoading(false);
        }
      } catch (error) {
        console.log('Error en loadToken:', error);
        try {
          const logoutFn = await getTokenManager();
          await logoutFn.clearTokens();
        } catch (clearError) {
          console.warn('Error limpiando tokens:', clearError);
        }
        setToken(null);
        setUser(null);
        setPermissions(null);
        setIsLoading(false);
        router.replace('/login');
      } finally {
        // Asegurar que siempre se limpie el estado de carga
        setIsLoading(false);
      }
    };

    loadToken();
  }, []); // Removidas las dependencias que causaban el bucle infinito

  const login = useCallback(async (username: string, password: string) => {
    try {
      const [authService, tokenManager] = await Promise.all([
        getAuthService(),
        getTokenManager()
      ]);
      const loginData = await authService.login(username, password);
      
      if (loginData.access && loginData.refresh) {
        await tokenManager.setTokens(loginData.access, loginData.refresh);
        setToken(loginData.access);
        
        const userDataLoaded = await loadUserData();
        if (!userDataLoaded) {
          throw new Error('No se pudieron cargar los datos del usuario');
        }
        
        await loadUserPermissions();
        toast.success('Sesión iniciada exitosamente');
      } else {
        throw new Error('Respuesta de login inválida');
      }
    } catch (error: any) {
      // Limpiar estado en caso de error
      setToken(null);
      setUser(null);
      setPermissions(null);

      const errorMessage = error?.response?.data?.detail ||
                          error?.message ||
                          'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadUserData, loadUserPermissions, toast]);
  
  const register = useCallback(async (userData: { username: string, email: string, password: string }) => {
    try {
      const authService = await getAuthService();
      await authService.register(userData);
      toast.success('Usuario registrado exitosamente');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
                          error?.message ||
                          'Error al registrar usuario';
      toast.error(errorMessage);
      throw error;
    }
  }, [toast]);

  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (!permissions) return false;
    
    const modulePermissions = permissions[module as keyof UserPermissions];
    if (!modulePermissions) return false;
    
    return modulePermissions[action as keyof typeof modulePermissions] === true;
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    try {
      await loadUserPermissions();
    } catch (error) {
      // Error silencioso - no afecta funcionalidad crítica
    }
  }, [loadUserPermissions]);

  const value = {
    login,
    register,
    logout,
    forceLogout,
    isLoading,
    user,
    permissions,
    hasPermission,
    refreshPermissions,
    refreshUser: loadUserData,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
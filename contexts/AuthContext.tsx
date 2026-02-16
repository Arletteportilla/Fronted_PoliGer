import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useRouter } from 'expo-router';
import type { UserWithProfile, UserPermissions } from '@/types/index';
import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/services/logger';

// Lazy imports to improve startup time
const getTokenManager = () => import('@/services/tokenManager').then(m => m.tokenManager);
const getAuthService = () => import('@/services/auth.service').then(m => m.authService);

const getApiService = () => import('@/services/api').then(m => m.setLoggingOut);
const getApiClearCache = () => import('@/services/api').then(m => m.clearTokenCache);

interface AuthContextType {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  isLoading: boolean;
  user: UserWithProfile | null;
  permissions: UserPermissions | null;
  hasPermission: (module: string, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
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
  const isLoggingOutRef = useRef(false);

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
    if (isLoggingOutRef.current) {
      return;
    }

    try {
      logger.start(' Iniciando proceso de logout...');
      isLoggingOutRef.current = true;

      // Limpiar estado del usuario INMEDIATAMENTE para evitar llamadas API
      logger.start(' Reseteando estado del usuario...');
      setToken(null);
      setUser(null);
      setPermissions(null);

      // Limpiar tokens de almacenamiento seguro
      try {
        const tokenManager = await getTokenManager();
        await tokenManager.clearTokens();
      } catch (tokenError) {
        // Continuar aunque falle la limpieza de tokens
      }

      // Limpiar cache de tokens y headers del API
      try {
        const clearCache = await getApiClearCache();
        clearCache();
      } catch (cacheError) {
        // Continuar aunque falle
      }

      // Marcar en el servicio API que estamos en logout
      try {
        const setLoggingOut = await getApiService();
        setLoggingOut(true);
      } catch (apiError) {
        // Continuar aunque falle
      }


      // Navegación inmediata sin esperar
      try {
        // Usar push en lugar de replace para asegurar navegación
        router.push('/login');
      } catch (routerError) {
        console.error('❌ Error con router.push, intentando replace:', routerError);
        try {
          router.replace('/login');
        } catch (replaceError) {
          console.error('❌ Error con router.replace, usando fallback:', replaceError);
          // Fallback: usar window.location si está disponible (web)
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login';
          } else {
            // Fallback para React Native - intentar de nuevo
            setTimeout(() => {
              try {
                router.replace('/login');
              } catch (retryError) {
                console.error('❌ Error en reintento de navegación:', retryError);
              }
            }, 100);
          }
        }
      }

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
      } catch (navError) {
        console.error('❌ Error de navegación de fallback:', navError);
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
        }
      }
    } finally {
      // Asegurar que siempre se resetee el estado de logout
      logger.start(' Reseteando estado de logout...');
      isLoggingOutRef.current = false;

      // Resetear el flag en el servicio API
      try {
        const setLoggingOut = await getApiService();
        setLoggingOut(false);
      } catch (error) {
      }
    }
  }, [router, toast]);

  // Función de logout forzado (sin async, para casos de emergencia)
  const forceLogout = useCallback(() => {

    // Limpiar estado inmediatamente
    setToken(null);
    setUser(null);
    setPermissions(null);
    isLoggingOutRef.current = false;

    // Limpiar tokens de forma síncrona si es posible
    try {
      const { tokenManager } = require('@/services/tokenManager');
      tokenManager.clearTokens().then(() => {
      }).catch((error: any) => {
      });
    } catch (error) {
    }

    // Navegación inmediata con múltiples intentos
    try {
      router.push('/login');
    } catch (error) {
      console.error('❌ [DEBUG] Error en forceLogout router.push:', error);
      try {
        router.replace('/login');
      } catch (replaceError) {
        console.error('❌ [DEBUG] Error en forceLogout router.replace:', replaceError);
        // Fallback para web
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
        } else {
          // Fallback para React Native - reintentar
          setTimeout(() => {
            try {
              router.replace('/login');
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
          // Verificar si el token esta expirado antes de usarlo
          const isExpired = await tokenManager.isTokenExpired();
          let activeToken = storedToken;

          if (isExpired) {
            logger.info('Token expirado, intentando refrescar...');
            try {
              const newToken = await tokenManager.refreshAccessToken();
              activeToken = newToken;
            } catch (refreshError) {
              // Refresh fallo - limpiar todo y redirigir a login
              logger.info('Refresh token expirado, redirigiendo a login');
              await tokenManager.clearTokens();
              const clearCache = await getApiClearCache();
              clearCache();
              setToken(null);
              setUser(null);
              setPermissions(null);
              setIsLoading(false);
              router.replace('/login');
              return;
            }
          }

          setToken(activeToken);

          const userDataLoaded = await loadUserData();
          if (!userDataLoaded) {
            await tokenManager.clearTokens();
            const clearCache = await getApiClearCache();
            clearCache();
            setToken(null);
            setUser(null);
            setPermissions(null);
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
        try {
          const tokenManager = await getTokenManager();
          await tokenManager.clearTokens();
          const clearCache = await getApiClearCache();
          clearCache();
        } catch (clearError) {
        }
        setToken(null);
        setUser(null);
        setPermissions(null);
        setIsLoading(false);
        router.replace('/login');
      } finally {
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
      // Limpiar estado Y storage en caso de error
      setToken(null);
      setUser(null);
      setPermissions(null);

      // Limpiar tokens de SecureStore para evitar estado inconsistente
      try {
        const tokenManager = await getTokenManager();
        await tokenManager.clearTokens();
        const clearCache = await getApiClearCache();
        clearCache();
      } catch (cleanupError) {
        // Continuar aunque falle la limpieza
      }

      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadUserData, loadUserPermissions, toast]);

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
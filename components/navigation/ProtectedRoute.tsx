import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/services/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
  requiredAction?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  fallbackMessage?: string;
  showFallback?: boolean;
}

interface ProtectedButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  requiredModule?: string;
  requiredAction?: string;
  requiredPermission?: string;
  style?: any;
  disabled?: boolean;
  showFallback?: boolean;
}

/**
 * Componente que protege rutas basándose en permisos del usuario
 */
export function ProtectedRoute({ 
  children, 
  requiredModule,
  requiredAction,
  requiredPermission, 
  fallback,
  fallbackMessage = 'No tienes permisos para acceder a este contenido',
  showFallback = true
}: ProtectedRouteProps) {
  const { hasPermission } = usePermissions();
  
  // Intentar obtener el usuario de forma segura
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // Si no hay contexto de autenticación, continuar sin verificación de administrador
    logger.warn('AuthContext not available:', error);
  }
  
  // Si el usuario es administrador tipo_4, permitir acceso sin verificar permisos específicos
  if (user?.profile?.rol === 'TIPO_4') {
    return <>{children}</>;
  }
  
  // Si no se especifican permisos requeridos, mostrar contenido
  if (!requiredModule && !requiredAction && !requiredPermission) {
    return <>{children}</>;
  }
  
  // Si el usuario está autenticado pero no tiene permisos configurados, permitir acceso
  // Esto es útil para desarrollo y cuando los permisos no están configurados en el backend
  if (user && !requiredModule && !requiredAction && !requiredPermission) {
    logger.warn('⚠️ Usuario autenticado sin permisos configurados, permitiendo acceso');
    return <>{children}</>;
  }
  
  // Verificar permisos
  const hasAccess = hasPermission(requiredModule || '', requiredAction || '');
  
  if (!hasAccess && showFallback) {
    return fallback || <AccessDenied message={fallbackMessage} />;
  }
  
  if (!hasAccess && !showFallback) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * Componente que protege botones basándose en permisos del usuario
 */
export function ProtectedButton({ 
  title,
  children,
  onPress, 
  requiredModule,
  requiredAction,
  requiredPermission, 
  style, 
  disabled = false,
  showFallback = false
}: ProtectedButtonProps) {
  const { hasPermission } = usePermissions();
  
  // Intentar obtener el usuario de forma segura
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // Si no hay contexto de autenticación, continuar sin verificación de administrador
    logger.warn('AuthContext not available:', error);
  }
  
  // Si el usuario es administrador tipo_4, permitir acceso sin verificar permisos específicos
  if (user?.rol === 'TIPO_4') {
    return (
      <TouchableOpacity
        style={[style, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {children || (
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
  
  // Si no se especifican permisos requeridos, mostrar botón
  if (!requiredModule && !requiredAction && !requiredPermission) {
    return (
      <TouchableOpacity
        style={[style, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {children || (
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
  
  // Verificar permisos
  const hasAccess = hasPermission(requiredModule || '', requiredAction || '');
  
  if (!hasAccess && showFallback) {
    return (
      <View style={[style, styles.disabledButton]}>
        <Ionicons name="lock-closed" size={20} color="#999" />
        <Text style={styles.disabledButtonText}>
          {title || 'Sin permisos'}
        </Text>
      </View>
    );
  }
  
  if (!hasAccess && !showFallback) {
    return null;
  }
  
  return (
    <TouchableOpacity
      style={[style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {children || (
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Componente que muestra un mensaje de acceso denegado
 */
function AccessDenied({ message }: { message: string }) {
  return (
    <View style={styles.accessDeniedContainer}>
      <Ionicons name="shield-checkmark-outline" size={64} color="#ff6b6b" />
      <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
      <Text style={styles.accessDeniedMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#6B7280',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    opacity: 0.6,
  },
  disabledButtonText: {
    marginLeft: 8,
    color: '#999',
    fontSize: 16,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rbacService } from '@/services/rbac.service';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionBasedTabsProps {
  children: React.ReactNode;
}

export function PermissionBasedTabs({ children }: PermissionBasedTabsProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
      </View>
    );
  }

  // Verificar permisos básicos
  const canViewDashboard = rbacService.canViewDashboard(user.role);
  const canViewPredicciones = rbacService.canViewPredicciones(user.role);
  const canViewPerfil = rbacService.canViewPerfil(user.role);

  if (!canViewDashboard && !canViewPredicciones && !canViewPerfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tienes permisos para acceder a esta sección</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});

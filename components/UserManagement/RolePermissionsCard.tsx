import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface RolePermissions {
  germinaciones: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  polinizaciones: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  reportes: { ver: boolean; exportar: boolean };
  usuarios: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
}

interface RoleInfo {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  permissions: RolePermissions;
}

export const ROLES: RoleInfo[] = [
  {
    code: 'TIPO_4',
    name: 'Gestor del Sistema',
    description: 'Acceso completo al sistema',
    color: '#dc2626',
    icon: 'shield-checkmark',
    permissions: {
      germinaciones: { ver: true, crear: true, editar: true, eliminar: true },
      polinizaciones: { ver: true, crear: true, editar: true, eliminar: true },
      reportes: { ver: true, exportar: true },
      usuarios: { ver: true, crear: true, editar: true, eliminar: true }
    }
  },
  {
    code: 'TIPO_1',
    name: 'Técnico de Laboratorio Senior',
    description: 'Gestión completa de procesos',
    color: '#2563eb',
    icon: 'person',
    permissions: {
      germinaciones: { ver: true, crear: true, editar: true, eliminar: false },
      polinizaciones: { ver: true, crear: true, editar: true, eliminar: false },
      reportes: { ver: true, exportar: true },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false }
    }
  },
  {
    code: 'TIPO_2',
    name: 'Especialista en Polinización',
    description: 'Solo gestión de polinizaciones',
    color: '#ea580c',
    icon: 'flower',
    permissions: {
      germinaciones: { ver: true, crear: false, editar: false, eliminar: false },
      polinizaciones: { ver: true, crear: true, editar: true, eliminar: false },
      reportes: { ver: true, exportar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false }
    }
  },
  {
    code: 'TIPO_3',
    name: 'Especialista en Germinación',
    description: 'Solo gestión de germinaciones',
    color: '#16a34a',
    icon: 'leaf',
    permissions: {
      germinaciones: { ver: true, crear: true, editar: true, eliminar: false },
      polinizaciones: { ver: true, crear: false, editar: false, eliminar: false },
      reportes: { ver: true, exportar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false }
    }
  }
];

interface RolePermissionsCardProps {
  role: string;
  compact?: boolean;
}

export const RolePermissionsCard: React.FC<RolePermissionsCardProps> = ({ role, compact = false }) => {
  const roleInfo = ROLES.find(r => r.code === role);

  if (!roleInfo) {
    return null;
  }

  const renderPermissionItem = (module: string, perms: any) => {
    const actions = Object.entries(perms).filter(([_, allowed]) => allowed);

    if (actions.length === 0) {
      return null;
    }

    return (
      <View key={module} style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Ionicons
            name={module === 'germinaciones' ? 'leaf' :
                 module === 'polinizaciones' ? 'flower' :
                 module === 'reportes' ? 'document-text' : 'people'}
            size={16}
            color={roleInfo.color}
          />
          <Text style={styles.permissionModule}>{module}</Text>
        </View>
        <View style={styles.permissionActions}>
          {actions.map(([action]) => (
            <View key={action} style={[styles.actionBadge, { borderColor: roleInfo.color }]}>
              <Text style={[styles.actionText, { color: roleInfo.color }]}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (compact) {
    return (
      <View style={[styles.compactCard, { borderLeftColor: roleInfo.color }]}>
        <Ionicons name={roleInfo.icon} size={20} color={roleInfo.color} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>{roleInfo.name}</Text>
          <Text style={styles.compactDescription}>{roleInfo.description}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderLeftColor: roleInfo.color }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${roleInfo.color}15` }]}>
          <Ionicons name={roleInfo.icon} size={24} color={roleInfo.color} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.roleName}>{roleInfo.name}</Text>
          <Text style={styles.roleDescription}>{roleInfo.description}</Text>
        </View>
      </View>

      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionsTitle}>Permisos del rol:</Text>
        {Object.entries(roleInfo.permissions).map(([module, perms]) =>
          renderPermissionItem(module, perms)
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionsContainer: {
    gap: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  permissionItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  permissionModule: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  permissionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

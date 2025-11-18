import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RolePermissionsBadgeProps {
  role: string;
  size?: 'small' | 'medium' | 'large';
}

export function RolePermissionsBadge({ role, size = 'medium' }: RolePermissionsBadgeProps) {
  const getRoleInfo = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return {
          label: 'Administrador',
          color: '#DC2626',
          icon: 'shield-checkmark' as const,
          description: 'Acceso completo al sistema',
        };
      case 'investigador':
        return {
          label: 'Investigador',
          color: '#2563EB',
          icon: 'flask' as const,
          description: 'Acceso a investigación y análisis',
        };
      case 'tecnico':
        return {
          label: 'Técnico',
          color: '#059669',
          icon: 'construct' as const,
          description: 'Acceso a operaciones técnicas',
        };
      case 'usuario':
        return {
          label: 'Usuario',
          color: '#6B7280',
          icon: 'person' as const,
          description: 'Acceso básico al sistema',
        };
      default:
        return {
          label: 'Usuario',
          color: '#6B7280',
          icon: 'person' as const,
          description: 'Acceso básico al sistema',
        };
    }
  };

  const roleInfo = getRoleInfo(role);
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <View style={[styles.iconContainer, { backgroundColor: roleInfo.color }]}>
        <Ionicons name={roleInfo.icon} size={sizeStyles.iconSize} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, sizeStyles.label]}>{roleInfo.label}</Text>
        <Text style={[styles.description, sizeStyles.description]}>{roleInfo.description}</Text>
      </View>
    </View>
  );
}

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: { padding: 8 },
        iconSize: 16,
        label: { fontSize: 12 },
        description: { fontSize: 10 },
      };
    case 'large':
      return {
        container: { padding: 16 },
        iconSize: 24,
        label: { fontSize: 18 },
        description: { fontSize: 14 },
      };
    default: // medium
      return {
        container: { padding: 12 },
        iconSize: 20,
        label: { fontSize: 14 },
        description: { fontSize: 12 },
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  description: {
    color: '#6B7280',
    lineHeight: 16,
  },
});
export default RolePermissionsBadge;
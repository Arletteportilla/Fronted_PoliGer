// Reusable status badge component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'small';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
}) => {
  const getStatusColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'LISTO':
      case 'COMPLETADO':
        return '#28a745';
      case 'EN_PROCESO':
      case 'EN PROCESO':
        return '#ffc107';
      case 'INGRESADO':
        return '#17a2b8';
      case 'PENDIENTE':
        return '#6c757d';
      case 'VENCIDO':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const backgroundColor = getStatusColor(status);
  const isSmall = variant === 'small';

  return (
    <View style={[
      styles.badge,
      { backgroundColor },
      isSmall && styles.smallBadge,
    ]}>
      <Text style={[
        styles.text,
        isSmall && styles.smallText,
      ]}>
        {status || 'N/A'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 10,
  },
});
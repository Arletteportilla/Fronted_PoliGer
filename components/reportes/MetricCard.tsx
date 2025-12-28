import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  const getIconColor = () => {
    if (icon === 'flower-outline') return themeColors.module.polinizacion.primary;
    if (icon === 'leaf-outline') return themeColors.module.germinacion.primary;
    if (icon === 'grid-outline') return themeColors.primary.main;
    if (icon === 'alert-circle-outline') return themeColors.status.error;
    return themeColors.module.germinacion.primary;
  };

  const getIconBg = () => {
    if (icon === 'flower-outline') return themeColors.module.polinizacion.light;
    if (icon === 'leaf-outline') return themeColors.module.germinacion.light;
    if (icon === 'grid-outline') return themeColors.status.warningLight;
    if (icon === 'alert-circle-outline') return themeColors.status.errorLight;
    return themeColors.module.germinacion.light;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return themeColors.status.success;
    if (changeType === 'negative') return themeColors.status.error;
    return themeColors.text.tertiary;
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'trending-up';
    if (changeType === 'negative') return 'trending-down';
    return 'remove';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBg() }]}>
          <Ionicons name={icon as any} size={24} color={getIconColor()} />
        </View>
        {change && (
          <View style={[styles.changeContainer, { backgroundColor: `${getChangeColor()}20` }]}>
            <Ionicons name={getChangeIcon() as any} size={14} color={getChangeColor()} />
            <Text style={[styles.changeText, { color: getChangeColor() }]}>{change}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    minWidth: 200,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
});

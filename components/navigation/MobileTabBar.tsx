import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/contexts/ThemeContext';

interface MobileTabBarProps {
  currentTab?: string | undefined;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentTab }) => {
  const router = useRouter();
  const { canViewGerminaciones, canViewPolinizaciones, canViewReportes, isAdmin } = usePermissions();
  const { colors: themeColors } = useTheme();

  const allTabs = [
    { id: 'inicio', label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/(tabs)' as const, alwaysVisible: true },
    { id: 'polinizaciones', label: 'Polinizaciones', icon: 'flower-outline', activeIcon: 'flower', route: '/(tabs)/polinizaciones' as const, requiresPermission: 'polinizaciones' },
    { id: 'germinaciones', label: 'Germinaciones', icon: 'leaf-outline', activeIcon: 'leaf', route: '/(tabs)/germinaciones' as const, requiresPermission: 'germinaciones' },
    { id: 'reportes', label: 'Reportes', icon: 'bar-chart-outline', activeIcon: 'bar-chart', route: '/(tabs)/reportes' as const, requiresPermission: 'reportes' },
    { id: 'perfil', label: 'Perfil', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/perfil' as const, alwaysVisible: true },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.alwaysVisible) return true;
    switch (tab.requiresPermission) {
      case 'germinaciones': return canViewGerminaciones();
      case 'polinizaciones': return canViewPolinizaciones();
      case 'reportes': return canViewReportes();
      case 'admin': return isAdmin();
      default: return true;
    }
  });

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? themeColors.accent.primary : themeColors.text.tertiary}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.primary.light,
  },
  label: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accent.primary,
    fontWeight: '700',
  },
});

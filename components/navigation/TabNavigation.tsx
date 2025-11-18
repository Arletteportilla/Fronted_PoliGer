import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '@/hooks/usePermissions';

interface TabNavigationProps {
  currentTab?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab }) => {
  const router = useRouter();
  const { canViewGerminaciones, canViewPolinizaciones, canViewReportes, isAdmin } = usePermissions();

  const allTabs = [
    { id: 'inicio', label: 'Dashboard', icon: 'grid-outline', route: '/(tabs)', alwaysVisible: true },
    { id: 'germinaciones', label: 'Germinaciones', icon: 'leaf-outline', route: '/(tabs)/germinaciones', requiresPermission: 'germinaciones' },
    { id: 'polinizaciones', label: 'Polinizaciones', icon: 'flower-outline', route: '/(tabs)/polinizaciones', requiresPermission: 'polinizaciones' },
    { id: 'notificaciones', label: 'Notificaciones', icon: 'notifications-outline', route: '/(tabs)/notificaciones', alwaysVisible: true },
    { id: 'reportes', label: 'Reportes', icon: 'bar-chart-outline', route: '/(tabs)/reportes', requiresPermission: 'reportes' },
    { id: 'perfil', label: 'Perfil', icon: 'person-outline', route: '/(tabs)/perfil', alwaysVisible: true },
  ];

  // Filtrar tabs según permisos
  const tabs = allTabs.filter(tab => {
    if (tab.alwaysVisible) return true;

    switch (tab.requiresPermission) {
      case 'germinaciones':
        return canViewGerminaciones();
      case 'polinizaciones':
        return canViewPolinizaciones();
      case 'reportes':
        return canViewReportes();
      case 'admin':
        return isAdmin();
      default:
        return true;
    }
  });

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              currentTab === tab.id && styles.activeTab
            ]}
            onPress={() => handleTabPress(tab.route)}
          >
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={currentTab === tab.id ? '#ffffff' : '#6b7280'}
              />
            </View>
            <Text style={[
              styles.tabText,
              currentTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#182d49',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#e9ad14',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});

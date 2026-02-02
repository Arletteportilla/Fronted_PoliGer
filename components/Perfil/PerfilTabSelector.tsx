import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';

// Eliminado constantes estáticas

export type TabType = 'resumen' | 'polinizaciones' | 'germinaciones' | 'usuarios' | 'notificaciones';

export interface PerfilTabSelectorProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  canViewPolinizaciones: boolean;
  canViewGerminaciones: boolean;
  isAdmin: boolean;
}

export function PerfilTabSelector({
  currentTab,
  onTabChange,
  canViewPolinizaciones,
  canViewGerminaciones,
  isAdmin
}: PerfilTabSelectorProps) {
  const { colors: themeColors } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isVerySmallScreen = width < 400;
  const styles = createResponsiveStyles(themeColors, isSmallScreen, isVerySmallScreen);

  const tabs = [
    { key: 'resumen', label: isVerySmallScreen ? 'Inicio' : 'Resumen', show: true },
    { key: 'polinizaciones', label: isVerySmallScreen ? 'Polin.' : 'Polinizaciones', show: canViewPolinizaciones },
    { key: 'germinaciones', label: isVerySmallScreen ? 'Germ.' : 'Germinaciones', show: canViewGerminaciones },
    { key: 'notificaciones', label: isVerySmallScreen ? 'Notif.' : 'Notificaciones', show: canViewGerminaciones },
    { key: 'usuarios', label: 'Usuarios', show: isAdmin }
  ].filter(tab => tab.show);

  return (
    <View style={styles.tabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContainer}
        style={styles.tabsScrollView}
      >
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                currentTab === tab.key && styles.activeTab
              ]}
              onPress={() => onTabChange(tab.key as TabType)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  currentTab === tab.key && styles.activeTabText
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createResponsiveStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>, isSmallScreen: boolean, isVerySmallScreen: boolean) => ({
  tabsWrapper: {
    marginBottom: isSmallScreen ? 16 : 24,
    paddingHorizontal: isSmallScreen ? 8 : 16,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsScrollContainer: {
    paddingHorizontal: isSmallScreen ? 4 : 8,
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    gap: isVerySmallScreen ? 4 : isSmallScreen ? 6 : 8,
    alignItems: 'center' as const,
    justifyContent: (isSmallScreen ? 'flex-start' : 'center') as 'flex-start' | 'center',
    minHeight: isSmallScreen ? 40 : 50,
  },
  tab: {
    backgroundColor: colors.background.primary,
    paddingVertical: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12,
    paddingHorizontal: isVerySmallScreen ? 8 : isSmallScreen ? 12 : 16,
    borderRadius: isSmallScreen ? 20 : 25,
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: isVerySmallScreen ? 60 : isSmallScreen ? 70 : 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary.main,
    borderColor: colors.accent.primary,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  tabText: {
    color: colors.text.primary,
    fontWeight: '600' as const,
    fontSize: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 13,
    textAlign: 'center' as const,
    lineHeight: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
  },
  activeTabText: {
    color: colors.background.primary,
    fontWeight: '700' as const,
  },
});

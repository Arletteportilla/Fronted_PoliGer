import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';

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
  const styles = createStyles(themeColors);
  
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'resumen' && styles.activeTab]}
        onPress={() => onTabChange('resumen')}
      >
        <Text style={[styles.tabText, currentTab === 'resumen' && styles.activeTabText]}>
          Resumen
        </Text>
      </TouchableOpacity>

      {canViewPolinizaciones && (
        <TouchableOpacity
          style={[styles.tab, currentTab === 'polinizaciones' && styles.activeTab]}
          onPress={() => onTabChange('polinizaciones')}
        >
          <Text style={[styles.tabText, currentTab === 'polinizaciones' && styles.activeTabText]}>
            Polinizaciones
          </Text>
        </TouchableOpacity>
      )}

      {canViewGerminaciones && (
        <TouchableOpacity
          style={[styles.tab, currentTab === 'germinaciones' && styles.activeTab]}
          onPress={() => onTabChange('germinaciones')}
        >
          <Text style={[styles.tabText, currentTab === 'germinaciones' && styles.activeTabText]}>
            Germinaciones
          </Text>
        </TouchableOpacity>
      )}

      {canViewGerminaciones && (
        <TouchableOpacity
          style={[styles.tab, currentTab === 'notificaciones' && styles.activeTab]}
          onPress={() => onTabChange('notificaciones')}
        >
          <Text style={[styles.tabText, currentTab === 'notificaciones' && styles.activeTabText]}>
            Notificaciones
          </Text>
        </TouchableOpacity>
      )}

      {isAdmin && (
        <TouchableOpacity
          style={[styles.tab, currentTab === 'usuarios' && styles.activeTab]}
          onPress={() => onTabChange('usuarios')}
        >
          <Text style={[styles.tabText, currentTab === 'usuarios' && styles.activeTabText]}>
            Usuarios
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

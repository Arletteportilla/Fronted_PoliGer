import React from 'react';
import { StyleSheet } from 'react-native';
import { NotificationsScreen } from '@/components/alerts/NotificationsScreen';
import { ResponsiveLayout } from '@/components/layout';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotificacionesScreenWrapper() {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  return (
    <ResponsiveLayout currentTab="notificaciones" style={styles.container}>
      <NotificationsScreen />
    </ResponsiveLayout>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
  },
});

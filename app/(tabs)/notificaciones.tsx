import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NotificationsScreen } from '@/components/alerts/NotificationsScreen';
import { TabNavigation } from '@/components/navigation';

export default function NotificacionesScreenWrapper() {
  return (
    <View style={styles.container}>
      <TabNavigation currentTab="notificaciones" />
      <NotificationsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

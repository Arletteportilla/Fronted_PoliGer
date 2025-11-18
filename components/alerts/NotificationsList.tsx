import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from './NotificationItem';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsListProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  style?: any;
}

export function NotificationsList({ 
  notifications, 
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead,
  style 
}: NotificationsListProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationItem
      id={item.id}
      title={item.title}
      message={item.message}
      timestamp={item.timestamp}
      isRead={item.isRead}
      type={item.type}
      onPress={() => onNotificationPress?.(item)}
      onMarkAsRead={() => onMarkAsRead?.(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
      <Text style={styles.emptyMessage}>
        Cuando recibas notificaciones, aparecerán aquí.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        {unreadCount > 0 && onMarkAllAsRead && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={onMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

import { notificationStyles as styles } from '@/utils/Notificaciones/styles';
import { Notification } from '@/types';
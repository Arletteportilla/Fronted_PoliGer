import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  onMarkAsRead?: () => void;
}

export function NotificationItem({ 
  id,
  title, 
  message, 
  timestamp,
  isRead = false,
  type = 'info',
  onPress,
  onMarkAsRead
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#0a7ea4';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isRead && styles.unreadContainer
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getIcon()} 
          size={20} 
          color={getColor()} 
        />
        {!isRead && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            !isRead && styles.unreadTitle
          ]}>
            {title}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(timestamp)}
          </Text>
        </View>
        
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      
      {!isRead && onMarkAsRead && (
        <TouchableOpacity
          style={styles.markAsReadButton}
          onPress={onMarkAsRead}
        >
          <Ionicons name="checkmark" size={16} color="#6B7280" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

import { notificationStyles as styles } from '@/utils/Notificaciones/styles';
export default NotificationItem;
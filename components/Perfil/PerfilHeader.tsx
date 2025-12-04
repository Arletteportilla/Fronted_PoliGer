import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';

export interface PerfilHeaderProps {
  user: {
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export function PerfilHeader({ user, onLogout }: PerfilHeaderProps) {
  return (
    <View style={styles.topUserInfoSection}>
      <View style={styles.profileImageContainer}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.username || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.light.background} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

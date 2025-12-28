import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificaciones } from '@/hooks/useNotificaciones';

export function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme, colors: themeColors } = useTheme();
  
  // Obtener notificaciones no leídas
  const { notifications } = useNotificaciones({ leida: false });
  const unreadCount = notifications?.length || 0;

  const handleNotificationsPress = () => {
    router.push('/(tabs)/notificaciones');
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/perfil');
  };

  const styles = createStyles(themeColors, theme);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/Ecuagenera.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right side icons */}
      <View style={styles.iconsContainer}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={theme === 'dark' ? 'moon' : 'moon-outline'}
            size={24}
            color={theme === 'dark' ? '#fbbf24' : themeColors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationsPress}
          activeOpacity={0.7}
        >
          <View style={styles.notificationContainer}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={themeColors.text.tertiary}
            />
            {unreadCount > 0 && (
              <View style={[
                styles.badge,
                { borderColor: themeColors.background.primary }
              ]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={themeColors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof import('@/utils/colors').getColors>,
  theme: 'light' | 'dark'
) => StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10000,
    position: 'relative',
    width: '100%',
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 40,
    width: 150,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});


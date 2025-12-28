import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { CONFIG } from '@/services/config';

export interface PerfilHeaderProps {
  user: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    profile?: {
      foto?: string | null;
    };
  } | null;
  onLogout: () => void;
  onPhotoUpdated?: () => void;
}

export function PerfilHeader({ user, onLogout, onPhotoUpdated }: PerfilHeaderProps) {
  const { colors: themeColors } = useTheme();
  const headerStyles = createHeaderStyles(themeColors);

  const photoUrl = user?.profile?.foto
    ? (user.profile.foto.startsWith('http')
        ? user.profile.foto
        : `${CONFIG.API_BASE_URL.replace('/api', '')}${user.profile.foto}`)
    : null;

  return (
    <View style={headerStyles.profileCard}>
      {/* Banner azul oscuro */}
      <View style={headerStyles.profileBanner} />
      
      {/* Contenido principal */}
      <View style={headerStyles.profileContent}>
        {/* Foto de perfil superpuesta */}
        <View style={headerStyles.profileImageWrapper}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={[headerStyles.userAvatar, localStyles.avatarImage]}
            />
          ) : (
            <View style={headerStyles.userAvatar}>
              <Text style={headerStyles.userAvatarText}>
                {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* Información del usuario */}
        <View style={headerStyles.userInfoSection}>
          <View style={headerStyles.userInfoContainer}>
            <Text style={headerStyles.userName}>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || 'Usuario'}
            </Text>
            <View style={headerStyles.emailContainer}>
              <Ionicons name="mail-outline" size={16} color={themeColors.text.tertiary} />
              <Text style={headerStyles.userEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
            </View>
          </View>
          
          {/* Botón de Cerrar Sesión */}
          <TouchableOpacity style={headerStyles.configButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={themeColors.text.primary} />
            <Text style={headerStyles.configButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createHeaderStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  profileCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  profileBanner: {
    height: 120,
    backgroundColor: colors.accent.primary,
    width: '100%',
  },
  profileContent: {
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },
  profileImageWrapper: {
    position: 'absolute',
    top: -60,
    left: 24,
    zIndex: 10,
  },
  userAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background.primary,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  userAvatarText: {
    color: colors.text.inverse,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 1,
  },
  userInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    fontSize: 15,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

const localStyles = StyleSheet.create({
  avatarImage: {
    borderRadius: 60,
  },
});

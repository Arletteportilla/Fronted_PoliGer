import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { UserWithProfile } from '@/types/index';

// Componente Tooltip simple para web
const TooltipWrapper: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View
      style={{ position: 'relative', alignItems: 'center' }}
      // @ts-ignore - onMouseEnter/onMouseLeave existen en React Native Web
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <View
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: 4,
            backgroundColor: '#1f2937',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            zIndex: 9999,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
            {text}
          </Text>
        </View>
      )}
    </View>
  );
};

interface UserManagementTableProps {
  usuarios: UserWithProfile[];
  loading: boolean;
  onEditUser: (user: UserWithProfile) => void;
  onDeleteUser: (user: UserWithProfile) => void;
  onToggleStatus?: (user: UserWithProfile) => void;
  onChangePassword?: (user: UserWithProfile) => void;
  onCreateUser: () => void;
  onRefresh?: () => void;
  currentUser?: any;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  usuarios,
  loading,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onChangePassword,
  onCreateUser,
  onRefresh,
  currentUser
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState<number | null>(null);

  // Obtener roles únicos
  const uniqueRoles = Array.from(new Set(usuarios.map(u => u.profile?.rol).filter(Boolean)));

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = !searchText || 
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
      user.profile?.departamento?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.profile?.rol === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.profile?.activo) ||
      (filterStatus === 'inactive' && !user.profile?.activo);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'TIPO_1': 'Técnico de Laboratorio Senior',
      'TIPO_2': 'Especialista en Polinización',
      'TIPO_3': 'Especialista en Germinación',
      'TIPO_4': 'Gestor del Sistema'
    };
    return roleNames[role] || role;
  };

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Manejar eliminación con confirmación
  const handleDeleteUser = async (user: UserWithProfile) => {
    console.log('🔍 handleDeleteUser called for user:', user.id, user.username);
    console.log('👤 Current user:', currentUser?.id, currentUser?.username);
    console.log('🚫 Is same user?', user.id === currentUser?.id);

    const userName = user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

    console.log('💬 Mostrando confirmación para:', userName);

    // Usar window.confirm para web (compatible con React Native Web)
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `¿Estás seguro de eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`
      );

      if (!confirmed) {
        console.log('❌ Eliminación cancelada por el usuario');
        return;
      }

      // Usuario confirmó la eliminación
      try {
        console.log('🗑️ CONFIRMADO - Eliminando usuario:', user.id, userName);
        console.log('📞 Llamando a onDeleteUser...');
        await onDeleteUser(user);
        console.log('✅ onDeleteUser completado exitosamente');
        alert(`Usuario "${userName}" eliminado correctamente`);
      } catch (error: any) {
        console.error('❌ Error al eliminar usuario:', error);
        console.error('📊 Error completo:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        alert(
          'Error al eliminar: ' + (
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.message ||
            'No se pudo eliminar el usuario. Por favor, intenta de nuevo.'
          )
        );
      }
    } else {
      // Para móvil, usar Alert.alert
      Alert.alert(
        '¿Estás seguro?',
        `¿Deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('❌ Eliminación cancelada por el usuario')
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🗑️ CONFIRMADO - Eliminando usuario:', user.id, userName);
                console.log('📞 Llamando a onDeleteUser...');
                await onDeleteUser(user);
                console.log('✅ onDeleteUser completado exitosamente');
                Alert.alert('Éxito', `Usuario "${userName}" eliminado correctamente`);
              } catch (error: any) {
                console.error('❌ Error al eliminar usuario:', error);
                Alert.alert(
                  'Error al eliminar',
                  error.response?.data?.detail ||
                  error.response?.data?.error ||
                  error.message ||
                  'No se pudo eliminar el usuario. Por favor, intenta de nuevo.'
                );
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Manejadores de selección múltiple
  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const allIds = filteredUsers
        .filter(u => u.id !== currentUser?.id) // No permitir seleccionar el usuario actual
        .map(u => u.id);
      setSelectedUsers(new Set(allIds));
    }
  };

  const handleBulkToggleStatus = async (newStatus: boolean) => {
    if (selectedUsers.size === 0) return;

    const { Alert } = require('react-native');
    const action = newStatus ? 'activar' : 'desactivar';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} usuarios`,
      `¿Está seguro de ${action} ${selectedUsers.size} usuario(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setBulkOperationLoading(true);
            try {
              const { userManagementService } = await import('@/services/user-management.service');
              await userManagementService.bulkToggleStatus(Array.from(selectedUsers), newStatus);

              // Recargar usuarios
              if (onRefresh) {
                onRefresh();
              }

              setSelectedUsers(new Set());
              Alert.alert('Éxito', `Usuarios ${action}dos exitosamente`);
            } catch (error: any) {
              Alert.alert('Error', error.message || `No se pudo ${action} los usuarios`);
            } finally {
              setBulkOperationLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="people" size={48} color={themeColors.text.disabled} />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con título y subtítulo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="people" size={28} color={themeColors.text.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Gestión de Usuarios del Sistema</Text>
              <Text style={styles.subtitle}>Administra usuarios, roles, metas y permisos del laboratorio</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={onCreateUser}>
            <Ionicons name="add" size={20} color={themeColors.text.inverse} />
            <Text style={styles.createButtonText}>Crear Usuario</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchAndFiltersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={themeColors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o especialización..."
            placeholderTextColor={themeColors.text.disabled}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <View style={styles.filtersRow}>
          {/* Filtro de roles */}
          <View style={styles.filterWrapper}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                setShowRoleFilter(!showRoleFilter);
                setShowStatusFilter(false);
              }}
            >
              <Ionicons name="filter" size={16} color={themeColors.text.tertiary} />
              <Text style={styles.filterButtonText}>
                {filterRole === 'all' ? 'Todos los roles' : getRoleDisplayName(filterRole)}
              </Text>
              <Ionicons name="chevron-down" size={16} color={themeColors.text.tertiary} />
            </TouchableOpacity>
            
            {showRoleFilter && (
              <View style={[styles.filterDropdown, styles.filterDropdownLeft]}>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => {
                    setFilterRole('all');
                    setShowRoleFilter(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>Todos los roles</Text>
                </TouchableOpacity>
                {uniqueRoles.map((role, index) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.filterOption,
                      index === uniqueRoles.length - 1 && styles.filterOptionLast
                    ]}
                    onPress={() => {
                      setFilterRole(role);
                      setShowRoleFilter(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>{getRoleDisplayName(role)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Filtro de estado */}
          <View style={styles.filterWrapper}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                setShowStatusFilter(!showStatusFilter);
                setShowRoleFilter(false);
              }}
            >
              <Text style={styles.filterButtonText}>
                {filterStatus === 'all' ? 'Todos' : filterStatus === 'active' ? 'Activos' : 'Inactivos'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={themeColors.text.tertiary} />
            </TouchableOpacity>
            
            {showStatusFilter && (
              <View style={[styles.filterDropdown, styles.filterDropdownRight]}>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => {
                    setFilterStatus('all');
                    setShowStatusFilter(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => {
                    setFilterStatus('active');
                    setShowStatusFilter(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>Activos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, styles.filterOptionLast]}
                  onPress={() => {
                    setFilterStatus('inactive');
                    setShowStatusFilter(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>Inactivos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Barra de acciones en lote */}
      {selectedUsers.size > 0 && (
        <View style={styles.bulkActionsBar}>
          <View style={styles.bulkActionsLeft}>
            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
              <Ionicons
                name={selectedUsers.size === filteredUsers.filter(u => u.id !== currentUser?.id).length ? "checkbox" : "square-outline"}
                size={20}
                color={themeColors.text.primary}
              />
              <Text style={styles.bulkActionsText}>
                {selectedUsers.size} usuario(s) seleccionado(s)
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bulkActionsRight}>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.bulkActivateButton]}
              onPress={() => handleBulkToggleStatus(true)}
              disabled={bulkOperationLoading}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={themeColors.status.success} />
              <Text style={[styles.bulkActionButtonText, styles.bulkActivateText]}>Activar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.bulkDeactivateButton]}
              onPress={() => handleBulkToggleStatus(false)}
              disabled={bulkOperationLoading}
            >
              <Ionicons name="close-circle-outline" size={18} color={themeColors.status.error} />
              <Text style={[styles.bulkActionButtonText, styles.bulkDeactivateText]}>Desactivar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkClearButton}
              onPress={() => setSelectedUsers(new Set())}
            >
              <Ionicons name="close" size={18} color={themeColors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Grid de tarjetas de usuarios */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={themeColors.text.disabled} />
          <Text style={styles.emptyTitle}>
            {searchText ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchText ? 'Intenta con otros términos de búsqueda' : 'Comienza creando el primer usuario'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsGrid}>
            {filteredUsers.map((user) => {
              const initials = user.first_name && user.last_name
                ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                : user.username.substring(0, 2).toUpperCase();
              
              const avatarColors = [
                themeColors.accent.tertiary,
                themeColors.primary.light,
                themeColors.accent.secondary,
                themeColors.status.warningLight,
                themeColors.primary.dark
              ];
              const avatarColor = avatarColors[user.id % avatarColors.length];
              
              const roleDisplay = user.profile?.rol_display || getRoleDisplayName(user.profile?.rol || '') || 'Sin rol';
              const isEspecialista = roleDisplay.includes('Especialista');
              const especialidad = isEspecialista 
                ? (roleDisplay.includes('Polinización') ? 'Polinización' : 'Germinación')
                : null;

              // Formatear fecha de ingreso
              const fechaIngreso = user.profile?.fecha_ingreso 
                ? (() => {
                    const date = new Date(user.profile.fecha_ingreso);
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
                  })()
                : 'N/A';

              return (
                <View key={user.id} style={styles.userCard}>
                  {/* Header con avatar y estado */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: user.profile?.activo ? themeColors.status.successLight : themeColors.status.errorLight }
                    ]}>
                      <View style={[styles.statusDot, { backgroundColor: user.profile?.activo ? themeColors.status.success : themeColors.status.error }]} />
                      <Text style={[
                        styles.statusBadgeText,
                        { color: user.profile?.activo ? themeColors.status.success : themeColors.status.error }
                      ]}>
                        {user.profile?.activo ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>

                  {/* Información del usuario */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardUserName}>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username}
                    </Text>
                    <Text style={styles.cardUserEmail}>{user.email || 'Sin email'}</Text>

                    {/* Detalles en contenedores */}
                    <View style={styles.cardDetails}>
                      <View style={styles.detailContainer}>
                        <View style={styles.detailRow}>
                          <Ionicons 
                            name={isEspecialista ? (especialidad === 'Polinización' ? 'flower-outline' : 'leaf-outline') : 'shield-outline'} 
                            size={16} 
                            color={isEspecialista && especialidad === 'Germinación' ? themeColors.module.germinacion.primary : themeColors.text.tertiary} 
                          />
                          <Text style={styles.detailLabel}>
                            {isEspecialista ? 'Especialidad' : 'Rol'}
                          </Text>
                          <Text style={styles.detailValue} numberOfLines={1}>
                            {isEspecialista ? especialidad : roleDisplay}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailContainer}>
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={16} color={themeColors.text.tertiary} />
                          <Text style={styles.detailLabel}>Ingreso</Text>
                          <Text style={styles.detailValue}>{fechaIngreso}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Acciones con separadores */}
                  <View style={styles.cardActions}>
                    <TooltipWrapper text="Editar usuario">
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => onEditUser(user)}
                      >
                        <Ionicons name="create-outline" size={18} color={themeColors.text.tertiary} />
                      </TouchableOpacity>
                    </TooltipWrapper>
                    <View style={styles.actionSeparator} />
                    {onChangePassword && user.id !== currentUser?.id && (
                      <>
                        <TooltipWrapper text="Cambiar contraseña">
                          <TouchableOpacity
                            style={styles.cardActionButton}
                            onPress={() => onChangePassword(user)}
                          >
                            <Ionicons name="key-outline" size={18} color={themeColors.text.tertiary} />
                          </TouchableOpacity>
                        </TooltipWrapper>
                        <View style={styles.actionSeparator} />
                      </>
                    )}
                    {onToggleStatus && user.id !== currentUser?.id && (
                      <>
                        <TooltipWrapper text={user.profile?.activo ? 'Desactivar usuario' : 'Activar usuario'}>
                          <TouchableOpacity
                            style={styles.cardActionButton}
                            onPress={() => onToggleStatus(user)}
                          >
                            <Ionicons 
                              name={user.profile?.activo ? "pause-outline" : "play-outline"} 
                              size={18} 
                              color={themeColors.text.tertiary} 
                            />
                          </TouchableOpacity>
                        </TooltipWrapper>
                        <View style={styles.actionSeparator} />
                      </>
                    )}
                    {user.id !== currentUser?.id && (
                      <TooltipWrapper text="Eliminar usuario">
                        <TouchableOpacity
                          style={styles.cardActionButton}
                          onPress={() => {
                            console.log('🗑️ DELETE BUTTON CLICKED for user:', user.id, user.username);
                            handleDeleteUser(user);
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color={themeColors.text.tertiary} />
                        </TouchableOpacity>
                      </TooltipWrapper>
                    )}
                    {/* Botón de más opciones - siempre visible */}
                    <View style={styles.actionSeparator} />
                    <TooltipWrapper text="Más opciones">
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => {
                        // Mostrar menú con opciones adicionales
                        const options: any[] = [];
                        
                        if (onChangePassword && user.id !== currentUser?.id) {
                          options.push({
                            text: 'Cambiar contraseña',
                            onPress: () => onChangePassword(user),
                          });
                        }
                        
                        if (onToggleStatus && user.id !== currentUser?.id) {
                          options.push({
                            text: user.profile?.activo ? 'Desactivar usuario' : 'Activar usuario',
                            onPress: () => onToggleStatus(user),
                          });
                        }
                        
                        if (user.id !== currentUser?.id) {
                          options.push({
                            text: 'Eliminar usuario',
                            style: 'destructive',
                            onPress: () => handleDeleteUser(user),
                          });
                        }
                        
                        if (options.length > 0) {
                          Alert.alert(
                            user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username,
                            'Selecciona una opción',
                            options.concat([{ text: 'Cancelar', style: 'cancel' }])
                          );
                        }
                      }}
                    >
                      <Ionicons name="ellipsis-horizontal-outline" size={18} color={themeColors.text.tertiary} />
                    </TouchableOpacity>
                    </TooltipWrapper>
                  </View>
                </View>
              );
            })}

            {/* Tarjeta de añadir nuevo usuario */}
            <TouchableOpacity style={styles.addUserCard} onPress={onCreateUser}>
              <Ionicons name="add" size={48} color={themeColors.text.tertiary} />
              <Text style={styles.addUserTitle}>Añadir Nuevo Usuario</Text>
              <Text style={styles.addUserSubtitle}>Configure el acceso para un nuevo miembro del equipo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.background.primary,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  searchAndFiltersContainer: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
    zIndex: 100,
  },
  filterWrapper: {
    position: 'relative',
    zIndex: 102,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    zIndex: 103,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: 40,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 10000,
    minWidth: 200,
    borderWidth: 1,
    borderColor: colors.border.default,
    maxHeight: 300,
    overflow: 'hidden',
  },
  filterDropdownLeft: {
    left: 0,
  },
  filterDropdownRight: {
    left: 0,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  filterOptionLast: {
    borderBottomWidth: 0,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
  },
  cardsContent: {
    padding: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  userCard: {
    width: '30%',
    minWidth: 280,
    maxWidth: 320,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  cardUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardUserEmail: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardDetails: {
    width: '100%',
    gap: 8,
  },
  detailContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 0,
  },
  cardActionButton: {
    padding: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionSeparator: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.default,
  },
  addUserCard: {
    width: '30%',
    minWidth: 280,
    maxWidth: 320,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  addUserTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  addUserSubtitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Estilos de contenido de celdas
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  especializacionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  fechaIngresoText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  actionsIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionIcon: {
    padding: 4,
  },
  // Estilos para bulk operations
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bulkActionsRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  bulkActivateButton: {
    backgroundColor: colors.status.successLight,
    borderColor: colors.status.success,
  },
  bulkDeactivateButton: {
    backgroundColor: colors.status.errorLight,
    borderColor: colors.status.error,
  },
  bulkActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActivateText: {
    color: colors.status.success,
  },
  bulkDeactivateText: {
    color: colors.status.error,
  },
  bulkClearButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background.secondary,
  },
  // Estilos para checkbox
  cellCheckbox: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserManagementTable;
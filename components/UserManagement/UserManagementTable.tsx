import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { UserWithProfile } from '@/types/index';

interface UserManagementTableProps {
  usuarios: UserWithProfile[];
  loading: boolean;
  onEditUser: (user: UserWithProfile) => void;
  onDeleteUser: (user: UserWithProfile) => void;
  onToggleStatus?: (user: UserWithProfile) => void;
  onCreateUser: () => void;
  currentUser?: any;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  usuarios,
  loading,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onCreateUser,
  currentUser
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

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
      'TIPO_2': 'Técnico de Laboratorio Junior',
      'TIPO_3': 'Técnico de Laboratorio',
      'TIPO_4': 'Administrador'
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="people" size={48} color="#d1d5db" />
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
            <Ionicons name="people" size={28} color="#1f2937" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Gestión de Usuarios del Sistema</Text>
              <Text style={styles.subtitle}>Administra usuarios, roles, metas y permisos del laboratorio</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={onCreateUser}>
            <Ionicons name="add" size={20} color={Colors.light.background} />
            <Text style={styles.createButtonText}>Crear Usuario</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchAndFiltersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o especialización..."
            placeholderTextColor="#9ca3af"
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
              <Ionicons name="filter" size={16} color="#6b7280" />
              <Text style={styles.filterButtonText}>
                {filterRole === 'all' ? 'Todos los roles' : getRoleDisplayName(filterRole)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
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
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
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

      {/* Tabla de usuarios */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>
            {searchText ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchText ? 'Intenta con otros términos de búsqueda' : 'Comienza creando el primer usuario'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.tableScrollHorizontal}
          nestedScrollEnabled={true}
        >
          <View style={styles.tableWrapper}>
            <View style={styles.tableContainer}>
              {/* Encabezados de tabla */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, styles.cellUsuario]}>
                  <Text style={styles.tableHeaderText}>Usuario</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.cellRolEstado]}>
                  <Text style={styles.tableHeaderText}>Rol & Estado</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.cellEspecializacion]}>
                  <Text style={styles.tableHeaderText}>Especialización</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.cellFechaIngreso]}>
                  <Text style={styles.tableHeaderText}>Fecha Ingreso</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.cellAcciones]}>
                  <Text style={styles.tableHeaderText}>Acciones</Text>
                </View>
              </View>

              {/* Filas de usuarios */}
              {filteredUsers.map((user) => {
                return (
                  <View key={user.id} style={styles.tableRow}>
                    {/* Columna Usuario */}
                    <View style={[styles.tableCell, styles.cellUsuario]}>
                      <Text style={styles.userName}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username}
                      </Text>
                      <Text style={styles.userEmail}>{user.email || 'Sin email'}</Text>
                      {user.profile?.telefono && (
                        <Text style={styles.userPhone}>{user.profile.telefono}</Text>
                      )}
                    </View>

                    {/* Columna Rol & Estado */}
                    <View style={[styles.tableCell, styles.cellRolEstado]}>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: '#f3f4f6' }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: '#374151' }
                        ]}>
                          {user.profile?.rol_display || getRoleDisplayName(user.profile?.rol || '') || 'Sin rol'}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: user.profile?.activo ? '#dcfce7' : '#fee2e2' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: user.profile?.activo ? '#16a34a' : '#dc2626' }
                        ]}>
                          {user.profile?.activo ? 'Activo' : 'Inactivo'}
                        </Text>
                      </View>
                    </View>

                    {/* Columna Especialización */}
                    <View style={[styles.tableCell, styles.cellEspecializacion]}>
                      <Text style={styles.especializacionText}>
                        {user.profile?.departamento || 'N/A'}
                      </Text>
                    </View>

                    {/* Columna Fecha Ingreso */}
                    <View style={[styles.tableCell, styles.cellFechaIngreso]}>
                      <Text style={styles.fechaIngresoText}>
                        {formatDate(user.profile?.fecha_ingreso)}
                      </Text>
                    </View>

                    {/* Columna Acciones */}
                    <View style={[styles.tableCell, styles.cellAcciones]}>
                      <View style={styles.actionsIcons}>
                        <TouchableOpacity
                          style={styles.actionIcon}
                          onPress={() => onEditUser(user)}
                          accessibilityLabel="Editar usuario"
                        >
                          <Ionicons name="create-outline" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                        {onToggleStatus && user.id !== currentUser?.id && (
                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => onToggleStatus(user)}
                            accessibilityLabel={user.profile?.activo ? "Desactivar usuario" : "Activar usuario"}
                          >
                            <Ionicons 
                              name={user.profile?.activo ? "pause-circle-outline" : "play-circle-outline"} 
                              size={18} 
                              color={user.profile?.activo ? "#F59E0B" : "#10B981"} 
                            />
                          </TouchableOpacity>
                        )}
                        {user.id !== currentUser?.id && (
                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => onDeleteUser(user)}
                            accessibilityLabel="Eliminar usuario"
                          >
                            <Ionicons name="trash-outline" size={18} color="#dc2626" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  searchAndFiltersContainer: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
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
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    zIndex: 103,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 10000,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  filterOptionLast: {
    borderBottomWidth: 0,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#1f2937',
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
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  tableScrollHorizontal: {
    flex: 1,
    zIndex: 1,
  },
  tableWrapper: {
    flexDirection: 'column',
  },
  tableContainer: {
    backgroundColor: Colors.light.background,
    minWidth: 1200,
    zIndex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  tableHeaderCell: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  tableCell: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
    justifyContent: 'center',
  },
  // Anchos de columnas
  cellUsuario: {
    width: 200,
  },
  cellRolEstado: {
    width: 180,
  },
  cellEspecializacion: {
    width: 180,
  },
  cellFechaIngreso: {
    width: 140,
  },
  cellAcciones: {
    width: 120,
  },
  // Estilos de contenido de celdas
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#6b7280',
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  especializacionText: {
    fontSize: 14,
    color: '#374151',
  },
  fechaIngresoText: {
    fontSize: 14,
    color: '#374151',
  },
  actionsIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionIcon: {
    padding: 4,
  },
});

export default UserManagementTable;
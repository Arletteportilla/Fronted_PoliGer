import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const userManagementStyles = StyleSheet.create({
  // Contenedor principal
  userManagementContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },

  // Header con estadísticas
  userManagementHeader: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: 12,
  },

  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },

  statCard: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },

  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Filtros y búsqueda
  userManagementFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  filterButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Estadísticas por rol
  roleStatsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  roleStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },

  roleStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  roleStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
  },

  roleStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roleStatContent: {
    flex: 1,
  },

  roleStatName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },

  roleStatCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Botón de crear usuario
  createUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  createUserButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },

  emptyStateIcon: {
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Tabla de usuarios
  userTableContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  tableHeader: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  // Columnas de la tabla
  avatarColumn: {
    width: 50,
    alignItems: 'center',
  },

  userInfoColumn: {
    flex: 2,
    paddingLeft: 8,
  },

  roleColumn: {
    flex: 1.5,
    alignItems: 'center',
  },

  statusColumn: {
    flex: 1,
    alignItems: 'center',
  },

  progressColumn: {
    flex: 1.5,
    alignItems: 'center',
  },

  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },

  actionsColumn: {
    flex: 1,
    alignItems: 'center',
  },

  // Header de la tarjeta
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  userAvatarText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: '600',
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },

  userMeta: {
    gap: 4,
  },

  userMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },

  userStatus: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  statusText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Cuerpo de la tarjeta
  userCardBody: {
    gap: 16,
  },

  roleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 8,
  },

  joinDate: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Sección de progreso
  progressSection: {
    gap: 12,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },

  progressGrid: {
    gap: 12,
  },

  progressItem: {
    gap: 8,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  progressValue: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },

  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },

  // Elementos de la tabla
  tableAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tableAvatarText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },

  tableUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },

  tableUserEmail: {
    fontSize: 12,
    color: '#6b7280',
  },

  tableRoleBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tableRoleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3730a3',
    marginLeft: 4,
  },

  tableStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tableStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  tableProgressContainer: {
    alignItems: 'center',
  },

  tableProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },

  tableProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },

  tableProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },

  tableDateText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Acciones de la tabla
  tableActionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  tableActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    zIndex: 10,
    elevation: 5,
  },

  viewActionButton: {
    backgroundColor: '#3b82f6',
  },

  editActionButton: {
    backgroundColor: '#10b981',
  },

  deleteActionButton: {
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#dc2626',
  },

  // Estado de carga
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },

  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});

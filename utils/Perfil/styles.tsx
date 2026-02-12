import { StyleSheet, Dimensions } from 'react-native';
import { getColors } from '@/utils/colors';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const isVerySmallScreen = screenWidth < 350;

// Función para crear estilos basados en el tema
export function createStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
      flexDirection: 'row',
    },
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      paddingBottom: isSmallScreen ? 20 : 40,
    },


    tabsContainer: {
      flexDirection: 'row',
      justifyContent: isSmallScreen ? 'flex-start' : 'center',
      gap: isVerySmallScreen ? 4 : isSmallScreen ? 6 : 8,
      marginBottom: isSmallScreen ? 16 : 32,
      paddingHorizontal: isSmallScreen ? 8 : 16,
      flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    },
    tab: {
      backgroundColor: colors.background.primary,
      paddingVertical: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12,
      paddingHorizontal: isVerySmallScreen ? 8 : isSmallScreen ? 12 : 20,
      borderRadius: isSmallScreen ? 20 : 25,
      shadowColor: '#121212',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: isVerySmallScreen ? 60 : isSmallScreen ? 70 : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeTab: {
      backgroundColor: colors.primary.main,
      borderColor: colors.accent.primary,
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    tabText: {
      color: colors.text.primary,
      fontWeight: '600',
      fontSize: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 13,
      textAlign: 'center',
      lineHeight: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
    },
    activeTabText: {
      color: colors.background.primary,
      fontWeight: '700',
    },
    contentContainer: {
      width: '100%',
      paddingHorizontal: isSmallScreen ? 8 : 16,
    },
    loader: {
      margin: 24,
    },
    listEmptyText: {
      color: colors.text.primary,
      textAlign: 'center',
      margin: 24,
      fontSize: 18,
      fontWeight: '600',
    },
    emptySubtext: {
      color: colors.text.tertiary,
      textAlign: 'center',
      fontSize: 14,
      marginTop: 8,
    },
    listEmptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    resumenContainer: {
      paddingVertical: 20,
    },
    statsGrid: {
      flexDirection: isVerySmallScreen ? 'column' : 'row',
      flexWrap: 'nowrap',
      gap: isSmallScreen ? 6 : 8,
      marginBottom: isSmallScreen ? 16 : 24,
      justifyContent: 'space-between',
    },
    statsCard: {
      backgroundColor: colors.background.primary,
      borderRadius: isSmallScreen ? 12 : 16,
      padding: isSmallScreen ? 12 : 16,
      flex: isVerySmallScreen ? 0 : 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      minHeight: isSmallScreen ? 70 : 85,
      borderWidth: 1,
      borderColor: '#e5f3f0',
      borderLeftWidth: 4,
      marginBottom: isVerySmallScreen ? 8 : 0,
    },
    statsCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
    },
    statsTextContainer: {
      flex: 1,
      paddingRight: 12,
    },
    statsIconContainer: {
      width: isSmallScreen ? 36 : 44,
      height: isSmallScreen ? 36 : 44,
      borderRadius: isSmallScreen ? 18 : 22,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    statsTitle: {
      color: colors.text.primary,
      fontSize: isSmallScreen ? 10 : 11,
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'left',
    },
    statsValue: {
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: '700',
      textAlign: 'left',
      letterSpacing: -0.5,
    },
    progressSection: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#121212',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#e5f3f0',
    },
    progressCardsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    progressTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    progressMeta: {
      color: colors.text.primary,
      fontSize: 14,
      marginBottom: 6,
      textAlign: 'center',
      fontWeight: '500',
    },
    progressCurrent: {
      color: colors.text.primary,
      fontSize: 32,
      fontWeight: '900',
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -1,
    },
    progressContainer: {
      marginTop: 16,
    },
    progressBarMain: {
      height: 8,
      backgroundColor: '#f1f5f9',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFillMain: {
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: 4,
    },
    progressText: {
      color: colors.text.primary,
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
    },
    listContainer: {
      paddingHorizontal: 16,
    },
    listItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    listItemEven: {
      backgroundColor: '#ffffff',
    },
    listItemOdd: {
      backgroundColor: '#f8fafc',
    },
    listItemContent: {
      flex: 1,
    },
    listItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1f2937',
      flex: 1,
    },
    listItemActions: {
      flexDirection: 'row',
      gap: 8,
    },
    listItemSubtitle: {
      fontSize: 14,
      color: '#6b7280',
      marginBottom: 4,
    },
    listItemDate: {
      fontSize: 12,
      color: '#9ca3af',
      fontWeight: '500',
    },
    listItemPrediccion: {
      fontSize: 11,
      color: '#10b981',
      fontWeight: '600',
      marginTop: 2,
    },
    listItemDeleteButton: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    alertasContainer: {
      paddingVertical: 20,
    },
    alertaCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    alertaCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    alertaCardLeft: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-start',
    },
    alertaIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    alertaInfo: {
      flex: 1,
    },
    alertaTitulo: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    alertaDescripcion: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 6,
    },
    alertaTiempo: {
      fontSize: 12,
      color: colors.text.tertiary,
      fontWeight: '500',
    },
    alertaPrioridadBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 60,
      alignItems: 'center',
      borderWidth: 1,
    },
    alertaPrioridadText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notificacionesContainer: {
      paddingVertical: 20,
    },
    notificacionCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: 'hidden',
    },
    notificacionNoLeida: {
      backgroundColor: colors.background.secondary,
    },
    notificacionCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 16,
    },
    notificacionCardLeft: {
      flexDirection: 'row',
      flex: 1,
      marginRight: 12,
    },
    notificacionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificacionInfo: {
      flex: 1,
    },
    notificacionTituloContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificacionTitulo: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      flex: 1,
    },
    notificacionDotNoLeida: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.status.info,
      marginLeft: 8,
    },
    notificacionDescripcion: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    notificacionTiempo: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    // Estilos adicionales para NotificationCard (en inglés para compatibilidad)
    notificationCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: 'hidden',
    },
    notificationCardUnread: {
      backgroundColor: colors.background.secondary,
    },
    unreadIndicator: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    notificationTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    notificationIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationTypeText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 6,
    },
    notificationTitleUnread: {
      fontWeight: '700',
    },
    notificationMessage: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    notificationMeta: {
      flex: 1,
    },
    notificationUser: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginBottom: 4,
    },
    notificationDate: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    notificationReference: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 8,
    },
    notificationReferenceText: {
      fontSize: 12,
      color: colors.text.tertiary,
      fontWeight: '500',
    },
    statusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: colors.primary.main,
      borderWidth: 1,
      borderColor: colors.primary.main,
      gap: 6,
    },
    statusButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.background.primary,
    },
    detailModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      maxHeight: '80%',
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    detailModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      backgroundColor: '#f9fafb',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    detailModalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary.main,
    },
    modalCloseButton: {
      padding: 6,
      borderRadius: 15,
      backgroundColor: colors.background.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    modalContent: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      maxHeight: 400,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    detailsContainer: {
      paddingVertical: 12,
    },
    detailRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginBottom: 1,
    },
    detailRowEven: {
      backgroundColor: colors.background.secondary,
    },
    detailRowOdd: {
      backgroundColor: colors.background.primary,
    },
    detailLabelContainer: {
      flex: 1,
      paddingRight: 8,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    detailValueContainer: {
      flex: 1.5,
    },
    detailValue: {
      fontSize: 12,
      color: colors.text.primary,
      lineHeight: 16,
    },
    detailModalFooter: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border?.default || '#e5e7eb',
      backgroundColor: colors.background.tertiary || colors.background.secondary,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    modalCloseFooterButton: {
      backgroundColor: colors.primary.main,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCloseFooterButtonText: {
      color: colors.background.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    debugButton: {
      backgroundColor: '#3b82f6',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 16,
    },
    debugButtonText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
    // Edit modal styles
    editModalContainer: {
      maxHeight: '90%',
      width: '95%',
    },
    editFormContainer: {
      paddingVertical: 16,
    },

    // Estilos para gestión de usuarios
    usuariosContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    usuariosHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
      paddingTop: 20,
    },
    usuariosTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary.main,
    },
    addUserButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.main,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    addUserButtonText: {
      color: colors.background.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    loadingIndicator: {
      marginTop: 40,
    },
    adminUsuariosList: {
      flex: 1,
    },
    usuarioCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    usuarioInfo: {
      flex: 1,
    },
    usuarioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    usuarioStatusContainer: {
      alignItems: 'flex-end',
    },
    metasSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    metasTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 12,
    },
    metasGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    metaCard: {
      flex: 1,
      backgroundColor: '#f9fafb',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    metaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    metaCardLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: '#6b7280',
    },
    metaCardProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    metaCurrent: {
      fontSize: 18,
      fontWeight: '700',
      color: '#10b981',
    },
    metaSeparator: {
      fontSize: 14,
      color: '#9ca3af',
      marginHorizontal: 4,
    },
    metaTarget: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
    },
    editMetaButton: {
      alignSelf: 'flex-end',
      padding: 4,
    },
    progresoGeneral: {
      marginTop: 8,
    },
    metaProgresoTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: 8,
    },
    progresoBar: {
      height: 6,
      backgroundColor: '#e5e7eb',
      borderRadius: 3,
      marginBottom: 6,
      overflow: 'hidden',
    },
    progresoFill: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 3,
    },
    progresoText: {
      fontSize: 12,
      color: '#6b7280',
      textAlign: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 6,
      marginRight: 8,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#374151',
    },
    adminSection: {
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      alignItems: 'center',
    },
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#9C27B0',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    adminButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    // Estilos para la nueva interfaz de gestión de usuarios
    headerLeft: {
      flex: 1,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    usuariosSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
    },
    createUserButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#000',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    createUserButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    createUserButtonSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.main,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      gap: 4,
      alignSelf: 'flex-start',
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    createUserButtonTextSmall: {
      color: colors.background.primary,
      fontSize: 12,
      fontWeight: '500',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary.main,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
      textAlign: 'center',
    },
    statSubtext: {
      fontSize: 11,
      color: '#9CA3AF',
      textAlign: 'center',
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    recentSection: {
      marginTop: 24,
      marginBottom: 16,
    },
    recentSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    recentSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    recentItemContent: {
      flex: 1,
    },
    recentItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    recentItemCode: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text.primary,
      flex: 1,
    },
    recentItemBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    recentItemBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    recentItemSpecies: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    recentItemFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    recentItemDate: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    searchFilterContainer: {
      marginBottom: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      color: colors.text.primary,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.secondary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    filterButtonActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.accent.primary,
    },
    filterButtonText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: colors.background.primary,
      fontWeight: '600',
    },
    usuariosListTable: {
      flex: 1,
    },
    usuarioRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    usuarioRolEstado: {
      alignItems: 'flex-end',
    },
    rolBadge: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
    },
    rolText: {
      color: '#6B7280',
      fontSize: 12,
      fontWeight: '500',
    },
    usuarioRol: {
      fontSize: 14,
      color: '#374151',
      fontWeight: '500',
      marginBottom: 8,
      textAlign: 'right',
    },
    estadoBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    estadoText: {
      color: '#065F46',
      fontSize: 12,
      fontWeight: '600',
    },
    estadoBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    usuarioPhone: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2,
    },
    progresoMetas: {
      marginBottom: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    usuarioProgresoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 12,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    metaRowLabel: {
      fontSize: 14,
      color: '#6B7280',
      minWidth: 100,
    },
    metaRowProgress: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginRight: 8,
    },
    metaRowProgressBar: {
      flex: 1,
      height: 6,
      backgroundColor: '#E5E7EB',
      borderRadius: 3,
      overflow: 'hidden',
    },
    metaRowProgressFill: {
      height: '100%',
      backgroundColor: '#6B7280',
      borderRadius: 3,
    },
    exitoRow: {
      marginTop: 8,
    },
    exitoText: {
      fontSize: 14,
      color: '#10B981',
      fontWeight: '600',
    },
    usuarioFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    especializacion: {
      flex: 1,
    },
    especializacionLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 2,
    },
    especializacionTextUser: {
      fontSize: 14,
      color: '#374151',
      fontWeight: '500',
    },
    fechaIngreso: {
      alignItems: 'flex-end',
    },
    fechaIngresoLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 2,
    },
    fechaIngresoTextUser: {
      fontSize: 14,
      color: '#374151',
      fontWeight: '500',
    },
    accionesContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    accionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accionButtonDisabled: {
      backgroundColor: '#F9FAFB',
      opacity: 0.5,
    },
    // Estilos para la tabla
    tableContainer: {
      backgroundColor: colors.background.primary,
      borderRadius: 8,
      overflow: 'hidden',
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border.default,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 2,
      borderBottomColor: colors.border.default,
      paddingVertical: 12,
    },
    tableHeaderCell: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      justifyContent: 'center',
    },
    headerCell: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 12,
      justifyContent: 'center',
    },
    headerText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text.secondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.primary,
      minHeight: 60,
    },
    tableRowLast: {
      borderBottomWidth: 0,
    },
    tableCell: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      justifyContent: 'center',
      minHeight: 60,
    },
    metaText: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
    },
    tableEspecializacionText: {
      fontSize: 14,
      color: '#374151',
      textAlign: 'center',
    },
    tableFechaIngresoText: {
      fontSize: 14,
      color: '#374151',
      textAlign: 'center',
    },
    usuarioName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary.main,
      marginBottom: 4,
    },
    usuarioEmail: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    usuarioRole: {
      fontSize: 12,
      color: colors.accent.primary,
      fontWeight: '600',
    },
    usuarioActions: {
      marginTop: 12,
    },

    // Estilos para modal de crear usuario
    createUserModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    createUserModalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      width: '90%',
      maxHeight: '80%',
    },
    createUserModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    createUserModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary.main,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      maxHeight: 400,
    },
    createUserModalSubtitle: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
    },
    createUserInputGroup: {
      marginBottom: 16,
    },
    createUserInputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6,
    },
    createUserTextInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    createUserRoleSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    createUserRoleOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#d1d5db',
      backgroundColor: '#fff',
    },
    createUserRoleOptionSelected: {
      backgroundColor: colors.accent.primary,
      borderColor: colors.accent.primary,
    },
    createUserRoleOptionText: {
      fontSize: 12,
      color: '#374151',
      fontWeight: '500',
    },
    createUserRoleOptionTextSelected: {
      color: colors.background.primary,
      fontWeight: '600',
    },
    createUserModalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    createUserCancelButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#d1d5db',
      backgroundColor: '#fff',
      marginRight: 8,
      alignItems: 'center',
    },
    createUserCancelButtonText: {
      color: '#374151',
      fontSize: 14,
      fontWeight: '600',
    },
    createButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.accent.primary,
      color: '#fff',
      alignItems: 'center',
      marginLeft: 8,
    },
    createButtonDisabled: {
      backgroundColor: '#9ca3af',
    },
    createButtonText: {
      color: colors.background.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    editFieldContainer: {
      marginBottom: 16,
    },
    editFieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6,
    },
    editFieldInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: '#1f2937',
      backgroundColor: '#ffffff',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    editModalCancelButton: {
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    editModalSaveButton: {
      backgroundColor: '#22c55e',
    },
    editModalCancelButtonText: {
      color: '#374151',
      fontSize: 14,
      fontWeight: '600',
    },
    editModalSaveButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    debugContainer: {
      backgroundColor: '#fef3c7',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#f59e0b',
    },
    debugText: {
      color: '#92400e',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },

    // ============================================================================
    // ESTILOS PARA SISTEMA RBAC
    // ============================================================================
    topUserInfoSection: {
      backgroundColor: colors.background.primary,
      borderRadius: 20,
      padding: 28,
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.default,
    },

    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 20,
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.accent.primary,
    },

    userInfoContainer: {
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },

    roleBadgeContainer: {
      alignItems: 'center',
    },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EF4444',
      borderWidth: 0,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      marginTop: 8,
      gap: 8,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
      minWidth: 180,
    },

    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
    },

    userInfoSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    userAvatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: '#FFFFFF',
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },

    userAvatarText: {
      color: colors.background.primary,
      fontSize: 48,
      fontWeight: '700',
      letterSpacing: 1,
    },

    userDetails: {
      flex: 1,
    },

    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 6,
      textAlign: 'center',
      letterSpacing: -0.5,
    },

    userEmail: {
      fontSize: 15,
      color: '#6B7280',
      textAlign: 'center',
      fontWeight: '500',
    },

    roleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    viewPermissionsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
    },

    viewPermissionsText: {
      fontSize: 12,
      color: '#666',
      marginRight: 4,
    },

    quickActionsSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    quickActionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 12,
    },

    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: '48%',
      justifyContent: 'center',
    },

    quickActionText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },

    rbacEmptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    rbacEmptyText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
    },

    deleteConfirmModalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      margin: 20,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      maxWidth: 400,
      width: '90%',
    },

    deleteConfirmText: {
      fontSize: 16,
      color: '#374151',
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 8,
    },

    userNameHighlight: {
      fontWeight: 'bold',
      color: '#EF4444',
    },

    deleteConfirmModalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      gap: 12,
    },

    deleteConfirmCancelButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteConfirmCancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
    },

    confirmDeleteButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    editUserModalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      margin: 20,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      maxWidth: 400,
      width: '90%',
    },

    editUserModalSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 20,
    },

    editUserInputGroup: {
      marginBottom: 16,
    },

    editUserInputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },

    editUserTextInput: {
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: '#374151',
    },

    pickerContainer: {
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    pickerText: {
      fontSize: 16,
      color: '#374151',
    },

    picker: {
      height: 50,
      width: '100%',
      color: '#374151',
    },

    editUserRoleSelector: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#F3F4F6',
      borderRadius: 6,
      alignItems: 'center',
    },

    roleSelectorText: {
      fontSize: 14,
      color: '#3B82F6',
      fontWeight: '500',
    },

    editUserSaveButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    editUserSaveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    roleSelectorModalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      margin: 20,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      maxWidth: 400,
      width: '90%',
    },

    roleSelectorRoleOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },

    roleSelectorRoleOptionSelected: {
      backgroundColor: '#F0F9FF',
      borderBottomColor: '#3B82F6',
    },

    roleSelectorRoleOptionText: {
      fontSize: 16,
      color: '#374151',
      flex: 1,
    },

    roleSelectorRoleOptionTextSelected: {
      color: '#3B82F6',
      fontWeight: '600',
    },

    // Estilos para modal de metas
    metasModalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      margin: 20,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      maxWidth: 400,
      width: '90%',
    },

    progresoActualSection: {
      marginTop: 20,
      padding: 16,
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.default,
    },

    progresoActualTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 12,
    },

    progresoActualItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    progresoActualLabel: {
      fontSize: 14,
      color: '#6B7280',
    },

    progresoActualValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
    },

    assignMetasButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
    },

    assignMetasButtonDisabled: {
      backgroundColor: '#9CA3AF',
    },

    assignMetasButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background.primary,
    },

    disabledInput: {
      backgroundColor: '#F3F4F6',
      color: '#9CA3AF',
      opacity: 0.6,
    },

    disabledText: {
      fontSize: 12,
      color: '#EF4444',
      marginTop: 4,
      fontStyle: 'italic',
    },

    // Estilos para alertas personalizadas
    alertasSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 16,
      marginTop: 8,
      paddingHorizontal: 20,
    },
    alertasSeparator: {
      height: 1,
      backgroundColor: '#e5e7eb',
      marginVertical: 20,
      marginHorizontal: 20,
    },
    alertaActionsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
    },
    alertaActionButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertaActionButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    alertaIconText: {
      fontSize: 16,
      color: '#fff',
    },
    emptyAlertas: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyAlertasText: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
    },

    // Estilos para la lista completa de usuarios
    usuariosListHeader: {
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    usuariosListTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#182d49',
      marginBottom: 4,
    },
    usuariosListSubtitle: {
      fontSize: 14,
      color: '#6b7280',
    },

    // ============================================================================
    // ESTILOS PARA MODAL DE EDICIÓN DE GERMINACIONES
    // ============================================================================
    editModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    editModalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    editModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      backgroundColor: colors.primary.main,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    editModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.background.primary,
    },
    editModalCloseButton: {
      padding: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    editModalBody: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    editModalScrollView: {
      flex: 1,
    },
    editModalFormSection: {
      marginBottom: 20,
    },
    editModalFormSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    editModalInputGroup: {
      marginBottom: 16,
    },
    editModalInputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    editModalTextInput: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#FFFFFF',
      color: '#1F2937',
    },
    editModalTextArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    editModalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      gap: 12,
    },

    // ============================================================================
    // ESTILOS PARA TABLA DE GERMINACIONES
    // ============================================================================
    professionalTableContainer: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    professionalTableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 2,
      borderBottomColor: colors.border.default,
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    professionalTableHeaderCell: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text.secondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    professionalTableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      minHeight: 80,
    },
    professionalTableRowLast: {
      borderBottomWidth: 0,
    },
    tipoColumn: {
      flex: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codigoColumn: {
      flex: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    especieColumn: {
      flex: 2.5,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: 8,
    },
    fechaColumn: {
      flex: 1.3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    estadoColumn: {
      flex: 1.3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cantidadColumn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accionesColumn: {
      flex: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    tipoBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipoBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    codigoText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.primary,
      textAlign: 'center',
    },
    especieText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text.primary,
      lineHeight: 18,
    },
    generoText: {
      fontSize: 12,
      color: colors.text.tertiary,
      fontWeight: '500',
    },
    fechaText: {
      fontSize: 11,
      color: colors.text.tertiary,
      textAlign: 'center',
      fontWeight: '500',
    },
    cantidadText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.primary,
      textAlign: 'center',
    },
    accionButtonPrimary: {
      backgroundColor: '#3B82F6',
    },
    accionButtonSuccess: {
      backgroundColor: '#10B981',
    },
    accionButtonDanger: {
      backgroundColor: '#EF4444',
    },
    accionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyTableContainer: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTableText: {
      fontSize: 16,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyTableSubtext: {
      fontSize: 14,
      color: colors.text.tertiary,
      textAlign: 'center',
    },

    // ============================================================================
    // ESTILOS PARA SELECCIÓN DE ROLES
    // ============================================================================
    roleOption: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    roleOptionSelected: {
      backgroundColor: '#F0F9FF',
      borderColor: '#3B82F6',
      borderWidth: 2,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    roleOptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    roleRadioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF',
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleRadioButtonSelected: {
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F6',
    },
    roleRadioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    roleOptionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      flex: 1,
    },
    roleOptionLabelSelected: {
      color: '#3B82F6',
      fontWeight: '700',
    },
    roleOptionDescription: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
      marginLeft: 32,
    },

    // ============================================================================
    // ESTILOS MEJORADOS PARA ENCABEZADO Y BÚSQUEDA
    // ============================================================================

    // Estilos para el encabezado de la tabla
    tableHeaderSection: {
      backgroundColor: colors.background.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },

    tableTitleContainer: {
      marginBottom: 12,
    },

    professionalTableTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },

    professionalTableSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
    },

    tableActionsContainer: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },

    newItemButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.main,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    newItemButtonText: {
      color: colors.background.primary,
      fontSize: 14,
      fontWeight: '600',
    },

    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.primary.main,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    exportButtonText: {
      color: colors.primary.main,
      fontSize: 14,
      fontWeight: '600',
    },

    // Estilos para la barra de búsqueda
    searchAndFiltersContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.default,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    searchPlaceholder: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      color: colors.text.tertiary,
    },

    // Estilos para cards de items optimizados
    itemCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border.default,
    },

    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    itemCode: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },

    itemTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },

    itemSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 12,
    },

    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    itemDate: {
      fontSize: 12,
      color: '#9CA3AF',
    },

    // Estilos para las acciones en las tablas
    actionsCell: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIconButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
    },

    // Estilos para modales de detalles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border?.default || '#E5E7EB',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border?.default || '#E5E7EB',
    },
    modalCloseButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    detailSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary.main,
    },
    // Estilos adicionales para modal simplificado
    fieldGroup: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.background.tertiary || colors.background.secondary,
      borderRadius: 8,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 8,
    },
    fieldValue: {
      fontSize: 13,
      color: colors.text.primary,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 12,
      color: '#9CA3AF',
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 16,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    secondaryButton: {
      backgroundColor: '#6B7280',
    },
    secondaryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },

    // Estilos para contenedor de filas con progreso
    tableRowContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
      paddingVertical: 12,
      backgroundColor: colors.background.primary,
    },
    tableRowContainerLast: {
      borderBottomWidth: 0,
    },

    // Estilos para barra de progreso
    progressRow: {
      paddingTop: 12,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 120,
    },
    progressLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6B7280',
      marginRight: 4,
    },
    progressPercentage: {
      fontSize: 12,
      fontWeight: '700',
    },
    progressBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: '#E5E7EB',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },

    // Estilos para gestión de etapa
    estadoBadgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    etapaEstadoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      gap: 8,
    },
    etapaEstadoBadgeText: {
      fontSize: 15,
      fontWeight: '600',
    },
    etapaButtonsContainer: {
      gap: 12,
    },
    etapaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    etapaButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    etapaCompletadaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#D1FAE5',
      borderRadius: 10,
      gap: 12,
    },
    etapaCompletadaText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: '#059669',
    },
    infoCard: {
      backgroundColor: '#F9FAFB',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#6B7280',
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '500',
      color: '#1F2937',
    },
    etapasTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1F2937',
      marginTop: 8,
      marginBottom: 16,
    },
    etapasContainer: {
      gap: 12,
    },
    etapaActionButtonText: {
      paddingLeft: 8,
    },

    // Mobile Card Styles
    mobileCardContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    mobileCard: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    mobileCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingBottom: 8,
    },
    mobileCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      flex: 1,
    },
    mobileCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      alignItems: 'center',
    },
    mobileCardLabel: {
      fontSize: 14,
      color: colors.text.tertiary,
      fontWeight: '500',
      flex: 1,
    },
    mobileCardValue: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '600',
      flex: 1.5,
      textAlign: 'right',
    },
    mobileCardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      paddingTop: 12,
    },
    mobileCardBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    mobileCardBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },

    // ============================================================================
    // ESTILOS NUEVO DISEÑO RESUMEN (Active List)
    // ============================================================================
    // --- Estilos para PerfilResumen (Listas Activas) ---
    activeListSection: {
      marginBottom: 24,
    },
    activeListContainer: {
      gap: 16,
    },
    activeListCard: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: colors.border.default,
      overflow: 'hidden',
    },
    activeListHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    activeListTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    activeListIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeListTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '800',
    },
    activeListEfficiency: {
      alignItems: 'flex-end',
      gap: 4,
    },
    efficiencyBar: {
      width: 80,
      height: 6,
      backgroundColor: colors.border.default,
      borderRadius: 3,
      overflow: 'hidden',
    },
    efficiencyFill: {
      height: '100%',
      borderRadius: 3,
    },
    efficiencyText: {
      color: colors.text.tertiary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    activeListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      gap: 16,
    },
    activeListItemIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeListItemContent: {
      flex: 1,
      gap: 4,
    },
    activeListItemCode: {
      color: colors.text.primary,
      fontWeight: '700',
      fontSize: 15,
    },
    activeListItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activeListItemDays: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    activeListItemDaysText: {
      color: colors.text.tertiary,
      fontSize: 12,
      fontWeight: '600',
    },
    activeListBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeListBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    viewHistoryButton: {
      width: '100%',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      marginTop: 12,
      alignItems: 'center',
    },
    viewHistoryText: {
      color: colors.primary.main,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      marginTop: 12,
      color: colors.text.secondary,
      fontSize: 14,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyStateText: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    emptyStateSubtext: {
      marginTop: 8,
      fontSize: 14,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
  });
}

// Estilos por defecto para compatibilidad hacia atrás (usa tema claro)
export const styles = createStyles(getColors('light'));
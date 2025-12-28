import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/contexts/ThemeContext';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

interface PolinizacionCardProps {
  item: any;
  onPress: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onViewDetails?: (item: any) => void;
  onChangeStatus?: (item: any) => void;
}

// Definir createStyles antes del componente para que esté disponible
const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardOverdue: {
    borderColor: colors.status.error,
    borderWidth: 2,
    backgroundColor: colors.status.errorLight,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  tableCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 0,
  },
  cellFlex: {
    flex: 1,
    minWidth: 100,
  },
  cellFull: {
    width: '100%',
  },
  codigoText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent.primary,
    letterSpacing: 0.2,
  },
  rowText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
    lineHeight: 18,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginRight: 4,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tipoBadge: {
    // Estilos aplicados dinámicamente
  },
  statusBadge: {
    // Estilos aplicados dinámicamente
  },
  climaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  climaText: {
    color: colors.text.inverse,
    fontSize: 9,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginLeft: 4,
    flex: 1,
  },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.status.errorLight,
    gap: 6,
  },
  overdueText: {
    color: colors.status.error,
    fontSize: 11,
    fontWeight: '700',
  },
  prediccionSection: {
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.accent.infoLight,
    borderRadius: 8,
    padding: 10,
  },
  prediccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  prediccionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.primary,
    flex: 1,
  },
  metodoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metodoText: {
    color: colors.text.inverse,
    fontSize: 9,
    fontWeight: '700',
  },
  prediccionContent: {
    gap: 6,
  },
  prediccionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prediccionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  prediccionValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  diasFaltantes: {
    color: colors.status.warning,
    fontWeight: '700',
  },
  diasHoy: {
    color: colors.status.success,
    fontWeight: '700',
  },
  diasVencido: {
    color: colors.status.error,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border.default,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  actionButtonView: {
    backgroundColor: colors.accent.infoLight,
    borderColor: colors.accent.tertiary,
  },
  actionButtonEdit: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warning,
  },
  actionButtonDelete: {
    backgroundColor: colors.status.errorLight,
    borderColor: colors.status.error,
  },
  actionButtonStatus: {
    backgroundColor: colors.accent.infoLight,
    borderColor: colors.accent.tertiary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextView: {
    color: colors.accent.secondary,
  },
  actionButtonTextEdit: {
    color: colors.status.warning,
  },
  actionButtonTextDelete: {
    color: colors.status.error,
  },
  actionButtonTextStatus: {
    color: colors.accent.tertiary,
  },
});

export const PolinizacionCard: React.FC<PolinizacionCardProps> = ({ 
  item, 
  onPress,
  onEdit,
  onDelete,
  onViewDetails,
  onChangeStatus
}) => {
  const responsive = useResponsive();
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);

  // Determinar el estado actual de la polinización usando los campos de workflow
  const getCurrentStatus = () => {
    // Usar estado_polinizacion si existe
    if (item.estado_polinizacion) {
      if (item.estado_polinizacion === 'FINALIZADO') return 'Finalizado';
      if (item.estado_polinizacion === 'EN_PROCESO') return 'En Proceso';
      if (item.estado_polinizacion === 'INICIAL') return 'Inicial';
    }

    // Fallback a lógica legacy si no existe estado_polinizacion
    if (item.fechamad) return 'Completado';
    if (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) return 'En Proceso';
    return 'Ingresado';
  };

  const currentStatus = getCurrentStatus();
  const isOverdue = item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) < new Date() && !item.fechamad;

  // Construir el nombre completo de la especie/híbrido
  const buildEspecieCompleta = () => {
    // Priorizar nueva_planta_especie, luego especie, luego madre_especie
    const especie = item.nueva_planta_especie || item.especie || item.madre_especie || '';
    
    // Si hay información de plantas madre y padre, construir el híbrido
    if (item.madre_especie && item.padre_especie) {
      const madre = item.madre_especie;
      const padre = item.padre_especie;
      return `${especie || madre} x ${padre}`;
    }
    
    // Si solo hay información de nueva planta o especie directa
    if (especie) {
      return especie;
    }
    
    return 'Sin especie';
  };

  const especieCompleta = buildEspecieCompleta();
  const generoCompleto = item.nueva_planta_genero || item.genero || item.madre_genero || 'Sin género';
  const codigoCompleto = item.codigo || item.nombre || item.nueva_codigo || item.madre_codigo || 'Sin código';

  // Formatear fecha
  const fechaFormateada = item.fechapol ? new Date(item.fechapol).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : 'Sin fecha';

  const responsiveStyles = {
    card: {
      ...styles.card,
      padding: responsive.isTablet ? 12 : responsive.isDesktop ? 14 : 10,
      marginBottom: responsive.isTablet ? 10 : responsive.isDesktop ? 12 : 8,
    },
    rowText: {
      ...styles.rowText,
      fontSize: responsive.isTablet ? 14 : responsive.isDesktop ? 15 : 13,
    },
    badge: {
      ...styles.badge,
      paddingHorizontal: responsive.isTablet ? 10 : responsive.isDesktop ? 12 : 8,
      paddingVertical: responsive.isTablet ? 5 : responsive.isDesktop ? 6 : 4,
    },
    badgeText: {
      ...styles.badgeText,
      fontSize: responsive.isTablet ? 11 : responsive.isDesktop ? 12 : 10,
    },
  };

  return (
    <TouchableOpacity 
      style={[
        responsiveStyles.card,
        isOverdue && styles.cardOverdue
      ]} 
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {/* Fila 1: Tipo, Código, Estado */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          {item.tipo_polinizacion && (
            <View style={[responsiveStyles.badge, styles.tipoBadge, {
              backgroundColor: item.tipo_polinizacion === 'SELF' ? themeColors.accent.secondary : 
                               item.tipo_polinizacion === 'SIBLING' ? themeColors.accent.tertiary : themeColors.status.warning
            }]}>
              <Text style={responsiveStyles.badgeText}>{item.tipo_polinizacion}</Text>
            </View>
          )}
        </View>
        <View style={styles.tableCell}>
          <View style={[responsiveStyles.badge, styles.statusBadge, {
            backgroundColor:
              (currentStatus === 'Completado' || currentStatus === 'Finalizado') ? themeColors.status.success :
              currentStatus === 'En Proceso' ? themeColors.status.warning :
              currentStatus === 'Inicial' ? themeColors.accent.secondary :
              themeColors.text.tertiary
          }]}>
            <Text style={responsiveStyles.badgeText}>{currentStatus}</Text>
          </View>
        </View>
      </View>

      {/* Fila 2: Especie completa */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.cellFull]}>
          <Text style={responsiveStyles.rowText} numberOfLines={2} ellipsizeMode="tail">
            {especieCompleta}
          </Text>
        </View>
      </View>

      {/* Fila 3: Género y Fecha */}
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.cellFlex]}>
          <Text style={styles.labelText}>Género:</Text>
          <Text style={styles.valueText}>{generoCompleto}</Text>
        </View>
        <View style={[styles.tableCell, styles.cellFlex]}>
          <Text style={styles.labelText}>Fecha:</Text>
          <Text style={styles.valueText}>{fechaFormateada}</Text>
        </View>
      </View>

      {/* Fila 4: Información adicional (si existe) */}
      {(item.clima || item.vivero || item.ubicacion || item.responsable) && (
        <View style={styles.tableRow}>
          {item.clima && (
            <View style={styles.tableCell}>
              <View style={styles.climaBadge}>
                <Ionicons name="partly-sunny" size={10} color={themeColors.text.inverse} />
                <Text style={styles.climaText}>{item.clima}</Text>
              </View>
            </View>
          )}
          {(item.vivero || item.ubicacion) && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Ionicons name="location-outline" size={12} color={themeColors.text.tertiary} />
              <Text style={styles.metaText}>
                {item.vivero ? `V-${item.vivero}` : item.ubicacion}
              </Text>
            </View>
          )}
          {item.responsable && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Ionicons name="person-outline" size={12} color={themeColors.text.tertiary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {typeof item.responsable === 'string' ? item.responsable : item.responsable?.username || ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Predicción de Maduración */}
      {(item.dias_maduracion_predichos || item.fecha_maduracion_predicha) && !item.fechamad && (
        <View style={styles.prediccionSection}>
          <View style={styles.prediccionHeader}>
            <Ionicons name="analytics-outline" size={14} color={themeColors.accent.secondary} />
            <Text style={styles.prediccionTitle}>Predicción de Maduración</Text>
            {item.metodo_prediccion && (
              <View style={[styles.metodoBadge, {
                backgroundColor: item.metodo_prediccion === 'ML' ? themeColors.status.success : themeColors.text.tertiary
              }]}>
                <Text style={styles.metodoText}>
                  {item.metodo_prediccion === 'ML' ? 'ML' : 'Heurístico'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.prediccionContent}>
            {item.fecha_maduracion_predicha && (
              <View style={styles.prediccionRow}>
                <Ionicons name="calendar-outline" size={12} color={themeColors.text.tertiary} />
                <Text style={styles.prediccionLabel}>Fecha estimada:</Text>
                <Text style={styles.prediccionValue}>
                  {new Date(item.fecha_maduracion_predicha).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
            
            {item.dias_maduracion_predichos && (
              <View style={styles.prediccionRow}>
                <Ionicons name="time-outline" size={12} color={themeColors.text.tertiary} />
                <Text style={styles.prediccionLabel}>Días estimados:</Text>
                <Text style={styles.prediccionValue}>{item.dias_maduracion_predichos} días</Text>
              </View>
            )}
            
            {item.fecha_maduracion_predicha && (() => {
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              const fechaEstimada = new Date(item.fecha_maduracion_predicha);
              fechaEstimada.setHours(0, 0, 0, 0);
              const diasFaltantes = Math.ceil((fechaEstimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              
              return diasFaltantes > 0 ? (
                <View style={styles.prediccionRow}>
                  <Ionicons name="hourglass-outline" size={12} color={themeColors.status.warning} />
                  <Text style={styles.prediccionLabel}>Días faltantes:</Text>
                  <Text style={[styles.prediccionValue, styles.diasFaltantes]}>
                    {diasFaltantes} días
                  </Text>
                </View>
              ) : diasFaltantes === 0 ? (
                <View style={styles.prediccionRow}>
                  <Ionicons name="checkmark-circle" size={12} color={themeColors.status.success} />
                  <Text style={[styles.prediccionValue, styles.diasHoy]}>
                    ¡Hoy es el día estimado!
                  </Text>
                </View>
              ) : (
                <View style={styles.prediccionRow}>
                  <Ionicons name="alert-circle" size={12} color={themeColors.status.error} />
                  <Text style={[styles.prediccionValue, styles.diasVencido]}>
                    Vencido hace {Math.abs(diasFaltantes)} días
                  </Text>
                </View>
              );
            })()}
            
            {item.confianza_prediccion && (() => {
              const confianza = typeof item.confianza_prediccion === 'number' 
                ? item.confianza_prediccion 
                : parseFloat(item.confianza_prediccion);
              
              if (isNaN(confianza)) return null;
              
              return (
                <View style={styles.prediccionRow}>
                  <Ionicons name="shield-checkmark-outline" size={12} color={themeColors.text.tertiary} />
                  <Text style={styles.prediccionLabel}>Confianza:</Text>
                  <Text style={[styles.prediccionValue, {
                    color: confianza >= 80 ? themeColors.status.success : 
                           confianza >= 60 ? themeColors.status.warning : themeColors.status.error
                  }]}>
                    {confianza.toFixed(0)}%
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      )}

      {/* Barra de progreso por etapas */}
      {item.estado_polinizacion && (
        <View style={{
          marginTop: 8,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          paddingVertical: 4
        }}>
          <EstadoProgressBar
            estadoActual={item.estado_polinizacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
            tipo="polinizacion"
          />
        </View>
      )}

      {/* Advertencia de vencimiento */}
      {isOverdue && (
        <View style={styles.overdueRow}>
          <Ionicons name="warning" size={14} color={themeColors.status.error} />
          <Text style={styles.overdueText}>Vencido</Text>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        {onViewDetails && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonView]}
            onPress={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={18} color={themeColors.accent.secondary} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextView]}>
              Ver
            </Text>
          </TouchableOpacity>
        )}

        {onChangeStatus && item.estado_polinizacion !== 'FINALIZADO' && !item.fechamad && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonStatus]}
            onPress={(e) => {
              e.stopPropagation();
              onChangeStatus(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color={themeColors.accent.tertiary} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextStatus]}>
              Estado
            </Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonEdit]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={themeColors.status.warning} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextEdit]}>
              Editar
            </Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDelete]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={themeColors.status.error} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDelete]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
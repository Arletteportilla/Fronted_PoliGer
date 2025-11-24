import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';

interface PolinizacionCardProps {
  item: any;
  onPress: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onViewDetails?: (item: any) => void;
}

export const PolinizacionCard: React.FC<PolinizacionCardProps> = ({ 
  item, 
  onPress,
  onEdit,
  onDelete,
  onViewDetails 
}) => {
  const responsive = useResponsive();

  // Determinar el estado actual de la polinización
  const getCurrentStatus = () => {
    if (item.fechamad) return 'Completado';
    if (item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) <= new Date()) return 'En Proceso';
    return 'Ingresado';
  };

  const currentStatus = getCurrentStatus();
  const isOverdue = item.prediccion_fecha_estimada && new Date(item.prediccion_fecha_estimada) < new Date() && !item.fechamad;

  // Calcular el progreso de la polinización
  const calculateProgress = () => {
    if (item.fechamad) return 100; // Completado
    if (item.fechapol) return 70; // En proceso
    return 30; // Ingresado
  };

  const progress = calculateProgress();

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
              backgroundColor: item.tipo_polinizacion === 'SELF' ? '#3B82F6' : 
                               item.tipo_polinizacion === 'SIBLING' ? '#8B5CF6' : '#F59E0B'
            }]}>
              <Text style={responsiveStyles.badgeText}>{item.tipo_polinizacion}</Text>
            </View>
          )}
        </View>
        <View style={[styles.tableCell, styles.cellFlex]}>
          <Text style={styles.codigoText} numberOfLines={1} ellipsizeMode="tail">
            {codigoCompleto}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <View style={[responsiveStyles.badge, styles.statusBadge, {
            backgroundColor: currentStatus === 'Completado' ? '#10B981' : 
                            currentStatus === 'En Proceso' ? '#F59E0B' : '#6B7280'
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
                <Ionicons name="partly-sunny" size={10} color="#fff" />
                <Text style={styles.climaText}>{item.clima}</Text>
              </View>
            </View>
          )}
          {(item.vivero || item.ubicacion) && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Ionicons name="location-outline" size={12} color="#94a3b8" />
              <Text style={styles.metaText}>
                {item.vivero ? `V-${item.vivero}` : item.ubicacion}
              </Text>
            </View>
          )}
          {item.responsable && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Ionicons name="person-outline" size={12} color="#94a3b8" />
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
            <Ionicons name="analytics-outline" size={14} color="#3B82F6" />
            <Text style={styles.prediccionTitle}>Predicción de Maduración</Text>
            {item.metodo_prediccion && (
              <View style={[styles.metodoBadge, {
                backgroundColor: item.metodo_prediccion === 'ML' ? '#10B981' : '#6B7280'
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
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
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
                <Ionicons name="time-outline" size={12} color="#6B7280" />
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
                  <Ionicons name="hourglass-outline" size={12} color="#F59E0B" />
                  <Text style={styles.prediccionLabel}>Días faltantes:</Text>
                  <Text style={[styles.prediccionValue, styles.diasFaltantes]}>
                    {diasFaltantes} días
                  </Text>
                </View>
              ) : diasFaltantes === 0 ? (
                <View style={styles.prediccionRow}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={[styles.prediccionValue, styles.diasHoy]}>
                    ¡Hoy es el día estimado!
                  </Text>
                </View>
              ) : (
                <View style={styles.prediccionRow}>
                  <Ionicons name="alert-circle" size={12} color="#EF4444" />
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
                  <Ionicons name="shield-checkmark-outline" size={12} color="#6B7280" />
                  <Text style={styles.prediccionLabel}>Confianza:</Text>
                  <Text style={[styles.prediccionValue, {
                    color: confianza >= 80 ? '#10B981' : 
                           confianza >= 60 ? '#F59E0B' : '#EF4444'
                  }]}>
                    {confianza.toFixed(0)}%
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      )}

      {/* Barra de progreso */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressPercentage}>{progress}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progress}%`,
                backgroundColor: currentStatus === 'Completado' ? '#10B981' : 
                                currentStatus === 'En Proceso' ? '#F59E0B' : '#6B7280'
              }
            ]}
          />
        </View>
      </View>

      {/* Advertencia de vencimiento */}
      {isOverdue && (
        <View style={styles.overdueRow}>
          <Ionicons name="warning" size={14} color="#EF4444" />
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
            <Ionicons name="eye-outline" size={18} color="#3B82F6" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextView]}>
              Ver
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
            <Ionicons name="create-outline" size={18} color="#F59E0B" />
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
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDelete]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardOverdue: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
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
    color: '#182d49',
    letterSpacing: 0.2,
  },
  rowText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 18,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  valueText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  badgeText: {
    color: '#fff',
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  climaText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    gap: 6,
  },
  overdueText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  prediccionSection: {
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F0F9FF',
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
    color: '#1E40AF',
    flex: 1,
  },
  metodoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metodoText: {
    color: '#fff',
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
    color: '#6B7280',
  },
  prediccionValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  diasFaltantes: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  diasHoy: {
    color: '#10B981',
    fontWeight: '700',
  },
  diasVencido: {
    color: '#EF4444',
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
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
    borderTopColor: '#E5E7EB',
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
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionButtonEdit: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  actionButtonDelete: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextView: {
    color: '#3B82F6',
  },
  actionButtonTextEdit: {
    color: '#F59E0B',
  },
  actionButtonTextDelete: {
    color: '#EF4444',
  },
});
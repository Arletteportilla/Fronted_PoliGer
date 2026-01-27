// Reusable germinacion card component - matching PolinizacionCard styles
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks/useResponsive';
import { calcularDiasRestantes, getEstadoPrediccion } from '@/utils/prediccionHelpers';
import { ValidarPrediccionGerminacionModal } from '../modals/ValidarPrediccionGerminacionModal';
import { EstadoProgressBar } from '@/components/common/EstadoProgressBar';

interface GerminacionCardProps {
  item: any;
  onPress: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onViewDetails?: (item: any) => void;
  onChangeStatus?: (item: any) => void;
  onValidacionExitosa?: (germinacion: any) => void;
}

export const GerminacionCard: React.FC<GerminacionCardProps> = ({
  item,
  onPress,
  onEdit,
  onDelete,
  onViewDetails,
  onChangeStatus,
  onValidacionExitosa,
}) => {
  const responsive = useResponsive();
  const [showValidarModal, setShowValidarModal] = useState(false);

  const diasRestantes = item.prediccion_fecha_estimada || item.fecha_germinacion_estimada
    ? calcularDiasRestantes(item.prediccion_fecha_estimada || item.fecha_germinacion_estimada)
    : null;

  const estadoPrediccion = getEstadoPrediccion(diasRestantes);
  const isOverdue = diasRestantes !== null && diasRestantes < 0;

  // Helper para limpiar valores "nan" o null
  const cleanValue = (value: any): string | null => {
    if (!value || value === 'nan' || value === 'null' || value === '') return null;
    return String(value).trim();
  };

  // Construir información completa
  const codigoCompleto = cleanValue(item.nombre) || cleanValue(item.codigo) || 'Sin código';
  const especieCompleta = cleanValue(item.especie_variedad) || cleanValue(item.especie) || 'Sin especie';
  const generoCompleto = cleanValue(item.genero) || 'Sin género';

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Sin fecha';
    }
  };

  const fechaFormateada = formatDate(item.fecha_creacion || item.fecha_ingreso || item.fecha_siembra);

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
      {/* Fila 1: Tipo (si existe), Código, Estado */}
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
      {(item.estado_capsulas || item.numero_vivero || item.percha || item.nivel || item.responsable) && (
        <View style={styles.tableRow}>
          {item.estado_capsulas && (
            <View style={styles.tableCell}>
              <View style={styles.climaBadge}>
                <Ionicons name="ellipse" size={10} color="#fff" />
                <Text style={styles.climaText}>{item.estado_capsulas}</Text>
              </View>
            </View>
          )}
          {(item.numero_vivero || item.percha || item.nivel) && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Ionicons name="location-outline" size={12} color="#94a3b8" />
              <Text style={styles.metaText}>
                {item.numero_vivero ? `V-${item.numero_vivero}` : item.percha || item.nivel || 'N/A'}
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

      {/* Fila 5: Estadísticas (Cápsulas, Disponibles, Semilla) */}
      {(item.no_capsulas || item.numero_capsulas || item.disponibles !== undefined || item.cantidad_semilla) && (
        <View style={styles.tableRow}>
          {(item.no_capsulas || item.numero_capsulas) && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Text style={styles.labelText}>Cápsulas:</Text>
              <Text style={styles.valueText}>{item.no_capsulas || item.numero_capsulas || 0}</Text>
            </View>
          )}
          {item.disponibles !== undefined && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Text style={styles.labelText}>Disponibles:</Text>
              <Text style={styles.valueText}>{item.disponibles}</Text>
            </View>
          )}
          {item.cantidad_semilla && (
            <View style={[styles.tableCell, styles.cellFlex]}>
              <Text style={styles.labelText}>Semilla:</Text>
              <Text style={styles.valueText}>{item.cantidad_semilla}</Text>
            </View>
          )}
        </View>
      )}

      {/* Barra de progreso por etapas */}
      {item.estado_germinacion && (
        <View style={{
          marginTop: 8,
          borderRadius: 12,
          paddingVertical: 4
        }}>
          <EstadoProgressBar
            estadoActual={item.estado_germinacion as 'INICIAL' | 'EN_PROCESO_TEMPRANO' | 'EN_PROCESO_AVANZADO' | 'FINALIZADO'}
            tipo="germinacion"
          />
        </View>
      )}

      {/* Fecha estimada de germinación */}
      {(item.prediccion_fecha_estimada || item.fecha_germinacion_estimada) && (
        <View style={styles.prediccionSection}>
          <View style={styles.prediccionHeader}>
            <Ionicons 
              name={diasRestantes !== null && diasRestantes < 0 ? "alert-circle" : 
                    diasRestantes !== null && diasRestantes <= 7 ? "time" : "calendar"} 
              size={16} 
              color={diasRestantes !== null && diasRestantes < 0 ? "#EF4444" : 
                     diasRestantes !== null && diasRestantes <= 7 ? "#F59E0B" : "#10B981"} 
            />
            <Text style={styles.prediccionLabel}>Germinación Estimada</Text>
          </View>
          <View style={styles.prediccionContent}>
            <Text style={styles.prediccionFecha}>
              {formatDate(item.prediccion_fecha_estimada || item.fecha_germinacion_estimada)}
            </Text>
            {diasRestantes !== null && (
              <Text style={[
                styles.prediccionDias,
                {
                  color: diasRestantes < 0 ? "#EF4444" : 
                         diasRestantes <= 7 ? "#F59E0B" : "#10B981"
                }
              ]}>
                {diasRestantes < 0 
                  ? `Vencida hace ${Math.abs(diasRestantes)} días` 
                  : diasRestantes === 0 
                    ? "Hoy" 
                    : `En ${diasRestantes} días`}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Advertencia de vencimiento */}
      {isOverdue && (
        <View style={styles.overdueRow}>
          <Ionicons name="warning" size={14} color="#EF4444" />
          <Text style={styles.overdueText}>Vencido</Text>
        </View>
      )}

      {/* Badge de predicción validada */}
      {item.estado_validacion === 'VALIDADA' && item.precision_prediccion && (
        <View style={styles.validadaSection}>
          <View style={styles.validadaBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
            <Text style={styles.validadaText}>
              Validada ({item.precision_prediccion ?
                (typeof item.precision_prediccion === 'number'
                  ? item.precision_prediccion.toFixed(0)
                  : Math.round(parseFloat(item.precision_prediccion))
                ) : '0'}%)
            </Text>
          </View>
          {item.calidad_prediccion && (
            <Text style={styles.calidadText}>
              Calidad: {item.calidad_prediccion}
            </Text>
          )}
        </View>
      )}

      {/* Botón de validar predicción */}
      {item.prediccion_dias_estimados &&
       item.estado_validacion !== 'VALIDADA' &&
       progress === 100 && (
        <TouchableOpacity
          style={styles.validarButton}
          onPress={(e) => {
            e.stopPropagation();
            setShowValidarModal(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-done-outline" size={18} color="#4caf50" />
          <Text style={styles.validarButtonText}>Validar Predicción</Text>
        </TouchableOpacity>
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

        {onChangeStatus && item.etapa_actual !== 'FINALIZADO' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonStatus]}
            onPress={(e) => {
              e.stopPropagation();
              onChangeStatus(item);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color="#8B5CF6" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextStatus]}>
              Estado
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

      {/* Modal de validación de predicción */}
      <ValidarPrediccionGerminacionModal
        visible={showValidarModal}
        germinacion={item}
        onClose={() => setShowValidarModal(false)}
        onValidacionExitosa={(germinacionActualizada) => {
          setShowValidarModal(false);
          onValidacionExitosa?.(germinacionActualizada);
        }}
      />
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
  prediccionSection: {
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  prediccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  prediccionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prediccionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prediccionFecha: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182d49',
  },
  prediccionDias: {
    fontSize: 12,
    fontWeight: '600',
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
  actionButtonStatus: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
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
  actionButtonTextStatus: {
    color: '#8B5CF6',
  },
  actionButtonTextDelete: {
    color: '#EF4444',
  },
  validadaSection: {
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  validadaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validadaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  calidadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4caf50',
    marginTop: 4,
  },
  validarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 8,
  },
  validarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

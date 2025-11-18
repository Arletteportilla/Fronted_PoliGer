import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IndicadorConfianza } from '@/components/common';

interface PrediccionGerminacionCardProps {
  germinacion: {
    id: number;
    codigo: string;
    especie: string;
    genero?: string;
    fecha_germinacion_estimada?: string;
    dias_estimados_germinacion?: number;
    confianza_prediccion?: number;
    modelo_utilizado?: 'ML' | 'HEURISTIC';
    fecha_siembra?: string;
    estado_seguimiento?: 'PENDIENTE' | 'EN_REVISION' | 'COMPLETADA' | 'VENCIDA';
  };
  onPress?: () => void;
  onCalcularPrediccion?: () => void;
  showActions?: boolean;
}

export const PrediccionGerminacionCard: React.FC<PrediccionGerminacionCardProps> = ({
  germinacion,
  onPress,
  onCalcularPrediccion,
  showActions = true
}) => {
  const calcularDiasRestantes = () => {
    if (!germinacion.fecha_germinacion_estimada) return null;
    
    const hoy = new Date();
    const fechaEstimada = new Date(germinacion.fecha_germinacion_estimada);
    const diferencia = Math.ceil((fechaEstimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferencia;
  };

  const getEstadoInfo = () => {
    const diasRestantes = calcularDiasRestantes();
    
    if (diasRestantes === null) {
      return {
        estado: 'sin_prediccion',
        color: '#6c757d',
        icon: 'help-circle-outline' as const,
        mensaje: 'Sin predicción',
        urgencia: 'none'
      };
    }

    if (diasRestantes < 0) {
      return {
        estado: 'vencida',
        color: '#dc3545',
        icon: 'warning-outline' as const,
        mensaje: `Vencida hace ${Math.abs(diasRestantes)} días`,
        urgencia: 'high'
      };
    }

    if (diasRestantes === 0) {
      return {
        estado: 'hoy',
        color: '#28a745',
        icon: 'today-outline' as const,
        mensaje: 'Debería germinar hoy',
        urgencia: 'high'
      };
    }

    if (diasRestantes <= 3) {
      return {
        estado: 'muy_pronto',
        color: '#17a2b8',
        icon: 'time-outline' as const,
        mensaje: `${diasRestantes} días restantes`,
        urgencia: 'high'
      };
    }

    if (diasRestantes <= 7) {
      return {
        estado: 'pronto',
        color: '#ffc107',
        icon: 'calendar-outline' as const,
        mensaje: `${diasRestantes} días restantes`,
        urgencia: 'medium'
      };
    }

    return {
      estado: 'futuro',
      color: '#6c757d',
      icon: 'calendar-outline' as const,
      mensaje: `${diasRestantes} días restantes`,
      urgencia: 'low'
    };
  };

  const getNivelConfianza = (confianza?: number): 'alta' | 'media' | 'baja' => {
    if (!confianza) return 'baja';
    if (confianza >= 85) return 'alta';
    if (confianza >= 70) return 'media';
    return 'baja';
  };

  const getEstadoSeguimientoInfo = (estado?: string) => {
    switch (estado) {
      case 'EN_REVISION':
        return { color: '#17a2b8', icon: 'eye-outline' as const, texto: 'En revisión' };
      case 'COMPLETADA':
        return { color: '#28a745', icon: 'checkmark-circle-outline' as const, texto: 'Completada' };
      case 'VENCIDA':
        return { color: '#dc3545', icon: 'close-circle-outline' as const, texto: 'Vencida' };
      default:
        return { color: '#6c757d', icon: 'time-outline' as const, texto: 'Pendiente' };
    }
  };

  const estadoInfo = getEstadoInfo();
  const estadoSeguimiento = getEstadoSeguimientoInfo(germinacion.estado_seguimiento);
  const nivelConfianza = getNivelConfianza(germinacion.confianza_prediccion);

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        estadoInfo.urgencia === 'high' && styles.cardUrgent,
        estadoInfo.urgencia === 'medium' && styles.cardMedium
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header con código y estado */}
      <View style={styles.header}>
        <View style={styles.codigoContainer}>
          <Text style={styles.codigo}>{germinacion.codigo}</Text>
          <Text style={styles.especie}>{germinacion.especie}</Text>
          {germinacion.genero && (
            <Text style={styles.genero}>({germinacion.genero})</Text>
          )}
        </View>
        
        <View style={[styles.estadoBadge, { backgroundColor: estadoSeguimiento.color }]}>
          <Ionicons name={estadoSeguimiento.icon} size={12} color="#fff" />
          <Text style={styles.estadoTexto}>{estadoSeguimiento.texto}</Text>
        </View>
      </View>

      {/* Predicción principal */}
      {germinacion.fecha_germinacion_estimada ? (
        <View style={styles.prediccionContainer}>
          <View style={styles.fechaContainer}>
            <Ionicons name={estadoInfo.icon} size={20} color={estadoInfo.color} />
            <View style={styles.fechaInfo}>
              <Text style={styles.fechaEstimada}>
                {new Date(germinacion.fecha_germinacion_estimada).toLocaleDateString('es-ES')}
              </Text>
              <Text style={[styles.estadoMensaje, { color: estadoInfo.color }]}>
                {estadoInfo.mensaje}
              </Text>
            </View>
          </View>

          {/* Indicador de confianza */}
          {germinacion.confianza_prediccion && (
            <View style={styles.confianzaContainer}>
              <IndicadorConfianza
                confianza={germinacion.confianza_prediccion}
                nivel={nivelConfianza}
                modelo={germinacion.modelo_utilizado || 'HEURISTIC'}
                size="small"
                showModel={true}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.sinPrediccionContainer}>
          <Ionicons name="help-circle-outline" size={24} color="#6c757d" />
          <Text style={styles.sinPrediccionTexto}>Sin predicción calculada</Text>
          {showActions && onCalcularPrediccion && (
            <TouchableOpacity 
              style={styles.calcularButton}
              onPress={onCalcularPrediccion}
            >
              <Ionicons name="calculator-outline" size={16} color="#e9ad14" />
              <Text style={styles.calcularButtonText}>Calcular</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoAdicional}>
        {germinacion.dias_estimados_germinacion && (
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoTexto}>
              {germinacion.dias_estimados_germinacion} días estimados
            </Text>
          </View>
        )}
        
        {germinacion.fecha_siembra && (
          <View style={styles.infoItem}>
            <Ionicons name="leaf-outline" size={14} color="#666" />
            <Text style={styles.infoTexto}>
              Siembra: {new Date(germinacion.fecha_siembra).toLocaleDateString('es-ES')}
            </Text>
          </View>
        )}
      </View>

      {/* Indicador de urgencia visual */}
      {estadoInfo.urgencia === 'high' && (
        <View style={[styles.urgenciaIndicator, { backgroundColor: estadoInfo.color }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#e9ecef',
    position: 'relative',
  },
  cardUrgent: {
    borderLeftColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  cardMedium: {
    borderLeftColor: '#ffc107',
    backgroundColor: '#fffbf0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codigoContainer: {
    flex: 1,
  },
  codigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 2,
  },
  especie: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  genero: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  prediccionContainer: {
    marginBottom: 12,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fechaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fechaEstimada: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182d49',
  },
  estadoMensaje: {
    fontSize: 12,
    marginTop: 2,
  },
  confianzaContainer: {
    marginTop: 8,
  },
  sinPrediccionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  sinPrediccionTexto: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    flex: 1,
  },
  calcularButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ad14',
  },
  calcularButtonText: {
    fontSize: 12,
    color: '#e9ad14',
    fontWeight: '600',
    marginLeft: 4,
  },
  infoAdicional: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTexto: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  urgenciaIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
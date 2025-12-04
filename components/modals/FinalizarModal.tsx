import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

interface FinalizarModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (fecha: string) => Promise<void>;
  item: {
    codigo?: string | null;
    nombre?: string | null;
    nueva_codigo?: string | null;
    especie?: string | null;
    especie_variedad?: string | null;
    nueva_especie?: string | null;
    fecha_siembra?: string;
    fechapol?: string;
    prediccion_fecha_estimada?: string;
    fecha_maduracion_predicha?: string;
  } | null;
  tipo: 'germinacion' | 'polinizacion';
}

export const FinalizarModal: React.FC<FinalizarModalProps> = ({
  visible,
  onClose,
  onConfirm,
  item,
  tipo,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  // Obtener información según el tipo
  const codigo = item.codigo || item.nueva_codigo || item.nombre || 'N/A';
  const especie = tipo === 'germinacion'
    ? item.especie_variedad
    : (item.nueva_especie || item.especie);
  const fechaInicio = tipo === 'germinacion' ? item.fecha_siembra : item.fechapol;
  const fechaPredicha = tipo === 'germinacion' 
    ? item.prediccion_fecha_estimada 
    : (item.fecha_maduracion_predicha || item.prediccion_fecha_estimada);

  const hoy = new Date().toISOString().split('T')[0];
  const fechaSeleccionada = selectedDate || hoy;

  const titulo = tipo === 'germinacion' 
    ? 'Finalizar Germinación'
    : 'Finalizar Polinización';

  const labelFechaInicio = tipo === 'germinacion'
    ? 'Fecha de siembra'
    : 'Fecha de polinización';

  const handleConfirm = async () => {
    if (!fechaSeleccionada) {
      alert('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(fechaSeleccionada);
      setSelectedDate('');
      onClose();
    } catch (error) {
      console.error('Error finalizando:', error);
      alert(`Error al finalizar la ${tipo}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate('');
    onClose();
  };

  // Calcular diferencia de días
  const calcularDiferenciaDias = () => {
    if (!fechaPredicha || !fechaSeleccionada) return null;

    const fechaPred = new Date(fechaPredicha);
    const fechaSel = new Date(fechaSeleccionada);
    const diffTime = fechaSel.getTime() - fechaPred.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const diferenciaDias = calcularDiferenciaDias();

  // Marcar fechas en el calendario
  const markedDates: any = {};

  if (fechaPredicha) {
    markedDates[fechaPredicha] = {
      marked: true,
      dotColor: '#3B82F6',
      customStyles: {
        container: {
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          borderWidth: 2,
        },
        text: {
          color: '#1E40AF',
          fontWeight: 'bold',
        },
      },
    };
  }

  if (fechaSeleccionada) {
    markedDates[fechaSeleccionada] = {
      ...markedDates[fechaSeleccionada],
      selected: true,
      selectedColor: '#10B981',
      customStyles: {
        container: {
          backgroundColor: '#10B981',
        },
        text: {
          color: '#FFFFFF',
          fontWeight: 'bold',
        },
      },
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              </View>
              <Text style={styles.title}>{titulo}</Text>
              <Text style={styles.subtitle}>{codigo}</Text>
            </View>

            {/* Información */}
            <View style={styles.infoSection}>
              {especie && (
                <View style={styles.infoRow}>
                  <Ionicons name="leaf-outline" size={16} color="#6B7280" />
                  <Text style={styles.infoLabel}>Especie:</Text>
                  <Text style={styles.infoValue}>{especie}</Text>
                </View>
              )}
              {fechaInicio && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.infoLabel}>{labelFechaInicio}:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(fechaInicio).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
            </View>

            {/* Predicción vs Realidad */}
            {fechaPredicha && (
              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonTitle}>Predicción vs Realidad</Text>
                
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonItem}>
                    <Ionicons name="analytics-outline" size={20} color="#3B82F6" />
                    <Text style={styles.comparisonLabel}>Predicción</Text>
                    <Text style={styles.comparisonValue}>
                      {new Date(fechaPredicha).toLocaleDateString('es-ES')}
                    </Text>
                  </View>

                  <Ionicons name="arrow-forward" size={24} color="#9CA3AF" />

                  <View style={styles.comparisonItem}>
                    <Ionicons name="calendar-outline" size={20} color="#10B981" />
                    <Text style={styles.comparisonLabel}>Realidad</Text>
                    <Text style={styles.comparisonValue}>
                      {fechaSeleccionada
                        ? new Date(fechaSeleccionada).toLocaleDateString('es-ES')
                        : 'Seleccionar'}
                    </Text>
                  </View>
                </View>

                {diferenciaDias !== null && (
                  <View style={styles.differenceContainer}>
                    <Text style={styles.differenceLabel}>Diferencia:</Text>
                    <Text
                      style={[
                        styles.differenceValue,
                        {
                          color:
                            diferenciaDias === 0
                              ? '#10B981'
                              : Math.abs(diferenciaDias) <= 3
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      {diferenciaDias === 0
                        ? '¡Exacto!'
                        : diferenciaDias > 0
                        ? `+${diferenciaDias} días`
                        : `${diferenciaDias} días`}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Calendario */}
            <View style={styles.calendarSection}>
              <Text style={styles.calendarTitle}>Selecciona la fecha</Text>
              <Calendar
                current={hoy}
                maxDate={hoy}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                markingType="custom"
                theme={{
                  todayTextColor: '#10B981',
                  selectedDayBackgroundColor: '#10B981',
                  selectedDayTextColor: '#FFFFFF',
                  arrowColor: '#3B82F6',
                  monthTextColor: '#1F2937',
                  textMonthFontWeight: 'bold',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                }}
              />
              
              {fechaPredicha && (
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendText}>Fecha predicha</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Fecha seleccionada</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={loading || !fechaSeleccionada}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  comparisonSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  comparisonValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  differenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
  },
  differenceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarSection: {
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

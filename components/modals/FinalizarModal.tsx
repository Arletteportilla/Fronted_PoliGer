import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

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
    fecha_germinacion_estimada?: string;
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
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resetear fecha al abrir el modal
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
    }
  }, [visible]);

  if (!item) return null;

  // Obtener información según el tipo
  const codigo = item.codigo || item.nueva_codigo || item.nombre || 'N/A';
  const especie = tipo === 'germinacion'
    ? item.especie_variedad
    : (item.nueva_especie || item.especie);
  const fechaInicio = tipo === 'germinacion' ? item.fecha_siembra : item.fechapol;

  // Intentar múltiples campos de predicción
  const fechaPredicha = tipo === 'germinacion'
    ? (item.prediccion_fecha_estimada || item.fecha_germinacion_estimada)
    : (item.fecha_maduracion_predicha || item.prediccion_fecha_estimada);

  const titulo = tipo === 'germinacion'
    ? 'Finalizar Germinación'
    : 'Finalizar Polinización';

  const labelFechaInicio = tipo === 'germinacion'
    ? 'Fecha de siembra'
    : 'Fecha de polinización';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const fechaISO = selectedDate.toISOString().split('T')[0] ?? '';
      await onConfirm(fechaISO);
      onClose();
    } catch (error) {
      console.error('Error finalizando:', error);
      alert(`Error al finalizar la ${tipo}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate(new Date());
    onClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

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
                <Ionicons name="checkmark-circle" size={40} color={themeColors.status.success} />
              </View>
              <Text style={styles.title}>{titulo}</Text>
              <Text style={styles.subtitle}>{codigo}</Text>
            </View>

            {/* Información */}
            <View style={styles.infoSection}>
              {especie && (
                <View style={styles.infoRow}>
                  <Ionicons name="leaf-outline" size={18} color={themeColors.text.tertiary} />
                  <Text style={styles.infoLabel}>Especie:</Text>
                  <Text style={styles.infoValue}>{especie}</Text>
                </View>
              )}
              {fechaInicio && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={themeColors.text.tertiary} />
                  <Text style={styles.infoLabel}>{labelFechaInicio}:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(fechaInicio).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Fechas - Lado a lado */}
            <View style={styles.datesContainer}>
              {/* Fecha de Finalización */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>Fecha de Finalización</Text>
                <TouchableOpacity
                  style={styles.dateInputButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {selectedDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={themeColors.text.tertiary} />
                </TouchableOpacity>
                <View style={styles.autoTextContainer}>
                  <Ionicons name="information-circle-outline" size={12} color={themeColors.text.tertiary} />
                  <Text style={styles.autoText}>Automático: Hoy.</Text>
                </View>
              </View>

              {/* Fecha de Predicción */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>Fecha de Predicción</Text>
                {fechaPredicha ? (
                  <View style={styles.datePredictedBox}>
                    <Text style={styles.datePredictedText}>
                      {new Date(fechaPredicha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.datePredictedBox}>
                    <Text style={[styles.datePredictedText, { color: themeColors.text.tertiary }]}>
                      Sin predicción
                    </Text>
                  </View>
                )}
              </View>
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
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={themeColors.text.inverse} />
                    <Text style={styles.confirmButtonText}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              locale="es-ES"
            />
          )}

          {/* iOS DatePicker Done Button */}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.iosPickerButtonContainer}>
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.iosPickerButtonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    padding: 24,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  dateInputText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '400',
    flex: 1,
  },
  autoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  autoText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  datePredictedBox: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  datePredictedText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '400',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  confirmButton: {
    backgroundColor: colors.status.success,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  iosPickerButtonContainer: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  iosPickerButton: {
    backgroundColor: colors.status.success,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  iosPickerButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
});

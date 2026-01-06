import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SimpleCalendarPicker } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';

interface DateFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (fechaDesde?: string, fechaHasta?: string) => void;
  tipo: 'germinacion' | 'polinizacion';
  fechaDesde?: string;
  fechaHasta?: string;
}

export const DateFilterModal: React.FC<DateFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  tipo,
  fechaDesde: initialFechaDesde,
  fechaHasta: initialFechaHasta,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  const [fechaDesde, setFechaDesde] = useState<string>(initialFechaDesde || '');
  const [fechaHasta, setFechaHasta] = useState<string>(initialFechaHasta || '');

  useEffect(() => {
    if (visible) {
      setFechaDesde(initialFechaDesde || '');
      setFechaHasta(initialFechaHasta || '');
    }
  }, [visible, initialFechaDesde, initialFechaHasta]);

  const handleClear = () => {
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleApply = () => {
    onApply(fechaDesde || undefined, fechaHasta || undefined);
    onClose();
  };

  const fechaLabel = tipo === 'germinacion' ? 'Fecha de Siembra' : 'Fecha de Polinización';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtrar por {fechaLabel}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={themeColors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.dateRow}>
              <View style={styles.dateColumn}>
                <Text style={styles.label}>Desde</Text>
                <SimpleCalendarPicker
                  value={fechaDesde}
                  onDateChange={setFechaDesde}
                  placeholder="Seleccionar fecha"
                />
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.label}>Hasta</Text>
                <SimpleCalendarPicker
                  value={fechaHasta}
                  onDateChange={setFechaHasta}
                  placeholder="Seleccionar fecha"
                />
              </View>
            </View>

            {(fechaDesde || fechaHasta) && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Ionicons name="close-circle" size={18} color={themeColors.text.tertiary} />
                <Text style={styles.clearButtonText}>Limpiar fechas</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Ionicons name="checkmark" size={20} color={themeColors.text.inverse} />
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.primary,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});


import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SimpleCalendarPicker } from '@/components/common';
import { ExportSelector } from './ExportSelector';
import { useExport } from '@/hooks/useExport';
import type { ExportEntity } from '@/types/export.types';

const COLORS = {
  navy: '#182d49',
  gold: '#e9ad14',
  white: '#ffffff',
};

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  defaultEntity?: ExportEntity;
  allowEntitySelection?: boolean;
  title?: string;
  defaultFechaInicio?: string;
  defaultFechaFin?: string;
}

/**
 * Componente modal reutilizable para exportar datos
 * Puede usarse en cualquier pantalla que necesite exportación
 */
export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  defaultEntity = 'germinaciones',
  allowEntitySelection = false,
  title = 'Exportar Reporte',
  defaultFechaInicio,
  defaultFechaFin,
}) => {
  const {
    isExporting,
    tipoEntidad,
    formatoReporte,
    incluirEstadisticas,
    fechaInicio,
    fechaFin,
    setTipoEntidad,
    setFormatoReporte,
    setIncluirEstadisticas,
    setFechaInicio,
    setFechaFin,
    executeExport,
  } = useExport({ 
    defaultEntity,
    defaultFechaInicio,
    defaultFechaFin,
  });

  const handleExport = async () => {
    try {
      await executeExport();
      onClose();
    } catch (error) {
      // El error ya se maneja en el hook
      logger.error('Error en exportación:', error);
    }
  };

  // Opciones de selección
  const entityOptions = [
    { label: 'Germinaciones', value: 'germinaciones' },
    { label: 'Polinizaciones', value: 'polinizaciones' },
    { label: 'Ambos', value: 'ambos' },
  ];

  const formatOptions = [
    { label: 'Excel (.xlsx)', value: 'excel' },
    { label: 'PDF', value: 'pdf' },
  ];

  const statsOptions = [
    { label: 'Con estadísticas y gráficos', value: 'si' },
    { label: 'Solo datos (Excel normal)', value: 'no' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>

          {/* Selector de entidad (opcional) */}
          {allowEntitySelection && (
            <ExportSelector
              label="¿Qué quieres exportar?"
              value={tipoEntidad}
              options={entityOptions}
              onChange={setTipoEntidad}
            />
          )}

          {/* Selector de formato */}
          <ExportSelector
            label="Formato:"
            value={formatoReporte}
            options={formatOptions}
            onChange={setFormatoReporte}
          />

          {/* Selector de estadísticas */}
          <ExportSelector
            label="¿Cómo quieres el reporte?"
            value={incluirEstadisticas}
            options={statsOptions}
            onChange={setIncluirEstadisticas}
          />

          {/* Rango de fechas */}
          <Text style={styles.label}>Rango de fechas:</Text>
          <View style={styles.datesContainer}>
            <SimpleCalendarPicker
              label="Desde"
              value={fechaInicio}
              onDateChange={setFechaInicio}
              placeholder="Seleccionar fecha inicio"
              required={true}
            />
            <SimpleCalendarPicker
              label="Hasta"
              value={fechaFin}
              onDateChange={setFechaFin}
              placeholder="Seleccionar fecha fin"
              required={true}
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={isExporting}
            >
              <Text style={styles.exportButtonText}>
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: 340,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.navy,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  datesContainer: {
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: COLORS.navy,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

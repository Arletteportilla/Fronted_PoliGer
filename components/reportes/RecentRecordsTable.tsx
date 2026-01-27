import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Record {
  id: string;
  tipo: 'Polinización' | 'Germinación';
  plantaMadre: string;
  fecha: string;
  estado: 'Exitoso' | 'En Proceso' | 'Pendiente';
  color: string;
}

interface RecentRecordsTableProps {
  records?: Record[];
  title?: string;
  onViewAll?: () => void;
}

export const RecentRecordsTable: React.FC<RecentRecordsTableProps> = ({
  records = [],
  title = 'Últimos Registros',
  onViewAll,
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  // Datos de ejemplo si no hay datos
  const tableData: Record[] = records.length > 0 ? records : [
    { id: '#LOT-2023-89', tipo: 'Polinización', plantaMadre: 'Cattleya Rex', fecha: '12 Oct. 2023', estado: 'Exitoso', color: themeColors.primary.main },
    { id: '#LOT-2023-88', tipo: 'Germinación', plantaMadre: 'Dracula Simia', fecha: '11 Oct. 2023', estado: 'En Proceso', color: themeColors.accent.primary },
    { id: '#LOT-2023-87', tipo: 'Polinización', plantaMadre: 'Masdevallia', fecha: '10 Oct. 2023', estado: 'Pendiente', color: themeColors.status.warning },
    { id: '#LOT-2023-86', tipo: 'Germinación', plantaMadre: 'Cattleya Maxima', fecha: '09 Oct. 2023', estado: 'Exitoso', color: themeColors.primary.main },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Exitoso':
        return themeColors.primary.main;
      case 'En Proceso':
        return themeColors.accent.primary;
      case 'Pendiente':
        return themeColors.status.warning;
      default:
        return themeColors.text.tertiary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Ver Todos</Text>
            <Ionicons name="arrow-forward" size={16} color={themeColors.primary.main} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colId]}>CÓDIGO</Text>
        <Text style={[styles.tableHeaderText, styles.colTipo]}>TIPO</Text>
        <Text style={[styles.tableHeaderText, styles.colPlanta]}>PLANTA MADRE</Text>
        <Text style={[styles.tableHeaderText, styles.colFecha]}>FECHA</Text>
        <Text style={[styles.tableHeaderText, styles.colEstado]}>ESTADO</Text>
        <Text style={[styles.tableHeaderText, styles.colAccion]}>ACCIÓN</Text>
      </View>

      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
        {tableData.map((record, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.colId]}>
              <Text style={styles.idText}>{record.id}</Text>
            </View>

            <View style={[styles.tableCell, styles.colTipo]}>
              <View style={[styles.tipoBadge, {
                backgroundColor: record.tipo === 'Polinización' ? '#FEF3C7' : '#DBEAFE'
              }]}>
                <Text style={[styles.tipoText, {
                  color: record.tipo === 'Polinización' ? '#92400E' : '#1E40AF'
                }]}>
                  {record.tipo}
                </Text>
              </View>
            </View>

            <View style={[styles.tableCell, styles.colPlanta, styles.plantaCell]}>
              <View style={[styles.plantaDot, { backgroundColor: record.color }]} />
              <Text style={styles.plantaText}>{record.plantaMadre}</Text>
            </View>

            <View style={[styles.tableCell, styles.colFecha]}>
              <Text style={styles.tableCellText}>{record.fecha}</Text>
            </View>

            <View style={[styles.tableCell, styles.colEstado]}>
              <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor(record.estado)}20` }]}>
                <Text style={[styles.estadoText, { color: getEstadoColor(record.estado) }]}>
                  {record.estado}
                </Text>
              </View>
            </View>

            <View style={[styles.tableCell, styles.colAccion]}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="eye-outline" size={18} color={themeColors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.default,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    alignItems: 'center',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  colId: {
    flex: 1.2,
  },
  colTipo: {
    flex: 1,
  },
  colPlanta: {
    flex: 1.5,
  },
  colFecha: {
    flex: 1.2,
  },
  colEstado: {
    flex: 1.2,
  },
  colAccion: {
    flex: 0.8,
    alignItems: 'center',
  },
  idText: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  plantaCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plantaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  plantaText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
});

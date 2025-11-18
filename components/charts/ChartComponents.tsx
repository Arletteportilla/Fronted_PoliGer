import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Colores del tema
const COLORS = {
  navy: '#182d49',
  gold: '#e9ad14',
  white: '#ffffff',
};

// Configuración base para todos los gráficos
const baseChartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(233, 173, 20, ${opacity})`, // Gold
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray para labels
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: COLORS.gold,
    fill: '#ffffff',
  },
  propsForBackgroundLines: {
    strokeDasharray: '', // solid background lines
    stroke: 'rgba(229, 231, 235, 0.8)', // Gris claro para líneas de fondo
  },
};

interface BezierLineChartProps {
  data: Array<{ mes: string; total: number }>;
  title: string;
}

export const BezierLineChartComponent: React.FC<BezierLineChartProps> = ({ data, title }) => {
  // Formatear mes para mostrar solo nombre corto
  const formatMonth = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { month: 'short' });
  };

  // Preparar datos para el gráfico
  const labels = data.map(item => formatMonth(item.mes));
  const dataValues = data.map(item => item.total);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues.length > 0 ? dataValues : [0], // Evitar gráfico vacío
        color: (opacity = 1) => `rgba(233, 173, 20, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.chartContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.chartTitle}>{title}</Text>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="download-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
      {data.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth - 80} // Padding horizontal ajustado
          height={280}
          chartConfig={baseChartConfig}
          bezier // Curva suave
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={true}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Sin datos disponibles</Text>
        </View>
      )}
    </View>
  );
};

interface ProgressRingProps {
  tasaExito: number;
  metaPolinizaciones?: number;
  metaGerminaciones?: number;
  title: string;
}

export const ProgressRingComponent: React.FC<ProgressRingProps> = ({
  tasaExito,
  metaPolinizaciones,
  metaGerminaciones,
  title,
}) => {
  // Convertir porcentajes a valores entre 0 y 1
  const tasaExitoNormalizada = tasaExito / 100;

  // Calcular progreso de metas (si están disponibles)
  const metaPolinizacionesNormalizada = metaPolinizaciones ? Math.min(metaPolinizaciones / 100, 1) : 0;
  const metaGerminacionesNormalizada = metaGerminaciones ? Math.min(metaGerminaciones / 100, 1) : 0;

  // Preparar datos para el gráfico de anillos
  const progressData = {
    labels: ['Tasa de Éxito'],
    data: [tasaExitoNormalizada],
  };

  // Si hay metas, agregarlas
  if (metaPolinizaciones !== undefined || metaGerminaciones !== undefined) {
    if (metaPolinizaciones !== undefined) {
      progressData.labels.push('Meta Polinizaciones');
      progressData.data.push(metaPolinizacionesNormalizada);
    }
    if (metaGerminaciones !== undefined) {
      progressData.labels.push('Meta Germinaciones');
      progressData.data.push(metaGerminacionesNormalizada);
    }
  }

  return (
    <View style={styles.chartContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.chartTitle}>{title}</Text>
      </View>
      <ProgressChart
        data={progressData}
        width={screenWidth - 80}
        height={240}
        strokeWidth={20}
        radius={36}
        chartConfig={{
          ...baseChartConfig,
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1, index) => {
            // Diferentes colores para cada anillo
            const colors = [
              `rgba(233, 173, 20, ${opacity})`,  // Gold para tasa de éxito
              `rgba(16, 185, 129, ${opacity})`,   // Verde para meta polinizaciones
              `rgba(59, 130, 246, ${opacity})`,  // Azul para meta germinaciones
            ];
            return colors[index || 0];
          },
        }}
        hideLegend={false}
        style={styles.chart}
      />
      <View style={styles.progressStats}>
        <Text style={styles.progressLabel}>Tasa de Éxito: {tasaExito.toFixed(1)}%</Text>
        {metaPolinizaciones !== undefined && (
          <Text style={styles.progressLabel}>Meta Polinizaciones: {metaPolinizaciones}%</Text>
        )}
        {metaGerminaciones !== undefined && (
          <Text style={styles.progressLabel}>Meta Germinaciones: {metaGerminaciones}%</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
  progressStats: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  progressLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 4,
  },
});

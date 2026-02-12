import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { downloadChartAsPNG } from '@/utils/chartExport';

interface GrowthChartProps {
  data?: Array<{ mes: string; total: number }>;
  dataPolinizaciones?: Array<{ mes: string; total: number }>;
  title?: string;
  subtitle?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  data = [],
  dataPolinizaciones = [],
  title = 'Curva de Crecimiento',
  subtitle = 'Comparativa de polinizaciones y germinaciones por semana',
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [containerWidth, setContainerWidth] = useState(400);
  const chartHeight = 200;
  const padding = 40;
  const chartWidth = containerWidth - 40; // Restar padding del contenedor (20px cada lado)

  // Datos de ejemplo si no hay datos
  const chartDataGerminaciones = data.length > 0 ? data : [
    { mes: 'Sem 1', total: 20 },
    { mes: 'Sem 2', total: 35 },
    { mes: 'Sem 3', total: 45 },
    { mes: 'Sem 4', total: 38 },
    { mes: 'Sem 5', total: 55 },
    { mes: 'Sem 6', total: 70 },
  ];

  const chartDataPolinizaciones = dataPolinizaciones.length > 0 ? dataPolinizaciones : [
    { mes: 'Sem 1', total: 45 },
    { mes: 'Sem 2', total: 50 },
    { mes: 'Sem 3', total: 38 },
    { mes: 'Sem 4', total: 60 },
    { mes: 'Sem 5', total: 48 },
    { mes: 'Sem 6', total: 55 },
  ];

  // Calcular valor máximo considerando ambas series
  const maxValue = Math.max(
    ...chartDataGerminaciones.map(d => d.total),
    ...chartDataPolinizaciones.map(d => d.total)
  );

  // Calcular puntos para germinaciones
  const pointsGerminaciones = chartDataGerminaciones.map((item, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (chartDataGerminaciones.length - 1);
    const y = chartHeight - padding - ((item.total / maxValue) * (chartHeight - padding * 2));
    return { x, y, value: item.total, label: item.mes };
  });

  // Calcular puntos para polinizaciones
  const pointsPolinizaciones = chartDataPolinizaciones.map((item, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (chartDataPolinizaciones.length - 1);
    const y = chartHeight - padding - ((item.total / maxValue) * (chartHeight - padding * 2));
    return { x, y, value: item.total, label: item.mes };
  });

  // Crear path para la curva suave
  const createSmoothPath = (points: Array<{ x: number; y: number; value: number; label: string }>) => {
    if (points.length === 0) return '';

    const firstPoint = points[0];
    if (!firstPoint) return '';

    let path = `M ${firstPoint.x} ${firstPoint.y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      if (!current || !next) continue;

      const controlX = (current.x + next.x) / 2;

      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const handleDownload = () => {
    downloadChartAsPNG('growth-chart-container', 'curva-crecimiento');
  };

  return (
    <View style={styles.container} onLayout={handleLayout} nativeID="growth-chart-container">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color={themeColors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Polinizaciones</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: themeColors.primary.main }]} />
          <Text style={styles.legendText}>Germinaciones</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (chartHeight - padding * 2)) / 4;
          return (
            <Line
              key={i}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke={themeColors.border.light}
              strokeWidth="1"
            />
          );
        })}

        {/* Curva de Polinizaciones (amarilla) */}
        <Path
          d={createSmoothPath(pointsPolinizaciones)}
          stroke="#F59E0B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Curva de Germinaciones (azul) */}
        <Path
          d={createSmoothPath(pointsGerminaciones)}
          stroke={themeColors.primary.main}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Puntos en la curva de Polinizaciones */}
        {pointsPolinizaciones.map((point, index) => (
          <Circle
            key={`pol-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#F59E0B"
          />
        ))}

        {/* Puntos en la curva de Germinaciones */}
        {pointsGerminaciones.map((point, index) => (
          <Circle
            key={`ger-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={themeColors.primary.main}
          />
        ))}

        {/* Labels del eje X */}
        {pointsGerminaciones.map((point, index) => (
          <SvgText
            key={`label-${index}`}
            x={point.x}
            y={chartHeight - 10}
            fill={themeColors.text.disabled}
            fontSize="10"
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
        </Svg>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  chartWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  chart: {
    marginTop: 10,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
});

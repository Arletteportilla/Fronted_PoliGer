import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { downloadChartAsPNG } from '@/utils/chartExport';

interface MonthlyActivityChartProps {
  dataPolinizaciones?: Array<{ mes: string; total: number }>;
  dataGerminaciones?: Array<{ mes: string; total: number }>;
  title?: string;
}

const COLORS = {
  polinizaciones: '#F59E0B',
  germinaciones: '#4CAF50',
};

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({
  dataPolinizaciones = [],
  dataGerminaciones = [],
  title = 'Actividad Mensual',
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [containerWidth, setContainerWidth] = useState(400);
  const chartHeight = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  const formatMonthLabel = (dateStr: string | undefined): string => {
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    if (!dateStr) return '';
    try {
      if (dateStr.length <= 3) return dateStr;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return monthNames[date.getMonth()] ?? '';
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Combinar meses de ambas series
  const polData = dataPolinizaciones.slice(-5).map(item => ({
    mes: formatMonthLabel(item.mes),
    mesRaw: item.mes,
    total: item.total,
  }));

  const germData = dataGerminaciones.slice(-5).map(item => ({
    mes: formatMonthLabel(item.mes),
    mesRaw: item.mes,
    total: item.total,
  }));

  // Unir los meses únicos
  const allMonthsSet = new Set([...polData.map(d => d.mes), ...germData.map(d => d.mes)]);
  const allMonths = Array.from(allMonthsSet);

  const mergedData = allMonths.map(mes => ({
    mes,
    polinizaciones: polData.find(d => d.mes === mes)?.total ?? 0,
    germinaciones: germData.find(d => d.mes === mes)?.total ?? 0,
  }));

  const hasData = mergedData.length > 0 && mergedData.some(d => d.polinizaciones > 0 || d.germinaciones > 0);

  const totalPol = mergedData.reduce((sum, item) => sum + item.polinizaciones, 0);
  const totalGerm = mergedData.reduce((sum, item) => sum + item.germinaciones, 0);

  const chartWidth = containerWidth - 40;
  const allValues = mergedData.flatMap(d => [d.polinizaciones, d.germinaciones]);
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 1) : 1;
  const chartAreaHeight = chartHeight - padding.top - padding.bottom;

  // Cada grupo tiene 2 barras + espacio
  const groupCount = mergedData.length || 1;
  const groupWidth = (chartWidth - padding.left - padding.right) / groupCount;
  const barWidth = Math.min(groupWidth * 0.35, 30);
  const gap = 4;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const handleDownload = () => {
    downloadChartAsPNG('activity-chart-container', 'actividad-mensual');
  };

  return (
    <View style={styles.container} onLayout={handleLayout} nativeID="activity-chart-container">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {hasData
              ? `${totalPol} polinizaciones, ${totalGerm} germinaciones`
              : 'Sin datos disponibles'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color={themeColors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.polinizaciones }]} />
          <Text style={styles.legendText}>Polinizaciones</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.germinaciones }]} />
          <Text style={styles.legendText}>Germinaciones</Text>
        </View>
      </View>

      {!hasData ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Ionicons name="bar-chart-outline" size={48} color={themeColors.text.disabled} />
          <Text style={{ color: themeColors.text.tertiary, marginTop: 12, fontSize: 14 }}>
            No hay datos de actividad mensual
          </Text>
        </View>
      ) : (
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines horizontales */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding.top + (i * chartAreaHeight) / 4;
            const value = Math.round(maxValue - (i * maxValue) / 4);
            return (
              <React.Fragment key={i}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={themeColors.border.default}
                  strokeWidth="1"
                />
                <SvgText
                  x={padding.left - 10}
                  y={y + 4}
                  fill={themeColors.text.disabled}
                  fontSize="10"
                  textAnchor="end"
                >
                  {value}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Barras agrupadas */}
          {mergedData.map((item, index) => {
            const groupX = padding.left + index * groupWidth + groupWidth / 2;
            const polBarHeight = (item.polinizaciones / maxValue) * chartAreaHeight;
            const germBarHeight = (item.germinaciones / maxValue) * chartAreaHeight;

            return (
              <React.Fragment key={index}>
                {/* Barra polinizaciones */}
                <Rect
                  x={groupX - barWidth - gap / 2}
                  y={chartHeight - padding.bottom - polBarHeight}
                  width={barWidth}
                  height={Math.max(polBarHeight, 0)}
                  fill={COLORS.polinizaciones}
                  rx="4"
                  ry="4"
                />
                {/* Barra germinaciones */}
                <Rect
                  x={groupX + gap / 2}
                  y={chartHeight - padding.bottom - germBarHeight}
                  width={barWidth}
                  height={Math.max(germBarHeight, 0)}
                  fill={COLORS.germinaciones}
                  rx="4"
                  ry="4"
                />
                {/* Label del mes */}
                <SvgText
                  x={groupX}
                  y={chartHeight - padding.bottom + 20}
                  fill={themeColors.text.tertiary}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {item.mes}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  chartWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
});

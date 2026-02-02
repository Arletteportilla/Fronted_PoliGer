import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { downloadChartAsPNG } from '@/utils/chartExport';

interface MonthlyActivityChartProps {
  data?: Array<{ mes: string; total: number }>;
  title?: string;
}

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({
  data = [],
  title = 'Actividad Mensual',
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [containerWidth, setContainerWidth] = useState(400);
  const chartHeight = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  // Función para formatear fecha "YYYY-MM-DD" a nombre de mes abreviado
  const formatMonthLabel = (dateStr: string | undefined): string => {
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    if (!dateStr) return '';
    try {
      // Si ya es un nombre de mes corto, devolverlo
      if (dateStr.length <= 3) return dateStr;

      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return monthNames[date.getMonth()];
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Procesar datos del backend y formatear meses
  const processedData = data.length > 0
    ? data.slice(-5).map(item => ({
        mes: formatMonthLabel(item.mes),
        total: item.total
      }))
    : [
        { mes: 'AGO', total: 450 },
        { mes: 'SEP', total: 620 },
        { mes: 'OCT', total: 850 },
        { mes: 'NOV', total: 720 },
        { mes: 'DIC', total: 580 },
      ];

  const chartData = processedData;
  const isRealData = data.length > 0;
  const totalPolinizaciones = chartData.reduce((sum, item) => sum + item.total, 0);

  const chartWidth = containerWidth - 40;
  const maxValue = Math.max(...chartData.map(d => d.total), 1000);
  const barWidth = (chartWidth - padding.left - padding.right) / chartData.length - 20;
  const chartAreaHeight = chartHeight - padding.top - padding.bottom;

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
            {isRealData
              ? `${totalPolinizaciones.toLocaleString()} polinizaciones (últimos 5 meses)`
              : 'Datos de ejemplo - Sin datos disponibles'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color={themeColors.text.tertiary} />
        </TouchableOpacity>
      </View>

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

          {/* Barras */}
          {chartData.map((item, index) => {
            const barHeight = (item.total / maxValue) * chartAreaHeight;
            const x = padding.left + index * (barWidth + 20) + 10;
            const y = chartHeight - padding.bottom - barHeight;
            const isHighest = item.total === Math.max(...chartData.map(d => d.total));

            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isHighest ? themeColors.primary.main : themeColors.primary.light}
                  rx="6"
                  ry="6"
                />
                {/* Label del mes */}
                <SvgText
                  x={x + barWidth / 2}
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
  subtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
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

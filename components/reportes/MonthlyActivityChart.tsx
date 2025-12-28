import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity, Platform } from 'react-native';
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

  // Datos de ejemplo si no hay datos
  const chartData = data.length > 0 ? data.slice(-5) : [
    { mes: 'AGO', total: 450 },
    { mes: 'SEP', total: 620 },
    { mes: 'OCT', total: 850 },
    { mes: 'NOV', total: 720 },
    { mes: 'DIC', total: 580 },
  ];

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
        <Text style={styles.title}>{title}</Text>
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

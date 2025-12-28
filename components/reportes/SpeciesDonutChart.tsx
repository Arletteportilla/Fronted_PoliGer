import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { downloadChartAsPNG } from '@/utils/chartExport';

interface SpeciesData {
  name: string;
  percentage: number;
  color: string;
}

interface SpeciesDonutChartProps {
  data?: SpeciesData[];
  title?: string;
  subtitle?: string;
}

export const SpeciesDonutChart: React.FC<SpeciesDonutChartProps> = ({
  data,
  title = 'Especies',
  subtitle = 'Distribución por planta madre',
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  const defaultData = data || [
    { name: 'Cattleya', percentage: 35, color: themeColors.primary.main },
    { name: 'Dracula', percentage: 25, color: themeColors.accent.primary },
    { name: 'Masdevallia', percentage: 25, color: themeColors.primary.dark },
    { name: 'Otros', percentage: 15, color: themeColors.text.tertiary },
  ];
  const size = 180;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = -90; // Empezar desde arriba

  const handleDownload = () => {
    downloadChartAsPNG('species-chart-container', 'especies-distribucion');
  };

  return (
    <View style={styles.container} nativeID="species-chart-container">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color={themeColors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation={0} origin={`${center}, ${center}`}>
            {defaultData.map((item, index) => {
              const angle = (item.percentage / 100) * 360;
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const rotation = currentAngle;
              currentAngle += angle;

              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>

        {/* Centro con número de tipos */}
        <View style={styles.centerContent}>
          <Text style={styles.centerNumber}>{defaultData.length}</Text>
          <Text style={styles.centerLabel}>TIPOS</Text>
        </View>
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        {defaultData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name} ({item.percentage}%)
            </Text>
          </View>
        ))}
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
  headerLeft: {
    flex: 1,
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
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -2,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
});

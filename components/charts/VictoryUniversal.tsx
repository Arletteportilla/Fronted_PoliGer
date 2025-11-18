import React from 'react';
import { Platform } from 'react-native';

// Simple re-export approach - let Victory handle platform detection
import {
  VictoryBar as VictoryBarOriginal,
  VictoryChart as VictoryChartOriginal,
  VictoryAxis as VictoryAxisOriginal,
  VictoryLine as VictoryLineOriginal,
  VictoryArea,
  VictoryPie,
  VictoryScatter,
  VictoryGroup,
  VictoryStack,
  VictoryTooltip,
  VictoryLegend,
  VictoryLabel,
  VictoryContainer
} from 'victory';

// Re-export Victory components with consistent naming
export const VictoryBar = VictoryBarOriginal;
export const VictoryChart = VictoryChartOriginal;
export const VictoryAxis = VictoryAxisOriginal;
export const VictoryLine = VictoryLineOriginal;

// Additional Victory components that might be useful
export { 
  VictoryArea,
  VictoryPie,
  VictoryScatter,
  VictoryGroup,
  VictoryStack,
  VictoryTooltip,
  VictoryLegend,
  VictoryLabel,
  VictoryContainer
};

// Default export with all components
export default {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryArea,
  VictoryPie,
  VictoryScatter,
  VictoryGroup,
  VictoryStack,
  VictoryTooltip,
  VictoryLegend,
  VictoryLabel,
  VictoryContainer
};

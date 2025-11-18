import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Test component to verify Victory imports
export const VictoryTestComponent: React.FC = () => {
  try {
    // Test Victory imports
    const { VictoryChart, VictoryAxis, VictoryLine } = require('./VictoryUniversal');
    
    const testData = [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 }
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Victory Test Component</Text>
        <View style={styles.chartContainer}>
          <VictoryChart
            height={200}
            width={300}
            style={{ background: { fill: '#f0f0f0' } }}
          >
            <VictoryAxis />
            <VictoryAxis dependentAxis />
            <VictoryLine
              data={testData}
              style={{ data: { stroke: '#c43a31' } }}
            />
          </VictoryChart>
        </View>
        <Text style={styles.successText}>✅ Victory components loaded successfully!</Text>
      </View>
    );
  } catch (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Victory Test Component</Text>
        <Text style={styles.errorText}>❌ Error loading Victory components:</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
        <Text style={styles.errorDetails}>Stack: {error.stack}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 10,
    fontWeight: '600',
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});





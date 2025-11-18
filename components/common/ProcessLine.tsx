import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProcessLineProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  style?: any;
}

export function ProcessLine({ 
  steps, 
  currentStep, 
  completedSteps = [], 
  style 
}: ProcessLineProps) {
  const isCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const isCurrent = (stepIndex: number) => stepIndex === currentStep;

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepContent}>
            <View style={[
              styles.stepIcon,
              isCompleted(index) && styles.stepIconCompleted,
              isCurrent(index) && styles.stepIconCurrent,
            ]}>
              {isCompleted(index) ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  isCurrent(index) && styles.stepNumberCurrent
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            
            <Text style={[
              styles.stepText,
              isCompleted(index) && styles.stepTextCompleted,
              isCurrent(index) && styles.stepTextCurrent,
            ]}>
              {step}
            </Text>
          </View>
          
          {index < steps.length - 1 && (
            <View style={[
              styles.connector,
              isCompleted(index) && styles.connectorCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconCompleted: {
    backgroundColor: '#10B981',
  },
  stepIconCurrent: {
    backgroundColor: '#0a7ea4',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberCurrent: {
    color: '#fff',
  },
  stepText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  stepTextCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
  stepTextCurrent: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  connectorCompleted: {
    backgroundColor: '#10B981',
  },
});
export default ProcessLine;
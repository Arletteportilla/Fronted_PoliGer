import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

export const ReportesHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header removed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 2,
  },
});

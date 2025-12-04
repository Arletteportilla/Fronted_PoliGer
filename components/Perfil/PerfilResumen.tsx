import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import type { EstadisticasUsuario } from '@/types/index';

interface PerfilResumenProps {
  estadisticas: EstadisticasUsuario;
  loading: boolean;
}

export function PerfilResumen({ estadisticas, loading }: PerfilResumenProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.resumenContainer}>
      <View style={styles.statsGrid}>
        <View style={[styles.statsCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.statLabel}>Polinizaciones</Text>
          <Text style={styles.statsValue}>{estadisticas?.total_polinizaciones ?? 0}</Text>
        </View>
        <View style={[styles.statsCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.statLabel}>Germinaciones</Text>
          <Text style={styles.statsValue}>{estadisticas?.total_germinaciones ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

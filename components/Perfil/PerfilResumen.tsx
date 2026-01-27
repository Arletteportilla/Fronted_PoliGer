import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { createStyles } from '@/utils/Perfil/styles';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import type { EstadisticasUsuario, Polinizacion, Germinacion } from '@/types/index';
import { getEstadoColor } from '@/utils/colorHelpers';

interface PerfilResumenProps {
  estadisticas: EstadisticasUsuario;
  loading: boolean;
  polinizaciones?: Polinizacion[];
  germinaciones?: Germinacion[];
  onViewPolinizacion?: (polinizacion: Polinizacion) => void;
  onViewGerminacion?: (germinacion: Germinacion) => void;
}

export function PerfilResumen({
  estadisticas,
  loading,
  polinizaciones = [],
  germinaciones = [],
  onViewPolinizacion,
  onViewGerminacion
}: PerfilResumenProps) {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  // Ordenar por fecha de creación (más recientes primero) y limitar a 5
  const polinizacionesRecientes = [...polinizaciones]
    .sort((a, b) => {
      const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, 5);

  const germinacionesRecientes = [...germinaciones]
    .sort((a, b) => {
      const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, 5);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  // Calcular éxito promedio (polinizaciones completadas vs total)
  const polinizacionesCompletadas = polinizaciones.filter(p =>
    p.estado === 'COMPLETADA' || p.estado === 'FINALIZADA' || p.estado === 'MADURO'
  ).length;
  const exitoPromedio = polinizaciones.length > 0
    ? Math.round((polinizacionesCompletadas / polinizaciones.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.resumenContainer} showsVerticalScrollIndicator={false}>
      {/* Tarjetas de Estadísticas */}
      <View style={styles.statsGrid}>
        {/* Tarjeta de Polinizaciones */}
        <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="flower" size={24} color="#F57C00" />
          </View>
          <Text style={styles.statLabel}>Polinizaciones</Text>
          <Text style={styles.statValue}>{estadisticas.total_polinizaciones}</Text>
          <Text style={styles.statSubtext}>
            {estadisticas.polinizaciones_actuales} en proceso
          </Text>
        </View>

        {/* Tarjeta de Germinaciones */}
        <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="leaf" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statLabel}>Germinaciones</Text>
          <Text style={styles.statValue}>{estadisticas.total_germinaciones}</Text>
          <Text style={styles.statSubtext}>
            {estadisticas.germinaciones_actuales} en proceso
          </Text>
        </View>

        {/* Tarjeta de Éxito Promedio */}
        <View style={[styles.statCard, { backgroundColor: themeColors.background.secondary }]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="trending-up" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statLabel}>Éxito Promedio</Text>
          <Text style={styles.statValue}>{exitoPromedio}%</Text>
          <Text style={styles.statSubtext}>
            {polinizacionesCompletadas} completadas
          </Text>
        </View>
      </View>

      {/* Lista de Polinizaciones Recientes */}
      {polinizacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <Ionicons name="flower-outline" size={20} color={themeColors.status.warning} />
            <Text style={styles.recentSectionTitle}>Polinizaciones Recientes</Text>
          </View>
          {polinizacionesRecientes.map((pol, index) => (
            <TouchableOpacity
              key={pol.id || index}
              style={styles.recentItem}
              onPress={() => onViewPolinizacion?.(pol)}
              activeOpacity={0.7}
            >
              <View style={styles.recentItemContent}>
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemCode}>{pol.codigo || `POL-${pol.numero}`}</Text>
                  <View style={[styles.recentItemBadge, { backgroundColor: getEstadoColor(pol.estado) + '20' }]}>
                    <Text style={[styles.recentItemBadgeText, { color: getEstadoColor(pol.estado) }]}>
                      {pol.estado || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recentItemSpecies}>
                  {pol.genero} {pol.especie}
                </Text>
                <View style={styles.recentItemFooter}>
                  <Ionicons name="calendar-outline" size={12} color={themeColors.text.tertiary} />
                  <Text style={styles.recentItemDate}>
                    {formatDate(pol.fecha_creacion)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={themeColors.text.disabled} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Lista de Germinaciones Recientes */}
      {germinacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} />
            <Text style={styles.recentSectionTitle}>Germinaciones Recientes</Text>
          </View>
          {germinacionesRecientes.map((germ, index) => (
            <TouchableOpacity
              key={germ.id || index}
              style={styles.recentItem}
              onPress={() => onViewGerminacion?.(germ)}
              activeOpacity={0.7}
            >
              <View style={styles.recentItemContent}>
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemCode}>{germ.codigo || `GER-${germ.id}`}</Text>
                  <View style={[styles.recentItemBadge, { backgroundColor: getEstadoColor(germ.estado_germinacion) + '20' }]}>
                    <Text style={[styles.recentItemBadgeText, { color: getEstadoColor(germ.estado_germinacion) }]}>
                      {germ.estado_germinacion || germ.etapa_actual || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recentItemSpecies}>
                  {germ.genero} {germ.especie || germ.especie_variedad}
                </Text>
                <View style={styles.recentItemFooter}>
                  <Ionicons name="calendar-outline" size={12} color={themeColors.text.tertiary} />
                  <Text style={styles.recentItemDate}>
                    {formatDate(germ.fecha_creacion)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={themeColors.text.disabled} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Mensaje si no hay datos */}
      {polinizacionesRecientes.length === 0 && germinacionesRecientes.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={themeColors.text.disabled} />
          <Text style={styles.emptyStateText}>No hay registros recientes</Text>
          <Text style={styles.emptyStateSubtext}>
            Las polinizaciones y germinaciones que agregues aparecerán aquí
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

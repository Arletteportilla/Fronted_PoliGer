import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import type { EstadisticasUsuario, Polinizacion, Germinacion } from '@/types/index';

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
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
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

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toUpperCase()) {
      case 'INGRESADO':
      case 'INICIAL':
        return '#3B82F6';
      case 'EN_PROCESO':
        return '#F59E0B';
      case 'FINALIZADO':
      case 'LISTO':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.resumenContainer} showsVerticalScrollIndicator={false}>
      {/* Lista de Polinizaciones Recientes */}
      {polinizacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <Ionicons name="flower-outline" size={20} color="#F59E0B" />
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
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.recentItemDate}>
                    {formatDate(pol.fecha_creacion)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Lista de Germinaciones Recientes */}
      {germinacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <Ionicons name="leaf-outline" size={20} color="#10B981" />
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
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.recentItemDate}>
                    {formatDate(germ.fecha_creacion)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Mensaje si no hay datos */}
      {polinizacionesRecientes.length === 0 && germinacionesRecientes.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No hay registros recientes</Text>
          <Text style={styles.emptyStateSubtext}>
            Las polinizaciones y germinaciones que agregues aparecerán aquí
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

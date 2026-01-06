import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createPerfilStyles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import type { EstadisticasUsuario, Polinizacion, Germinacion } from '@/types/index';
import { getEstadoColor, getTipoColor } from '@/utils/colorHelpers';

interface PerfilResumenProps {
  estadisticas: EstadisticasUsuario;
  loading: boolean;
  polinizaciones?: Polinizacion[];
  germinaciones?: Germinacion[];
  onViewPolinizacion?: (polinizacion: Polinizacion) => void;
  onViewGerminacion?: (germinacion: Germinacion) => void;
  onVerTodasPolinizaciones?: () => void;
  onVerTodasGerminaciones?: () => void;
}

export function PerfilResumen({
  estadisticas,
  loading,
  polinizaciones = [],
  germinaciones = [],
  onViewPolinizacion,
  onViewGerminacion,
  onVerTodasPolinizaciones,
  onVerTodasGerminaciones
}: PerfilResumenProps) {
  const { colors: themeColors } = useTheme();
  const styles = createPerfilStyles(themeColors);
  
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
      const day = date.getDate();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch {
      return 'N/A';
    }
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}/${date.getFullYear()}`;
    } catch {
      return 'N/A';
    }
  };

  const getTipoDisplay = (tipo?: string): string => {
    if (!tipo) return 'SELF';
    const tipoUpper = tipo.toUpperCase();
    if (tipoUpper === 'HÍBRIDA' || tipoUpper === 'HIBRIDA') return 'HÍBRIDA';
    return tipoUpper;
  };

  return (
    <ScrollView style={styles.resumenContainer} showsVerticalScrollIndicator={false}>
      {/* Lista de Polinizaciones Recientes */}
      {polinizacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <View style={styles.recentSectionHeaderLeft}>
              <Ionicons name="flower-outline" size={20} color={themeColors.status.success} />
              <Text style={styles.recentSectionTitle}>Polinizaciones Recientes</Text>
            </View>
            {onVerTodasPolinizaciones && (
              <TouchableOpacity onPress={onVerTodasPolinizaciones} style={styles.viewAllLink}>
                <Text style={styles.viewAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Grid de tarjetas 2x2 */}
          <View style={styles.cardsGrid}>
            {polinizacionesRecientes.slice(0, 4).map((pol, index) => {
              const tipoColor = getTipoColor(pol.tipo_polinizacion || pol.Tipo);
              const tipoDisplay = getTipoDisplay(pol.tipo_polinizacion || pol.Tipo);
              const estadoDisplay = pol.estado_polinizacion || pol.estado || 'INGRESADO';
              const nombrePlanta = pol.madre_especie || pol.especie || '';
              const generoCompleto = pol.madre_genero || pol.genero || '';
              const fechaPol = pol.fechapol || pol.fecha_polinizacion || pol.fecha_creacion;
              
              return (
                <TouchableOpacity
                  key={pol.id || pol.numero || index}
                  style={styles.polinizacionCard}
                  onPress={() => onViewPolinizacion?.(pol)}
                  activeOpacity={0.7}
                >
                  {/* Decoración curva en esquina superior derecha */}
                  <View style={styles.cardDecoration} />
                  
                  {/* Badge de tipo */}
                  <View style={[styles.tipoBadge, { backgroundColor: tipoColor }]}>
                    <Text style={styles.tipoBadgeText}>{tipoDisplay}</Text>
                  </View>
                  
                  {/* ID de polinización */}
                  <Text style={styles.cardPolId}>{pol.codigo || `POL-${pol.numero}`}</Text>
                  
                  {/* Nombre de la planta */}
                  <Text style={styles.cardPlantName} numberOfLines={2}>
                    {nombrePlanta || 'Sin nombre'}
                  </Text>
                  
                  {/* Fecha con icono */}
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="calendar-outline" size={14} color={themeColors.text.tertiary} />
                    <Text style={styles.cardInfoText}>{formatDate(fechaPol)}</Text>
                  </View>
                  
                  {/* Género con icono */}
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="leaf-outline" size={14} color={themeColors.text.tertiary} />
                    <Text style={styles.cardInfoText}>{generoCompleto || 'N/A'}</Text>
                  </View>
                  
                  {/* Estado con punto */}
                  <View style={styles.cardStatusRow}>
                    <View style={[styles.statusDot, { backgroundColor: themeColors.text.tertiary }]} />
                    <Text style={styles.cardStatusText}>{estadoDisplay}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Lista de Germinaciones Recientes */}
      {germinacionesRecientes.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <View style={styles.recentSectionHeaderLeft}>
              <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} />
              <Text style={styles.recentSectionTitle}>Germinaciones Recientes</Text>
            </View>
            {onVerTodasGerminaciones && (
              <TouchableOpacity onPress={onVerTodasGerminaciones} style={styles.viewAllLink}>
                <Text style={styles.viewAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Grid de tarjetas 2x2 */}
          <View style={styles.cardsGrid}>
            {germinacionesRecientes.slice(0, 4).map((germ, index) => {
              const estadoDisplay = germ.estado_germinacion || germ.etapa_actual || 'INICIAL';
              const estadoColor = getEstadoColor(estadoDisplay);
              const nombrePlanta = germ.especie || germ.especie_variedad || '';
              const generoCompleto = germ.genero || '';
              const fechaGerm = germ.fecha_siembra || germ.fecha_creacion;
              const codigoCompleto = germ.codigo || `GER-${germ.id}`;
              
              return (
                <TouchableOpacity
                  key={germ.id || index}
                  style={styles.polinizacionCard}
                  onPress={() => onViewGerminacion?.(germ)}
                  activeOpacity={0.7}
                >
                  {/* Decoración curva en esquina superior derecha */}
                  <View style={styles.cardDecoration} />
                  
                  {/* Badge de estado */}
                  <View style={[styles.tipoBadge, { backgroundColor: estadoColor }]}>
                    <Text style={styles.tipoBadgeText}>{estadoDisplay.replace(/_/g, ' ')}</Text>
                  </View>
                  
                  {/* Código de germinación */}
                  <Text style={styles.cardPolId}>{codigoCompleto}</Text>
                  
                  {/* Nombre de la planta */}
                  <Text style={styles.cardPlantName} numberOfLines={2}>
                    {nombrePlanta || 'Sin nombre'}
                  </Text>
                  
                  {/* Fecha con icono */}
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="calendar-outline" size={14} color={themeColors.text.tertiary} />
                    <Text style={styles.cardInfoText}>{formatDate(fechaGerm)}</Text>
                  </View>
                  
                  {/* Género con icono */}
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="leaf-outline" size={14} color={themeColors.text.tertiary} />
                    <Text style={styles.cardInfoText}>{generoCompleto || 'N/A'}</Text>
                  </View>
                  
                  {/* Estado con punto */}
                  <View style={styles.cardStatusRow}>
                    <View style={[styles.statusDot, { backgroundColor: estadoColor }]} />
                    <Text style={styles.cardStatusText}>{estadoDisplay.replace(/_/g, ' ')}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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

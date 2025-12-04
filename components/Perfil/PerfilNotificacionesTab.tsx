import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/utils/Perfil/styles';
import { Colors } from '@/constants/Colors';
import { PolinizacionCard } from '@/components/cards/PolinizacionCard';
import { GerminacionCard } from '@/components/cards/GerminacionCard';
import type { Polinizacion, Germinacion } from '@/types/index';

export interface PerfilNotificacionesTabProps {
  polinizaciones: Polinizacion[];
  germinaciones: Germinacion[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onViewPolinizacion?: (item: Polinizacion) => void;
  onEditPolinizacion?: (item: Polinizacion) => void;
  onDeletePolinizacion?: (item: Polinizacion) => void;
  onChangeStatusPolinizacion?: (item: Polinizacion) => void;
  onViewGerminacion?: (item: Germinacion) => void;
  onEditGerminacion?: (item: Germinacion) => void;
  onDeleteGerminacion?: (item: Germinacion) => void;
  onChangeStatusGerminacion?: (item: Germinacion) => void;
}

export function PerfilNotificacionesTab({
  polinizaciones,
  germinaciones,
  loading,
  refreshing,
  onRefresh,
  onViewPolinizacion,
  onEditPolinizacion,
  onDeletePolinizacion,
  onChangeStatusPolinizacion,
  onViewGerminacion,
  onEditGerminacion,
  onDeleteGerminacion,
  onChangeStatusGerminacion
}: PerfilNotificacionesTabProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  const polinizacionesArray = Array.isArray(polinizaciones) ? polinizaciones : [];
  const germinacionesArray = Array.isArray(germinaciones) ? germinaciones : [];

  // Filtrar polinizaciones que no están finalizadas
  const polinizacionesPendientes = polinizacionesArray.filter(
    p => (p.estado_polinizacion !== 'FINALIZADO' || p.estado !== 'LISTA') && !p.fechamad
  );

  // Filtrar germinaciones que no están finalizadas
  const germinacionesPendientes = germinacionesArray.filter(
    g => g.estado_germinacion !== 'FINALIZADO' && g.etapa_actual !== 'FINALIZADO' && g.etapa_actual !== 'LISTA' && g.etapa_actual !== 'LISTO'
  );

  const totalPendientes = polinizacionesPendientes.length + germinacionesPendientes.length;

  return (
    <View style={styles.professionalTableContainer}>
      {/* Encabezado */}
      <View style={styles.tableHeaderSection}>
        <View style={styles.tableTitleContainer}>
          <Text style={styles.professionalTableTitle}>Mis Notificaciones</Text>
          <Text style={styles.professionalTableSubtitle}>
            {totalPendientes} {totalPendientes === 1 ? 'elemento pendiente' : 'elementos pendientes'} que requieren atención
          </Text>
        </View>
      </View>

      {/* Lista de elementos pendientes */}
      {totalPendientes === 0 ? (
        <View style={styles.listEmptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#10B981" />
          <Text style={styles.listEmptyText}>
            No hay elementos pendientes
          </Text>
          <Text style={styles.emptySubtext}>
            Todas tus germinaciones y polinizaciones están finalizadas o no hay ninguna en proceso
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={{ padding: 16, gap: 16 }}>
            {/* Sección de Polinizaciones Pendientes */}
            {polinizacionesPendientes.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                  <Ionicons name="flower-outline" size={20} color="#F59E0B" />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 }}>
                    Polinizaciones Pendientes ({polinizacionesPendientes.length})
                  </Text>
                </View>
                {polinizacionesPendientes.map((item) => (
                  <View key={`pol-${item.numero}`} style={{ marginBottom: 12 }}>
                    <PolinizacionCard
                      item={item}
                      onPress={onViewPolinizacion}
                      onViewDetails={onViewPolinizacion}
                      onEdit={onEditPolinizacion}
                      onDelete={onDeletePolinizacion}
                      onChangeStatus={onChangeStatusPolinizacion}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Sección de Germinaciones Pendientes */}
            {germinacionesPendientes.length > 0 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                  <Ionicons name="leaf-outline" size={20} color="#10B981" />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 }}>
                    Germinaciones Pendientes ({germinacionesPendientes.length})
                  </Text>
                </View>
                {germinacionesPendientes.map((item) => (
                  <View key={`germ-${item.id}`} style={{ marginBottom: 12 }}>
                    <GerminacionCard
                      item={item}
                      onPress={onViewGerminacion}
                      onViewDetails={onViewGerminacion}
                      onEdit={onEditGerminacion}
                      onDelete={onDeleteGerminacion}
                      onChangeStatus={onChangeStatusGerminacion}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

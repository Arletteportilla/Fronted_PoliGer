import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PredictionDisplay } from '@/components/prediction';
import { PrediccionMLPolinizacion } from './PrediccionMLPolinizacion';

interface PrediccionSelectorProps {
  // Predicción clásica (heurística)
  prediccionData: any;
  loadingPrediccion: boolean;
  fechaInicio?: string;

  // Predicción ML
  formData: {
    fecha_polinizacion?: string;
    madre_genero?: string;
    madre_especie?: string;
    ubicacion_nombre?: string;
    responsable?: string;
    tipo_polinizacion?: string;
    cantidad_capsulas?: number;
    cantidad?: number;
    vivero?: string;
    mesa?: string;
    pared?: string;
  };
  onPrediccionMLComplete?: (resultado: any) => void;
}

type TipoPrediccion = 'clasica' | 'ml';

export function PrediccionSelector({
  prediccionData,
  loadingPrediccion,
  fechaInicio,
  formData,
  onPrediccionMLComplete
}: PrediccionSelectorProps) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPrediccion>('clasica');

  // Verificar si hay datos mínimos para ML
  const puedeUsarML = !!(
    formData.fecha_polinizacion &&
    formData.madre_genero &&
    formData.madre_especie
  );

  return (
    <View style={styles.container}>
      {/* Header con selector de tipo */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="analytics-outline" size={20} color="#e9ad14" />
        </View>
        <Text style={styles.headerTitle}>Predicción de Maduración</Text>
      </View>

      {/* Tabs para seleccionar tipo de predicción */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            tipoSeleccionado === 'clasica' && styles.tabActive
          ]}
          onPress={() => setTipoSeleccionado('clasica')}
        >
          <Ionicons
            name="calculator-outline"
            size={18}
            color={tipoSeleccionado === 'clasica' ? '#0a7ea4' : '#666'}
          />
          <Text style={[
            styles.tabText,
            tipoSeleccionado === 'clasica' && styles.tabTextActive
          ]}>
            Heurística
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            tipoSeleccionado === 'ml' && styles.tabActive,
            !puedeUsarML && styles.tabDisabled
          ]}
          onPress={() => puedeUsarML && setTipoSeleccionado('ml')}
          disabled={!puedeUsarML}
        >
          <Ionicons
            name="hardware-chip-outline"
            size={18}
            color={tipoSeleccionado === 'ml' ? '#2196F3' : (puedeUsarML ? '#666' : '#ccc')}
          />
          <Text style={[
            styles.tabText,
            tipoSeleccionado === 'ml' && styles.tabTextActive,
            !puedeUsarML && styles.tabTextDisabled
          ]}>
            Machine Learning
          </Text>
        </TouchableOpacity>
      </View>

      {/* Descripción del método seleccionado */}
      <View style={styles.descriptionContainer}>
        {tipoSeleccionado === 'clasica' ? (
          <View style={styles.description}>
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.descriptionText}>
              Predicción automática basada en datos históricos y reglas heurísticas
            </Text>
          </View>
        ) : (
          <View style={styles.description}>
            <Ionicons name="information-circle-outline" size={16} color="#2196F3" />
            <Text style={[styles.descriptionText, { color: '#2196F3' }]}>
              Predicción automática con modelo XGBoost (16 features, ~10-20ms)
            </Text>
          </View>
        )}
      </View>

      {/* Contenido según el tipo seleccionado */}
      <View style={styles.content}>
        {tipoSeleccionado === 'clasica' ? (
          <PredictionDisplay
            prediccionData={prediccionData}
            loadingPrediccion={loadingPrediccion}
            fechaInicio={fechaInicio}
            tipo="polinizacion"
          />
        ) : (
          <>
            {!puedeUsarML ? (
              <View style={styles.requirementsContainer}>
                <Ionicons name="warning-outline" size={24} color="#FF9800" />
                <Text style={styles.requirementsTitle}>Datos Requeridos</Text>
                <Text style={styles.requirementsText}>
                  Para usar la predicción ML necesitas completar:
                </Text>
                <View style={styles.requirementsList}>
                  <Text style={styles.requirementItem}>
                    • Fecha de polinización
                  </Text>
                  <Text style={styles.requirementItem}>
                    • Género de la planta madre
                  </Text>
                  <Text style={styles.requirementItem}>
                    • Especie de la planta madre
                  </Text>
                </View>
              </View>
            ) : (
              <PrediccionMLPolinizacion
                formData={formData}
                onPrediccionComplete={onPrediccionMLComplete}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff9e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  tabTextDisabled: {
    color: '#ccc',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#e9ad14',
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  content: {
    minHeight: 100,
  },
  requirementsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginTop: 8,
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 12,
    textAlign: 'center',
  },
  requirementsList: {
    alignSelf: 'stretch',
  },
  requirementItem: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 6,
  },
});

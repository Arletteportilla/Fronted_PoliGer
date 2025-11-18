import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { prediccionService } from '@/services/prediccion.service';
import type { Polinizacion } from '@/types/index';

interface PrediccionPolinizacionProps {
  polinizacion: Polinizacion;
  onPrediccionComplete?: (resultado: any) => void;
}

export function PrediccionPolinizacion({ polinizacion, onPrediccionComplete }: PrediccionPolinizacionProps) {
  const [loading, setLoading] = useState(false);
  const [prediccion, setPrediccion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const realizarPrediccion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await prediccionService.predecirPolinizacion(polinizacion);
      setPrediccion(resultado);
      
      if (onPrediccionComplete) {
        onPrediccionComplete(resultado);
      }
    } catch (err) {
      setError('Error al realizar la predicción');
      console.error('Error en predicción:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color="#0a7ea4" />
        <Text style={styles.title}>Predicción de Polinización</Text>
      </View>

      <View style={styles.polinizacionInfo}>
        <Text style={styles.label}>Especie:</Text>
        <Text style={styles.value}>{polinizacion.especie}</Text>
        
        <Text style={styles.label}>Fecha de Polinización:</Text>
        <Text style={styles.value}>{new Date(polinizacion.fecha_polinizacion).toLocaleDateString()}</Text>
        
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.value}>{polinizacion.estado}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={realizarPrediccion}
        disabled={loading}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {loading ? 'Realizando Predicción...' : 'Realizar Predicción'}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {prediccion && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado de la Predicción</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Probabilidad de Éxito:</Text>
            <Text style={styles.resultValue}>
              {(prediccion.probabilidad_exito * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Tiempo Estimado:</Text>
            <Text style={styles.resultValue}>
              {prediccion.tiempo_estimado} días
            </Text>
          </View>

          {prediccion.factores_criticos && prediccion.factores_criticos.length > 0 && (
            <View style={styles.factoresContainer}>
              <Text style={styles.factoresTitle}>Factores Críticos:</Text>
              {prediccion.factores_criticos.map((factor: string, index: number) => (
                <Text key={index} style={styles.factorItem}>• {factor}</Text>
              ))}
            </View>
          )}

          {prediccion.recomendaciones && prediccion.recomendaciones.length > 0 && (
            <View style={styles.recomendacionesContainer}>
              <Text style={styles.recomendacionesTitle}>Recomendaciones:</Text>
              {prediccion.recomendaciones.map((recomendacion: string, index: number) => (
                <Text key={index} style={styles.recomendacionItem}>• {recomendacion}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1F2937',
  },
  polinizacionInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#F44336',
    marginLeft: 8,
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  factoresContainer: {
    marginTop: 15,
  },
  factoresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 10,
    marginBottom: 4,
  },
  recomendacionesContainer: {
    marginTop: 15,
  },
  recomendacionesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recomendacionItem: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 10,
    marginBottom: 4,
  },
});

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { reentrenamientoService, type ModeloReentrenamiento, type ConteosReentrenamiento } from '@/services/reentrenamiento.service';

export function PerfilConfiguracionTab() {
  const { colors } = useTheme();
  const [conteos, setConteos] = useState<ConteosReentrenamiento | null>(null);
  const [conteosLoading, setConteosLoading] = useState(true);
  const [conteosError, setConteosError] = useState(false);
  const [reentrenamientoLoading, setReentrenamientoLoading] = useState<ModeloReentrenamiento | null>(null);
  const [reentrenamientoResultado, setReentrenamientoResultado] = useState<string | null>(null);

  useEffect(() => {
    fetchConteos();
  }, []);

  const fetchConteos = async () => {
    setConteosLoading(true);
    setConteosError(false);
    try {
      const data = await reentrenamientoService.getConteos();
      setConteos(data);
    } catch {
      setConteos(null);
      setConteosError(true);
    } finally {
      setConteosLoading(false);
    }
  };

  const puedeReentrenar = (modelo: 'polinizacion' | 'germinacion'): boolean => {
    if (!conteos) return false;
    return conteos[modelo] >= conteos.minimo_requerido;
  };

  const botonHabilitado = (modelo: ModeloReentrenamiento): boolean => {
    if (reentrenamientoLoading !== null || conteosLoading || !conteos) return false;
    if (modelo === 'ambos') return puedeReentrenar('polinizacion') && puedeReentrenar('germinacion');
    return puedeReentrenar(modelo);
  };

  const handleReentrenar = (modelo: ModeloReentrenamiento) => {
    const labels = { polinizacion: 'Polinizacion', germinacion: 'Germinacion', ambos: 'Ambos Modelos' };
    Alert.alert(
      'Reentrenar Modelo',
      `¿Reentrenar el modelo de ${labels[modelo]}? Esto puede tardar varios minutos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reentrenar',
          style: 'destructive',
          onPress: async () => {
            setReentrenamientoLoading(modelo);
            setReentrenamientoResultado(null);
            try {
              const result = await reentrenamientoService.reentrenar(modelo);
              let msg = '';
              if (modelo === 'ambos' && result.polinizacion && result.germinacion) {
                msg = `Polinizacion: R2=${result.polinizacion.r2.toFixed(3)}, MAE=${result.polinizacion.mae.toFixed(1)}d, ${result.polinizacion.registros_usados} registros\nGerminacion: R2=${result.germinacion.r2.toFixed(3)}, MAE=${result.germinacion.mae.toFixed(1)}d, ${result.germinacion.registros_usados} registros`;
              } else {
                const r = result as any;
                msg = `${r.modelo}: R2=${r.r2?.toFixed(3)}, MAE=${r.mae?.toFixed(1)}d, ${r.registros_usados} registros`;
              }
              setReentrenamientoResultado(msg);
              fetchConteos();
            } catch (error: any) {
              const msg = error.response?.data?.error || error.message || 'Error desconocido';
              Alert.alert('Error', msg);
            } finally {
              setReentrenamientoLoading(null);
            }
          },
        },
      ]
    );
  };

  const minimo = conteos?.minimo_requerido ?? 1000;

  // Colores del sistema por modulo
  const polColor = colors.module.polinizacion.primary;
  const polColorDark = colors.primary.dark;
  const germColor = colors.module.germinacion.primary;
  const germColorDark = colors.module.germinacion.icon;
  const successColor = colors.status.success;

  type ModeloDef = {
    key: 'polinizacion' | 'germinacion';
    label: string;
    badge: string;
    gradientColors: [string, string];
    accentColor: string;
  };

  const modelos: ModeloDef[] = [
    {
      key: 'polinizacion',
      label: 'Polinizacion',
      badge: 'MODELO DE PRODUCCION',
      gradientColors: [polColorDark, polColor],
      accentColor: polColor,
    },
    {
      key: 'germinacion',
      label: 'Germinacion',
      badge: 'MODELO DE ANALISIS',
      gradientColors: [germColorDark, germColor],
      accentColor: germColor,
    },
  ];

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <Text style={s.title}>Configuracion de Modelos ML</Text>
      <Text style={s.subtitle}>
        Los modelos se habilitan automaticamente al alcanzar{' '}
        <Text style={s.subtitleBold}>1,000 registros</Text> en estado{' '}
        <Text style={[s.subtitleAccent, { color: successColor }]}>Finalizado</Text>.
      </Text>

      <View style={s.cardsRow}>
        {modelos.map(({ key, label, badge, gradientColors, accentColor }) => {
          const count = conteos?.[key] ?? 0;
          const listo = puedeReentrenar(key);
          const progreso = Math.min((count / minimo) * 100, 100);
          const isLoading = reentrenamientoLoading === key;
          const habilitado = botonHabilitado(key);

          return (
            <View key={key} style={s.card}>
              {/* Header */}
              <LinearGradient colors={gradientColors} style={s.cardHeader}>
                <View style={s.badgeContainer}>
                  <Text style={s.badgeText}>{badge}</Text>
                </View>
                <View style={s.cardTitleRow}>
                  {key === 'polinizacion' ? (
                    <Ionicons name="flower-outline" size={17} color="rgba(255,255,255,0.85)" style={s.cardIcon} />
                  ) : (
                    <FontAwesome6 name="seedling" size={15} color="rgba(255,255,255,0.85)" style={s.cardIcon} />
                  )}
                  <Text style={s.cardTitle}>{label}</Text>
                </View>
              </LinearGradient>

              {/* Cuerpo */}
              <View style={s.cardBody}>
                <Text style={s.registrosLabel}>REGISTROS FINALIZADOS</Text>

                <View style={s.countRow}>
                  {conteosLoading ? (
                    <ActivityIndicator size="small" color={accentColor} />
                  ) : conteosError ? (
                    <Text style={[s.countCurrent, { color: colors.status.error, fontSize: 22 }]}>—</Text>
                  ) : (
                    <Text>
                      <Text style={[s.countCurrent, { color: accentColor }]}>
                        {count.toLocaleString()}
                      </Text>
                      <Text style={s.countTotal}> / {minimo.toLocaleString()}</Text>
                    </Text>
                  )}
                </View>

                {/* Barra de progreso */}
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      { width: `${progreso}%` as any, backgroundColor: accentColor },
                    ]}
                  />
                </View>
                <Text style={[s.progressPct, { color: accentColor }]}>
                  {!conteosLoading && !conteosError ? `${progreso.toFixed(1)}%` : ''}
                </Text>

                <View style={s.statusRow}>
                  {!conteosLoading && !conteosError && (
                    <Ionicons
                      name={listo ? 'checkmark-circle' : 'information-circle-outline'}
                      size={12}
                      color={listo ? successColor : colors.text.disabled}
                      style={{ marginRight: 4, marginTop: 1 }}
                    />
                  )}
                  <Text style={[s.statusText, listo && { color: successColor }]}>
                    {conteosLoading
                      ? 'Cargando...'
                      : conteosError
                      ? 'No se pudo cargar'
                      : listo
                      ? 'Listo para reentrenar'
                      : `Faltan ${(minimo - count).toLocaleString()} registros para habilitar el reentrenamiento`}
                  </Text>
                </View>
              </View>

              {/* Boton */}
              <TouchableOpacity
                style={[
                  s.cardButton,
                  habilitado
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : s.cardButtonDisabled,
                ]}
                onPress={() => handleReentrenar(key)}
                disabled={!habilitado}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={habilitado ? colors.primary.contrast : colors.text.disabled} />
                ) : (
                  <View style={s.buttonContent}>
                    {!habilitado && (
                      <Ionicons name="lock-closed" size={13} color={colors.text.disabled} style={{ marginRight: 6 }} />
                    )}
                    <Text style={[s.cardButtonText, !habilitado && s.cardButtonTextDisabled]}>
                      Reentrenar {label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Boton ambos */}
      {(() => {
        const habilitadoAmbos = botonHabilitado('ambos');
        const isLoadingAmbos = reentrenamientoLoading === 'ambos';
        return (
          <TouchableOpacity
            style={[
              s.ambosButton,
              habilitadoAmbos
                ? { backgroundColor: colors.interactive.primary, borderColor: colors.interactive.primary }
                : s.cardButtonDisabled,
            ]}
            onPress={() => handleReentrenar('ambos')}
            disabled={!habilitadoAmbos}
          >
            {isLoadingAmbos ? (
              <ActivityIndicator size="small" color={habilitadoAmbos ? colors.primary.contrast : colors.text.disabled} />
            ) : (
              <View style={s.buttonContent}>
                {!habilitadoAmbos && (
                  <Ionicons name="lock-closed" size={13} color={colors.text.disabled} style={{ marginRight: 6 }} />
                )}
                <Ionicons
                  name="leaf-outline"
                  size={15}
                  color={habilitadoAmbos ? colors.primary.contrast : colors.text.disabled}
                  style={{ marginRight: 6 }}
                />
                <Text style={[s.ambosButtonText, !habilitadoAmbos && s.cardButtonTextDisabled]}>
                  Reentrenar Ambos Modelos
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })()}

      {conteosError && !conteosLoading && (
        <TouchableOpacity style={s.retryButton} onPress={fetchConteos}>
          <Ionicons name="refresh" size={13} color={colors.text.tertiary} style={{ marginRight: 4 }} />
          <Text style={s.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}

      {reentrenamientoResultado && (
        <View style={s.resultado}>
          <View style={s.resultadoHeader}>
            <Ionicons name="checkmark-circle" size={16} color={colors.status.success} style={{ marginRight: 6 }} />
            <Text style={[s.resultadoTitle, { color: colors.status.successDark }]}>
              Reentrenamiento completado
            </Text>
          </View>
          <Text style={[s.resultadoText, { color: colors.status.successDark }]}>
            {reentrenamientoResultado}
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof import('@/utils/colors').getColors>) {
  return StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      color: colors.text.tertiary,
      marginBottom: 20,
      lineHeight: 20,
    },
    subtitleBold: {
      fontWeight: '700',
      color: colors.text.primary,
    },
    subtitleAccent: {
      fontWeight: '600',
    },
    cardsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    card: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.default,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeader: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 14,
      minHeight: 80,
      justifyContent: 'space-between',
    },
    badgeContainer: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    cardIcon: {
      marginRight: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#fff',
    },
    cardBody: {
      padding: 12,
      paddingBottom: 8,
    },
    registrosLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.text.disabled,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    countRow: {
      marginBottom: 8,
      minHeight: 32,
      justifyContent: 'center',
    },
    countCurrent: {
      fontSize: 26,
      fontWeight: '700',
    },
    countTotal: {
      fontSize: 14,
      color: colors.text.disabled,
      fontWeight: '500',
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.border.default,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressPct: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'right',
      marginBottom: 6,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    statusText: {
      fontSize: 10,
      color: colors.text.tertiary,
      lineHeight: 14,
      flex: 1,
    },
    cardButton: {
      margin: 12,
      marginTop: 4,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    cardButtonDisabled: {
      backgroundColor: colors.interactive.disabled,
      borderColor: colors.border.default,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary.contrast,
    },
    cardButtonTextDisabled: {
      color: colors.text.disabled,
    },
    ambosButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: 12,
    },
    ambosButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary.contrast,
    },
    retryButton: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border.medium,
      marginBottom: 12,
    },
    retryText: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    resultado: {
      padding: 12,
      backgroundColor: colors.status.successLight,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.status.success,
    },
    resultadoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    resultadoTitle: {
      fontSize: 13,
      fontWeight: '600',
    },
    resultadoText: {
      fontSize: 12,
      lineHeight: 18,
    },
  });
}

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth.service';

export default function CambiarPasswordScreen() {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ actual?: string; nuevo?: string; confirmar?: string }>({});
  const { refreshUser, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!passwordActual) newErrors.actual = 'Ingresa tu contraseña actual';
    if (!passwordNuevo) newErrors.nuevo = 'Ingresa la nueva contraseña';
    else if (passwordNuevo.length < 8) newErrors.nuevo = 'Mínimo 8 caracteres';
    else if (passwordNuevo === passwordActual) newErrors.nuevo = 'La nueva contraseña debe ser diferente';
    if (!passwordConfirmar) newErrors.confirmar = 'Confirma la nueva contraseña';
    else if (passwordNuevo !== passwordConfirmar) newErrors.confirmar = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCambiar = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.cambiarPasswordInicial(passwordActual, passwordNuevo);
      toast.success('Contraseña cambiada exitosamente');
      // Recargar datos del usuario para actualizar debe_cambiar_password = false
      await refreshUser();
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        'Error al cambiar la contraseña. Verifica tu contraseña actual.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>PoliGer</Text>
        <Text style={styles.subtitle}>ECUAGENERA</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Warning banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠</Text>
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Contraseña temporal</Text>
            <Text style={styles.warningBody}>
              Por seguridad, debes cambiar tu contraseña antes de continuar.
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Establece tu contraseña</Text>

        {/* Contraseña actual */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={[styles.input, errors.actual && styles.inputError]}
            placeholder="Ingresa la contraseña recibida por email"
            placeholderTextColor="#999"
            secureTextEntry
            value={passwordActual}
            onChangeText={(t) => { setPasswordActual(t); setErrors(({ actual: _, ...rest }) => rest); }}
            editable={!isLoading}
          />
          {errors.actual && <Text style={styles.errorText}>{errors.actual}</Text>}
        </View>

        {/* Nueva contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={[styles.input, errors.nuevo && styles.inputError]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#999"
            secureTextEntry
            value={passwordNuevo}
            onChangeText={(t) => { setPasswordNuevo(t); setErrors(({ nuevo: _, ...rest }) => rest); }}
            editable={!isLoading}
          />
          {errors.nuevo && <Text style={styles.errorText}>{errors.nuevo}</Text>}
        </View>

        {/* Confirmar nueva contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={[styles.input, errors.confirmar && styles.inputError]}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={passwordConfirmar}
            onChangeText={(t) => { setPasswordConfirmar(t); setErrors(({ confirmar: _, ...rest }) => rest); }}
            editable={!isLoading}
          />
          {errors.confirmar && <Text style={styles.errorText}>{errors.confirmar}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCambiar}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutLink} onPress={logout} disabled={isLoading}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const PRIMARY = '#182d49';
const ACCENT = '#e9ad14';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f8fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: PRIMARY,
    letterSpacing: 1.5,
    textShadowColor: ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: ACCENT,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 3,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF9E7',
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 20,
    color: '#92600A',
    marginRight: 10,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontWeight: '700',
    color: '#92600A',
    fontSize: 14,
    marginBottom: 2,
  },
  warningBody: {
    color: '#92600A',
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: ACCENT,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  logoutLink: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  logoutText: {
    color: '#888',
    fontSize: 14,
  },
});

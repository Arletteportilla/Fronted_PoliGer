import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authService } from '@/services/auth.service';
import * as SecureStore from '@/services/secureStore';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenCleaner, setShowTokenCleaner] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingrese su usuario y contraseña para continuar');
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      await login(username, password);
    } catch (error: any) {
      console.error('Error en login:', error);

      let errorTitle = 'Error de autenticación';
      let errorMessage = 'No se pudo iniciar sesión. Por favor intente nuevamente.';

      // Manejar diferentes tipos de errores
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorTitle = 'Credenciales incorrectas';
          errorMessage = 'El usuario o la contraseña que ingresaste son incorrectos.\n\nPor favor verifica tus credenciales e intenta nuevamente.';
        } else if (status === 400) {
          errorTitle = 'Datos inválidos';
          errorMessage = data?.detail || data?.message || 'Los datos ingresados no son válidos. Por favor revisa e intenta nuevamente.';
        } else if (status === 403) {
          errorTitle = 'Acceso denegado';
          errorMessage = 'Tu cuenta no tiene permisos para acceder al sistema. Contacta al administrador.';
        } else if (status === 500) {
          errorTitle = 'Error del servidor';
          errorMessage = 'Ocurrió un error en el servidor. Por favor intenta más tarde.';
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      } else if (error.message) {
        if (error.message.includes('Network')) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se pudo conectar con el servidor.\n\nVerifica tu conexión a internet e intenta nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }

      setHasError(true);

      // Limpiar usuario y contraseña por seguridad
      setUsername('');
      setPassword('');

      Alert.alert(errorTitle, errorMessage, [
        {
          text: 'Reintentar',
          onPress: () => {
            setHasError(false);
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>PoliGer</Text>
        <Text style={styles.ecuagenera}>ECUAGENERA</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={[styles.input, hasError && styles.inputError]}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#999"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setHasError(false);
            }}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, hasError && styles.inputError]}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setHasError(false);
            }}
            editable={!isLoading}
          />
        </View>

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Verifica tus credenciales e intenta nuevamente
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f8fa',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 6,
    letterSpacing: 1.5,
    textShadowColor: '#e9ad14',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ecuagenera: {
    color: '#e9ad14',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(25,45,73,0.10)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 18,
    shadowColor: '#182d49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e1e1e1', // gris claro
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#182d49',
    marginBottom: 7,
    marginLeft: 4,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e1e1e1', // gris claro
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#121212',
    fontWeight: '500',
    shadowColor: '#e9ad14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#182d49',
    marginTop: 10,
    shadowColor: '#e9ad14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    paddingHorizontal: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  cleanButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.9,
  },
  cleanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;

import { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/services/logger';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Por favor ingrese su usuario y contraseña para continuar');
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      await login(username, password);
    } catch (error: any) {
      logger.error('Error en login:', error);
      setHasError(true);
      // Limpiar usuario y contraseña por seguridad
      setUsername('');
      setPassword('');
      // El AuthContext ya muestra el toast de error
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
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput, hasError && styles.inputError]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setHasError(false);
              }}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(prev => !prev)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>
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
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 13,
    padding: 2,
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
});

export default LoginScreen;

import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/services/logger';

type Step = 'email' | 'code';

const RESET_STATE_KEY = 'poliger_reset_state';
const RESET_TTL_MS = 15 * 60 * 1000;

function saveResetState(email: string, step: Step) {
  try {
    localStorage.setItem(RESET_STATE_KEY, JSON.stringify({ email, step, ts: Date.now() }));
  } catch {}
}

function clearResetState() {
  try { localStorage.removeItem(RESET_STATE_KEY); } catch {}
}

function loadResetState(): { email: string; step: Step } | null {
  try {
    const raw = localStorage.getItem(RESET_STATE_KEY);
    if (!raw) return null;
    const { email, step, ts } = JSON.parse(raw);
    if (Date.now() - ts > RESET_TTL_MS) {
      localStorage.removeItem(RESET_STATE_KEY);
      return null;
    }
    return { email, step };
  } catch {
    return null;
  }
}

const TOTAL_STEPS = 2;

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = loadResetState();
    if (saved) {
      setEmail(saved.email);
      setStep(saved.step);
      if (saved.step === 'code') {
        toast.info?.('Sesión de recuperación restaurada. Ingresa el código que recibiste.');
      }
    }
  }, []);

  const stepNumber = step === 'email' ? 1 : 2;

  const handleEnviarCodigo = async () => {
    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setIsLoading(true);
    try {
      await authService.solicitarResetPassword(email.trim());
      toast.success('Código enviado. Revisa tu bandeja de entrada.');
      saveResetState(email.trim(), 'code');
      setStep('code');
    } catch (error: any) {
      logger.error('Error enviando código de reset:', error);
      const msg = error?.response?.data?.error ?? 'Ocurrió un error. Inténtalo de nuevo.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarReset = async () => {
    if (!code.trim() || !passwordNuevo || !passwordConfirm) {
      toast.error('Completa todos los campos');
      return;
    }
    if (passwordNuevo.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordNuevo !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    try {
      await authService.confirmarResetPassword(email.trim(), code.trim(), passwordNuevo);
      clearResetState();
      toast.success('Contraseña restablecida. Ya puedes iniciar sesión.');
      router.replace('/login');
    } catch (error: any) {
      logger.error('Error confirmando reset password:', error);
      const msg = error?.response?.data?.error ?? 'Código inválido o expirado.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      saveResetState(email, 'email');
      setStep('email');
      setCode('');
      setPasswordNuevo('');
      setPasswordConfirm('');
    } else {
      clearResetState();
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>PoliGer</Text>
        <Text style={styles.ecuagenera}>ECUAGENERA</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Indicador de pasos */}
        <View style={styles.stepsRow}>
          {[1, 2].map((n, i) => (
            <View key={n} style={styles.stepItem}>
              <View style={[styles.stepDot, stepNumber >= n && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, stepNumber >= n && styles.stepDotTextActive]}>
                  {n}
                </Text>
              </View>
              {i < 1 && (
                <View style={[styles.stepLine, stepNumber > n && styles.stepLineActive]} />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>Paso {stepNumber} de {TOTAL_STEPS}</Text>

        {/* Paso 1: Correo */}
        {step === 'email' && (
          <>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electrónico y te enviaremos un código de verificación.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleEnviarCodigo} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar código</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Paso 2: Código + nueva contraseña */}
        {step === 'code' && (
          <>
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa el código de 6 dígitos que enviamos a{' '}
              <Text style={styles.emailInline}>{email}</Text>
              {' '}y tu nueva contraseña.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de verificación</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor="#999"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={passwordNuevo}
                  onChangeText={setPasswordNuevo}
                  editable={!isLoading}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(p => !p)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Repite tu nueva contraseña"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPasswordConfirm}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  editable={!isLoading}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPasswordConfirm(p => !p)}>
                  <Ionicons name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleConfirmarReset} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Restablecer contraseña</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Botón volver */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isLoading}>
          <Ionicons name="arrow-back-outline" size={16} color="#182d49" style={styles.backIcon} />
          <Text style={styles.backButtonText}>
            {step === 'email' ? 'Volver al inicio de sesión' : 'Atrás'}
          </Text>
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
    borderColor: '#e1e1e1',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#182d49',
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#182d49',
  },
  stepLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 14,
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#182d49',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  emailInline: {
    fontWeight: '700',
    color: '#182d49',
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
    borderColor: '#e1e1e1',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#121212',
    fontWeight: '500',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 10,
    color: '#182d49',
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
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#182d49',
    marginTop: 4,
    shadowColor: '#e9ad14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 8,
  },
  backIcon: {
    marginRight: 4,
  },
  backButtonText: {
    color: '#182d49',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;

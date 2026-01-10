import React, { useState, useEffect } from 'react';
import { logger } from '@/services/logger';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROLES, RolePermissionsCard } from './RolePermissionsCard';
import { Colors } from '@/constants/Colors';

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateUser: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  rol: 'TIPO_1' | 'TIPO_2' | 'TIPO_3' | 'TIPO_4';
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
  onCreateUser
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    rol: 'TIPO_3'
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [formKey, setFormKey] = useState(0); // Key para forzar re-render del formulario

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      // Resetear inmediatamente
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        rol: 'TIPO_3'
      });
      setErrors({});
      setShowPassword(false);
      setShowPasswordConfirm(false);
      setLoading(false);
      
      // Forzar re-render completo cambiando la key después de un pequeño delay
      // Esto asegura que los inputs se recreen completamente
      const timer = setTimeout(() => {
        setFormKey(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Cuando se cierra, también resetear
      resetForm();
    }
  }, [visible]);

  // Función para resetear el formulario
  const resetForm = () => {
    // Incrementar key para forzar re-render
    setFormKey(prev => prev + 1);
    
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
      rol: 'TIPO_3'
    });
    setErrors({});
    setShowPassword(false);
    setShowPasswordConfirm(false);
    setLoading(false);
  };

  const validateForm = (): boolean => {
    logger.debug(' Iniciando validación del formulario...');
    logger.info('📋 Datos a validar:', formData);
    
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    // Validar campos requeridos
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
      logger.error(' Username: vacío');
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
      logger.error(' Username: muy corto (', formData.username.length, 'caracteres)');
    } else {
      logger.success(' Username: válido');
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
      logger.error(' Email: vacío');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      logger.error(' Email: formato inválido');
    } else {
      logger.success(' Email: válido');
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
      logger.error(' First name: vacío');
    } else {
      logger.success(' First name: válido');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
      logger.error(' Last name: vacío');
    } else {
      logger.success(' Last name: válido');
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      logger.error(' Password: vacío');
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      logger.error(' Password: muy corto (', formData.password.length, 'caracteres, necesita 8)');
    } else {
      logger.success(' Password: válido');
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden';
      logger.error(' Password confirm: no coincide');
    } else {
      logger.success(' Password confirm: válido');
    }

    logger.info('📊 Errores encontrados:', newErrors);
    logger.info('🎯 Validación', Object.keys(newErrors).length === 0 ? 'EXITOSA' : 'FALLÓ');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    logger.info('🔘 CreateUserModal.handleSubmit - Botón presionado');
    logger.info('📋 Datos del formulario:', formData);
    logger.start(' Loading actual:', loading);
    
    if (!validateForm()) {
      logger.error(' Validación falló, mostrando errores al usuario');
      const errorMessages = Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('\n');
      logger.info('📝 Mensajes de error:', errorMessages);
      
      Alert.alert(
        'Errores en el formulario', 
        'Por favor corrige los siguientes errores:\n\n' + errorMessages
      );
      return;
    }

    logger.success(' Validación exitosa, iniciando creación...');
    setLoading(true);
    
    try {
      logger.info('🚀 Llamando a onCreateUser...');
      await onCreateUser(formData);
      logger.success(' onCreateUser completado exitosamente');

      // Reset form y cerrar modal
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('❌ Error en handleSubmit:', error);
      
      let errorMessage = 'Error al crear usuario';

      if (error.response?.data) {
        // Si hay errores específicos por campo
        if (typeof error.response.data === 'object') {
          const errorDetails = Object.entries(error.response.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          errorMessage = errorDetails || errorMessage;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error al crear usuario', errorMessage);
    } finally {
      logger.info('🏁 Finalizando handleSubmit, setting loading to false');
      setLoading(false);
    }
  };

  const updateField = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalOverlayBackground}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              resetForm();
              onClose();
            }}
          />
          <View
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconCircle}>
                  <Ionicons name="person-add" size={28} color={Colors.light.accent} />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>
                  <Text style={styles.modalSubtitle}>Complete la información del usuario</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  resetForm();
                  onClose();
                }} 
                style={styles.closeButton}
                accessibilityLabel="Cerrar modal"
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              key={`form-scroll-${formKey}`}
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Información Personal */}
              <View key={`form-section-${formKey}`} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color={Colors.light.tint} />
                  <Text style={styles.sectionTitle}>Información Personal</Text>
                </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    key={`first_name-${formKey}`}
                    style={[styles.input, errors.first_name && styles.inputError]}
                    placeholder="Juan"
                    placeholderTextColor="#9ca3af"
                    value={formData.first_name || ''}
                    defaultValue=""
                    onChangeText={(value) => updateField('first_name', value)}
                    editable={!loading}
                    autoComplete="off"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                    autoCapitalize="words"
                    {...(Platform.OS === 'web' && {
                      // Propiedades específicas para web
                      name: `first_name_${formKey}_${Date.now()}`,
                      autoComplete: 'off',
                      'data-form-type': 'other',
                    })}
                  />
                  {errors.first_name && (
                    <Text style={styles.errorText}>{errors.first_name}</Text>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Apellido *</Text>
                  <TextInput
                    key={`last_name-${formKey}`}
                    style={[styles.input, errors.last_name && styles.inputError]}
                    placeholder="Pérez"
                    placeholderTextColor="#9ca3af"
                    value={formData.last_name || ''}
                    defaultValue=""
                    onChangeText={(value) => updateField('last_name', value)}
                    editable={!loading}
                    autoComplete="off"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                    autoCapitalize="words"
                    {...(Platform.OS === 'web' && {
                      name: `last_name_${formKey}_${Date.now()}`,
                      autoComplete: 'off',
                      'data-form-type': 'other',
                    })}
                  />
                  {errors.last_name && (
                    <Text style={styles.errorText}>{errors.last_name}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  key={`email-${formKey}`}
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor="#9ca3af"
                  value={formData.email || ''}
                  defaultValue=""
                  onChangeText={(value) => updateField('email', value.toLowerCase())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="none"
                  editable={!loading}
                  {...(Platform.OS === 'web' && {
                    name: `email_${formKey}_${Date.now()}`,
                    autoComplete: 'off',
                    'data-form-type': 'other',
                    type: 'email',
                  })}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            </View>

              {/* Credenciales */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="key-outline" size={20} color={Colors.light.tint} />
                  <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
                </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre de Usuario *</Text>
                <TextInput
                  key={`username-${formKey}`}
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="usuario123"
                  placeholderTextColor="#9ca3af"
                  value={formData.username || ''}
                  defaultValue=""
                  onChangeText={(value) => updateField('username', value.toLowerCase())}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="none"
                  editable={!loading}
                  {...(Platform.OS === 'web' && {
                    name: `username_${formKey}_${Date.now()}`,
                    autoComplete: 'off',
                    'data-form-type': 'other',
                  })}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
                <Text style={styles.helpText}>Mínimo 3 caracteres, sin espacios</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    key={`password-${formKey}`}
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={formData.password || ''}
                    defaultValue=""
                    onChangeText={(value) => updateField('password', value)}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                    editable={!loading}
                    {...(Platform.OS === 'web' && {
                      name: `password_${formKey}_${Date.now()}`,
                      autoComplete: 'new-password',
                      'data-form-type': 'other',
                      type: 'password',
                    })}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                <Text style={styles.helpText}>Mínimo 8 caracteres</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    key={`password_confirm-${formKey}`}
                    style={[styles.passwordInput, errors.password_confirm && styles.inputError]}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={formData.password_confirm || ''}
                    defaultValue=""
                    onChangeText={(value) => updateField('password_confirm', value)}
                    secureTextEntry={!showPasswordConfirm}
                    autoComplete="new-password"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                    editable={!loading}
                    {...(Platform.OS === 'web' && {
                      name: `password_confirm_${formKey}_${Date.now()}`,
                      autoComplete: 'new-password',
                      'data-form-type': 'other',
                      type: 'password',
                    })}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswordConfirm ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password_confirm && (
                  <Text style={styles.errorText}>{errors.password_confirm}</Text>
                )}
              </View>
            </View>

              {/* Rol y Permisos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-outline" size={20} color={Colors.light.tint} />
                  <Text style={styles.sectionTitle}>Rol y Permisos</Text>
                </View>

              <View style={styles.rolesGrid}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.code}
                    style={[
                      styles.roleCard,
                      formData.rol === role.code && styles.roleCardSelected,
                      { borderColor: formData.rol === role.code ? role.color : '#E5E7EB' }
                    ]}
                    onPress={() => updateField('rol', role.code as any)}
                    disabled={loading}
                  >
                    <View style={[
                      styles.roleIcon,
                      formData.rol === role.code 
                        ? { backgroundColor: hexToRgba(role.color, 0.15) }
                        : { backgroundColor: hexToRgba(role.color, 0.08) }
                    ]}>
                      <Ionicons
                        name={role.icon}
                        size={24}
                        color={role.color}
                      />
                    </View>
                    <Text style={[
                      styles.roleName,
                      formData.rol === role.code && styles.roleNameSelected
                    ]}>
                      {role.name}
                    </Text>
                    <Text style={styles.roleDesc}>{role.description}</Text>
                    {formData.rol === role.code && (
                      <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

                {/* Mostrar permisos del rol seleccionado */}
                <View style={styles.permissionsPreview}>
                  <RolePermissionsCard role={formData.rol} />
                </View>
              </View>
            </ScrollView>

            {/* Footer con botones */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  onClose();
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={() => {
                  logger.info('🔘 Botón "Crear Usuario" presionado');
                  logger.start(' Loading state:', loading);
                  logger.info('📋 Form data:', formData);
                  handleSubmit();
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear Usuario</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    zIndex: 2,
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(233, 173, 20, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(233, 173, 20, 0.2)',
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.tint,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.tint,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 18,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 48,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
    zIndex: 10,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 8,
  },
  roleCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardSelected: {
    backgroundColor: '#fafbfc',
    borderWidth: 3,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.tint,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  roleNameSelected: {
    color: Colors.light.tint,
    fontWeight: '800',
    fontSize: 16,
  },
  roleDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  permissionsPreview: {
    marginTop: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 14,
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.tint,
    letterSpacing: 0.3,
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

import React, { useState, useEffect } from 'react';
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
import { UserWithProfile } from '@/types';

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onEditUser: (userId: number, userData: Partial<UserFormData>) => Promise<void>;
  user: UserWithProfile | null;
}

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: 'TIPO_1' | 'TIPO_2' | 'TIPO_3' | 'TIPO_4';
  telefono?: string;
  departamento?: string;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  visible,
  onClose,
  onEditUser,
  user
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    rol: 'TIPO_3',
    telefono: '',
    departamento: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        rol: user.profile.rol,
        telefono: user.profile.telefono || '',
        departamento: user.profile.departamento || ''
      });
      setShowRoleDropdown(false);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      await onEditUser(user.id, formData);
      onClose();
    } catch (error: any) {
      Alert.alert('Error al editar usuario', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalOverlayBackground}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Editar Usuario</Text>
              <Text style={styles.modalSubtitle}>Modifica la información del usuario seleccionado</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setShowRoleDropdown(false)}
          >
            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={[styles.input, errors.first_name && styles.inputError]}
                  placeholder="Nombre"
                  value={formData.first_name}
                  onChangeText={(value) => updateField('first_name', value)}
                  editable={!loading}
                />
                {errors.first_name && (
                  <Text style={styles.errorText}>{errors.first_name}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={[styles.input, errors.last_name && styles.inputError]}
                  placeholder="Apellido"
                  value={formData.last_name}
                  onChangeText={(value) => updateField('last_name', value)}
                  editable={!loading}
                />
                {errors.last_name && (
                  <Text style={styles.errorText}>{errors.last_name}</Text>
                )}
              </View>
            </View>

            {/* Nombre de usuario */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de Usuario *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Nombre de usuario"
                value={formData.username}
                onChangeText={(value) => updateField('username', value.toLowerCase())}
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value.toLowerCase())}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Teléfono */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.telefono || ''}
                onChangeText={(value) => updateField('telefono', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Rol */}
            <View style={styles.inputContainerWithDropdown}>
              <Text style={styles.label}>Rol</Text>
              <TouchableOpacity
                style={styles.selectContainer}
                onPress={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                }}
                disabled={loading}
              >
                <Text style={styles.selectValueText}>
                  {ROLES.find(r => r.code === formData.rol)?.name || 'Seleccionar rol'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
              {showRoleDropdown && (
                <View style={styles.selectDropdown}>
                  {ROLES.map((role) => (
                    <TouchableOpacity
                      key={role.code}
                      style={[
                        styles.selectOption,
                        formData.rol === role.code && styles.selectOptionSelected
                      ]}
                      onPress={() => {
                        updateField('rol', role.code as any);
                        setShowRoleDropdown(false);
                      }}
                      disabled={loading}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        formData.rol === role.code && styles.selectOptionTextSelected
                      ]}>
                        {role.name}
                      </Text>
                      {formData.rol === role.code && (
                        <Ionicons name="checkmark" size={20} color="#182d49" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {showRoleDropdown && (
                <View style={styles.selectDropdownSpacer} />
              )}
            </View>

            {/* Especialización (Departamento) */}
            <View style={[styles.inputContainer, showRoleDropdown && styles.inputContainerWithSpacer]}>
              <Text style={styles.label}>Especialización</Text>
              <TextInput
                style={styles.input}
                placeholder="Especialización"
                value={formData.departamento || ''}
                onChangeText={(value) => updateField('departamento', value)}
                editable={!loading}
                onFocus={() => setShowRoleDropdown(false)}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 2,
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  inputContainerWithDropdown: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1000,
  },
  inputContainerWithSpacer: {
    marginTop: 200,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  selectContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  selectValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  selectValueText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 10000,
    maxHeight: 200,
    overflow: 'hidden',
  },
  selectDropdownSpacer: {
    height: 200,
    marginTop: 4,
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectOptionSelected: {
    backgroundColor: '#F9FAFB',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectOptionTextSelected: {
    color: '#1f2937',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

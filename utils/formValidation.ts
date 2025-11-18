// Form validation utilities - extracted from germinaciones.tsx
import { Alert } from 'react-native';

export const validateNumericInput = (text: string): string => {
  // Solo permite números
  return text.replace(/[^0-9]/g, '');
};

export const validateRequiredFields = (form: any, requiredFields: Array<{key: string, label: string}>): boolean => {
  const missingFields = [];

  for (const field of requiredFields) {
    const value = form[field.key as keyof typeof form];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field.label);
    }
  }

  if (missingFields.length > 0) {
    const errorMessage = `Los siguientes campos son obligatorios:\n\n• ${missingFields.join('\n• ')}`;
    Alert.alert('Campos Obligatorios', errorMessage);
    return false;
  }

  return true;
};

export const areAllRequiredFieldsComplete = (form: any, requiredFields: string[]): boolean => {
  return requiredFields.every(field => {
    const value = form[field as keyof typeof form];
    return value && (typeof value !== 'string' || value.trim() !== '');
  });
};

export const getResponsableName = (user: any): string => {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user?.username || '';
};
import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  navy: '#182d49',
  gold: '#e9ad14',
  white: '#ffffff',
};

interface SelectorOption {
  label: string;
  value: string;
}

interface ExportSelectorProps {
  label: string;
  value: string;
  options: SelectorOption[];
  onChange: (value: any) => void;
}

/**
 * Componente selector reutilizable que funciona tanto en web como en móvil
 */
export const ExportSelector: React.FC<ExportSelectorProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              cursor: 'pointer',
              zIndex: 2,
            }}
            tabIndex={0}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: COLORS.navy,
              border: `1px solid ${COLORS.gold}`,
              borderRadius: 8,
              padding: '12px 14px',
              color: COLORS.white,
              fontWeight: 'bold',
              fontSize: 16,
              minHeight: 44,
              boxSizing: 'border-box',
              transition: 'box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(25,45,73,0.04)',
              cursor: 'pointer',
              marginBottom: 0,
            }}
            onClick={(e) => {
              const select = (e.currentTarget.parentElement?.querySelector('select') as HTMLSelectElement);
              if (select) select.focus();
            }}
          >
            <span>{options.find((opt) => opt.value === value)?.label}</span>
            {/* Flecha dorada SVG */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginLeft: 8 }}>
              <path
                d="M5 8l5 5 5-5"
                stroke="#e9ad14"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </View>
    );
  }

  // Versión móvil (iOS/Android)
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={value} onValueChange={onChange}>
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    marginBottom: 16,
  },
});

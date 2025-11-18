import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Option {
  value: string;
  label: string;
}

interface OptionsPickerProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  style?: any;
  enabled?: boolean;
}

export const OptionsPicker: React.FC<OptionsPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Seleccionar...",
  label,
  style,
  enabled = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.pickerContainer, !enabled && styles.disabled]}>
        <Picker
          selectedValue={selectedValue || ''}
          onValueChange={onValueChange}
          enabled={enabled}
          style={styles.picker}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  picker: {
    height: 50,
  },
});
export default OptionsPicker;
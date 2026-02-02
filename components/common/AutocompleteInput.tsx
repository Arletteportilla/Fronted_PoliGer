import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  onSelectionChange?: (selectedValue: string) => void;
  style?: any;
  inputStyle?: any;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChangeText,
  placeholder = '',
  suggestions = [],
  onSelectSuggestion,
  onSelectionChange,
  style,
  inputStyle,
  iconName,
  iconSize = 20,
  iconColor = '#182d49',
  label,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Filtrar sugerencias basadas en el valor actual
  useEffect(() => {
    if (value && value.length > 0) {
      const filtered = suggestions
        .filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10); // Limitar a 10 sugerencias

      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [value, suggestions]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    setIsOpen(false);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    if (onSelectionChange) {
      onSelectionChange(suggestion);
    }
  };

  const handleInputFocus = () => {
    if (value && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir que se ejecute el onPress de las sugerencias
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        disabled && styles.disabled,
        isOpen && styles.inputContainerFocused
      ]}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={iconSize} 
            color={iconColor} 
            style={styles.inputIcon} 
          />
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            inputStyle,
            disabled && styles.inputDisabled
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          editable={!disabled}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        
        {value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText('');
              setIsOpen(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {isOpen && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`${suggestion}-${index}`}
                style={[
                  styles.suggestionItem,
                  index === filteredSuggestions.length - 1 && styles.suggestionItemLast
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Ionicons 
                  name="search-outline" 
                  size={16} 
                  color="#6B7280" 
                  style={styles.suggestionIcon} 
                />
                <Text style={styles.suggestionText}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182d49',
    marginBottom: 6,
  },
  required: {
    color: '#e9ad14',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ad14',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#182d49',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainerFocused: {
    borderColor: '#182d49',
    shadowOpacity: 0.15,
  },
  disabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#182d49',
    paddingVertical: 0,
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ad14',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#182d49',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionsScroll: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#182d49',
    flex: 1,
  },
});

export default AutocompleteInput;

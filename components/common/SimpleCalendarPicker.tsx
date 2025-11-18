import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleCalendarPickerProps {
  value?: string; // Formato YYYY-MM-DD
  onDateChange?: (date: string) => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

// Hook responsivo
const useResponsiveDimensions = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  return {
    width: screenData.width,
    height: screenData.height,
    isTablet: screenData.width >= 768,
    isSmallScreen: screenData.width < 400,
  };
};

export function SimpleCalendarPicker({ 
  value, 
  onDateChange, 
  placeholder = 'Seleccionar fecha',
  style,
  disabled = false,
  label,
  required = false
}: SimpleCalendarPickerProps) {
  const responsive = useResponsiveDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getInitialTextValue = (): string => {
    if (value) {
      try {
        return formatDate(new Date(value));
      } catch {
        return '';
      }
    }
    return '';
  };

  const [textValue, setTextValue] = useState<string>(getInitialTextValue());
  
  // Actualizar el texto cuando cambia el value prop
  useEffect(() => {
    if (value) {
      const formatted = formatDate(new Date(value));
      setTextValue(formatted);
    } else {
      setTextValue('');
    }
  }, [value]);

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validar y parsear fecha desde texto
  const parseDateFromText = (text: string): Date | null => {
    // Intentar parsear formato DD/MM/YYYY o DD-MM-YYYY
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];
    
    for (const format of formats) {
      const match = text.match(format);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Los meses son 0-indexed
        const year = parseInt(match[3], 10);
        
        const date = new Date(year, month, day);
        
        // Validar que la fecha sea válida
        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        ) {
          return date;
        }
      }
    }
    
    return null;
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
  };

  const handleTextBlur = () => {
    const parsedDate = parseDateFromText(textValue);
    if (parsedDate) {
      const dateString = formatDateForAPI(parsedDate);
      setSelectedDate(parsedDate);
      onDateChange?.(dateString);
      setTextValue(formatDate(parsedDate));
    } else if (textValue.trim() === '') {
      // Si está vacío, permitir vacío
      onDateChange?.('');
      setTextValue('');
    } else {
      // Si es inválido, restaurar el valor anterior
      if (value) {
        setTextValue(formatDate(new Date(value)));
      } else {
        setTextValue('');
      }
    }
  };

  const handleIconPress = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateString = formatDateForAPI(date);
    const formatted = formatDate(date);
    setTextValue(formatted);
    onDateChange?.(dateString);
    setIsVisible(false);
  };

  const handleConfirm = () => {
    const dateString = formatDateForAPI(selectedDate);
    const formatted = formatDate(selectedDate);
    setTextValue(formatted);
    onDateChange?.(dateString);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setSelectedDate(value ? new Date(value) : new Date());
    setIsVisible(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
      <View style={styles.calendarContainer}>
        {/* Header del calendario */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Ionicons name="chevron-back" size={20} color="#182d49" />
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>
            {currentMonth.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            }).toUpperCase()}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Ionicons name="chevron-forward" size={20} color="#182d49" />
          </TouchableOpacity>
        </View>

        {/* Días de la semana */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        {/* Grilla de días */}
        <View style={styles.daysGrid}>
          {days.map((dayData, index) => {
            const { date, isCurrentMonth } = dayData;
            const isSelectedDay = isSelected(date);
            const isTodayDate = isToday(date);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  !isCurrentMonth && styles.dayButtonInactive,
                  isSelectedDay && styles.dayButtonSelected,
                  isTodayDate && styles.dayButtonToday,
                ]}
                onPress={() => handleDateSelect(date)}
                disabled={!isCurrentMonth}
              >
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextInactive,
                  isSelectedDay && styles.dayTextSelected,
                  isTodayDate && styles.dayTextToday,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <View style={[styles.inputContainer, style, disabled && styles.disabled]}>
        <TouchableOpacity
          onPress={handleIconPress}
          disabled={disabled}
          activeOpacity={0.7}
          style={styles.iconButton}
        >
          <Ionicons
            name="calendar"
            size={26}
            color={disabled ? '#9CA3AF' : '#e9ad14'}
          />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.textInput,
            disabled && styles.inputTextDisabled,
            !textValue && styles.placeholderText
          ]}
          value={textValue}
          onChangeText={handleTextChange}
          onBlur={handleTextBlur}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          keyboardType="default"
        />
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View 
            style={[
              styles.modalContent,
              responsive.isTablet && styles.modalContentTablet,
              responsive.isSmallScreen && styles.modalContentSmall
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                responsive.isTablet && styles.modalTitleTablet
              ]}>🗓️ Seleccionar Fecha</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#182d49" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.calendarScrollView}>
              {renderCalendar()}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182d49',
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#e9ad14',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ad14',
    shadowColor: '#182d49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 56,
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(233, 173, 20, 0.15)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233, 173, 20, 0.3)',
    shadowColor: '#e9ad14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#182d49',
    fontWeight: '500',
    paddingVertical: 0,
    minHeight: 24,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  disabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  inputText: {
    fontSize: 16,
    color: '#182d49',
    fontWeight: '500',
  },
  inputTextDisabled: {
    color: '#6c757d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 45, 73, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#e9ad14',
  },
  modalContentTablet: {
    maxWidth: 500,
    width: '90%',
  },
  modalContentSmall: {
    maxWidth: '100%',
    width: '100%',
    margin: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e9ad14',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#182d49',
  },
  modalTitleTablet: {
    fontSize: 20,
  },
  calendarScrollView: {
    maxHeight: 400,
  },
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ad14',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#182d49',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#182d49',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  dayButtonInactive: {
    opacity: 0.3,
  },
  dayButtonSelected: {
    backgroundColor: '#e9ad14',
    shadowColor: '#e9ad14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayButtonToday: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ad14',
  },
  dayText: {
    fontSize: 16,
    color: '#182d49',
    fontWeight: '500',
  },
  dayTextInactive: {
    color: '#6c757d',
  },
  dayTextSelected: {
    color: '#182d49',
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: '#e9ad14',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6c757d',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#495057',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e9ad14',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#182d49',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
  },
});
export default SimpleCalendarPicker;
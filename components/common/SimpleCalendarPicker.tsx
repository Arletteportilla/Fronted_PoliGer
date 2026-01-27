import { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

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

// Función para parsear fecha YYYY-MM-DD de forma local (evita problemas de timezone)
const parseLocalDate = (dateString: string): Date => {
  const parts = dateString.split('-').map(Number);
  const year = parts[0] || 0;
  const month = (parts[1] || 1) - 1; // Los meses son 0-indexed
  const day = parts[2] || 1;
  return new Date(year, month, day);
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
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? parseLocalDate(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? parseLocalDate(value) : new Date());

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
        return formatDate(parseLocalDate(value));
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
      const formatted = formatDate(parseLocalDate(value));
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
      if (match && match[1] && match[2] && match[3]) {
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
        setTextValue(formatDate(parseLocalDate(value)));
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
    setSelectedDate(value ? parseLocalDate(value) : new Date());
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

  const styles = createStyles(colors);

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
            <Ionicons name="chevron-back" size={20} color={colors.accent.primary} />
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
            <Ionicons name="chevron-forward" size={20} color={colors.accent.primary} />
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
      
      <View style={styles.inputWrapper}>
        <TouchableOpacity
          onPress={handleIconPress}
          disabled={disabled}
          activeOpacity={0.7}
          style={[styles.inputContainer, style, disabled && styles.disabled]}
        >
          <View style={styles.iconButton}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={disabled ? colors.text.disabled : colors.text.tertiary}
            />
          </View>
          <Text style={[
            styles.textInput,
            disabled && styles.inputTextDisabled,
            !textValue && styles.placeholderText
          ]}>
            {textValue || placeholder}
          </Text>
        </TouchableOpacity>

        {/* Dropdown Calendar - Usando Modal para evitar problemas de z-index */}
        <Modal
          visible={isVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancel}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Seleccionar Fecha</Text>
              </View>
              
              <ScrollView style={styles.calendarScrollView}>
                {renderCalendar()}
              </ScrollView>
              
              <View style={styles.dropdownButtons}>
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
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/utils/colors').getColors>) => StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 999999,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: colors.status.error,
    fontWeight: 'bold',
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 999999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 52,
  },
  iconButton: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    color: colors.text.disabled,
    fontWeight: '400',
  },
  disabled: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.default,
  },
  inputText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  inputTextDisabled: {
    color: colors.text.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dropdownHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  calendarScrollView: {
    maxHeight: 260,
  },
  calendarContainer: {
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  monthYear: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 2,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.tertiary,
    paddingVertical: 2,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 2,
  },
  dayButtonInactive: {
    opacity: 0.3,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary.main,
  },
  dayButtonToday: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  dayText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  dayTextInactive: {
    color: colors.text.disabled,
  },
  dayTextSelected: {
    color: colors.text.inverse,
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  dropdownButtons: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.primary,
  },
});
export default SimpleCalendarPicker;
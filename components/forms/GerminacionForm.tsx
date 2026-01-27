import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { SimpleCalendarPicker } from '@/components/common';
import { AutocompleteInput } from '@/components/common';
import { PredictionDisplay } from '@/components/prediction';
import { CLIMAS, ESTADOS_CAPSULA, ESTADOS_SEMILLA, CANTIDADES_SEMILLA, NIVELES } from '@/utils/constants';
import { validateNumericInput } from '@/utils/formValidation';
import { germinacionService } from '@/services/germinacion.service';
import { logger } from '@/services/logger';

interface GerminacionFormProps {
  visible: boolean;
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  saving: boolean;
  codigosDisponibles: string[];
  especiesDisponibles: string[];
  perchasDisponibles: string[];
  nivelesDisponibles: string[];
  handleCodigoSelection: (codigo: string) => void;
  handleEspecieSelection: (especie: string) => void;
  useOwnModal?: boolean; // Nuevo prop para controlar si usa su propio Modal
}

export const GerminacionForm: React.FC<GerminacionFormProps> = ({
  visible,
  onClose,
  form,
  setForm,
  onSubmit,
  saving,
  codigosDisponibles,
  especiesDisponibles,
  perchasDisponibles,
  nivelesDisponibles,
  handleCodigoSelection,
  handleEspecieSelection,
  useOwnModal = true, // Por defecto usa su propio Modal
}) => {
  const [showClimaPicker, setShowClimaPicker] = useState(false);
  const [showEstadoCapsula, setShowEstadoCapsula] = useState(false);
  const [showEstadoSemilla, setShowEstadoSemilla] = useState(false);
  const [showCantidadSemilla, setShowCantidadSemilla] = useState(false);
  const [showNivel, setShowNivel] = useState(false);

  // Estados para predicción automática
  const [prediccionData, setPrediccionData] = useState<any>(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const prediccionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DEBUG: Log códigos y especies disponibles cuando cambian o cuando el modal se abre
  useEffect(() => {
    if (visible) {
      logger.debug(' DEBUG - GerminacionForm: Modal opened');
      logger.debug(' DEBUG - GerminacionForm: codigosDisponibles recibidos:', codigosDisponibles.length);
      logger.debug(' DEBUG - GerminacionForm: Primeros 5 códigos:', codigosDisponibles.slice(0, 5));
      logger.debug(' DEBUG - GerminacionForm: especiesDisponibles recibidas:', especiesDisponibles.length);
      logger.debug(' DEBUG - GerminacionForm: Primeras 5 especies:', especiesDisponibles.slice(0, 5));
      logger.debug(' DEBUG - GerminacionForm: handleEspecieSelection definido:', typeof handleEspecieSelection);
    }
  }, [visible, codigosDisponibles, especiesDisponibles, handleEspecieSelection]);

  // Estado para validación de código único en tiempo real
  const [codigoValidation, setCodigoValidation] = useState<{
    isValidating: boolean;
    disponible: boolean | null;
    mensaje: string;
  }>({
    isValidating: false,
    disponible: null,
    mensaje: ''
  });

  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validar código único en tiempo real con debouncing
  useEffect(() => {
    // Limpiar timeout anterior
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Si el código está vacío, resetear validación
    if (!form.codigo || form.codigo.trim() === '') {
      setCodigoValidation({
        isValidating: false,
        disponible: null,
        mensaje: ''
      });
      return;
    }

    // Mostrar estado de validación
    setCodigoValidation({
      isValidating: true,
      disponible: null,
      mensaje: 'Verificando...'
    });

    // Validar después de 800ms de inactividad
    validationTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await germinacionService.validateCodigoUnico(form.codigo);
        setCodigoValidation({
          isValidating: false,
          disponible: result.disponible,
          mensaje: result.mensaje
        });
      } catch (error) {
        logger.error('Error validando código:', error);
        setCodigoValidation({
          isValidating: false,
          disponible: null,
          mensaje: 'Error al validar'
        });
      }
    }, 800);

    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [form.codigo]);

  // Calcular predicción automáticamente cuando los campos necesarios estén completos
  useEffect(() => {
    // Limpiar timeout anterior
    if (prediccionTimeoutRef.current) {
      clearTimeout(prediccionTimeoutRef.current);
    }

    // Verificar si todos los campos necesarios están completos
    const camposCompletos =
      form.especie_variedad && form.especie_variedad.trim() !== '' &&
      form.genero && form.genero.trim() !== '' &&
      form.fecha_siembra && form.fecha_siembra.trim() !== '' &&
      form.clima && form.clima.trim() !== '';

    // Si no están completos, resetear predicción
    if (!camposCompletos) {
      setPrediccionData(null);
      return;
    }

    // Mostrar estado de carga
    setLoadingPrediccion(true);

    // Calcular predicción después de 1 segundo de inactividad
    prediccionTimeoutRef.current = setTimeout(async () => {
      try {
        const formDataPrediccion = {
          especie: form.especie_variedad,
          genero: form.genero,
          fecha_siembra: form.fecha_siembra,
          clima: form.clima as 'I' | 'IW' | 'IC' | 'W' | 'C',
        };

        logger.info('🔮 GerminacionForm - Calculando predicción automática con:', formDataPrediccion);

        const resultado = await germinacionService.calcularPrediccionMejorada(formDataPrediccion);
        setPrediccionData(resultado);
        logger.success(' Predicción calculada:', resultado);
      } catch (error: any) {
        logger.error('❌ Error calculando predicción automática:', error);
        setPrediccionData(null);
      } finally {
        setLoadingPrediccion(false);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (prediccionTimeoutRef.current) {
        clearTimeout(prediccionTimeoutRef.current);
      }
    };
  }, [form.especie_variedad, form.genero, form.fecha_siembra, form.clima]);

  const renderFormField = (label: string, component: React.ReactNode, required: boolean = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, required && styles.fieldLabelRequired]}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      {component}
    </View>
  );

  // Contenido del formulario (sin header si no usa su propio modal)
  const formContent = (
    <ScrollView
      style={useOwnModal ? styles.popupScrollView : styles.sidePanelScrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={useOwnModal ? styles.popupContent : styles.sidePanelContent}
    >
      {/* Header del formulario - solo si usa su propio modal */}
      {useOwnModal && (
        <View style={styles.popupHeader}>
          <View style={styles.closeButton}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButtonInner}
            >
              <Ionicons name="close" size={24} color="#182d49" />
            </TouchableOpacity>
          </View>
          <Text style={styles.popupTitle}>Nueva Germinación</Text>
          <View style={styles.placeholder} />
        </View>
      )}

      {/* Contenido del formulario */}
            <View style={styles.formContainer}>
              {/* Sección de Fechas y Código */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="calendar-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Información Básica</Text>
                </View>

                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <SimpleCalendarPicker
                      label="Fecha de Siembra"
                      value={form.fecha_siembra}
                      onDateChange={(date: string) => setForm((f: any) => ({ ...f, fecha_siembra: date }))}
                      placeholder="Seleccionar fecha"
                      required={true}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    <AutocompleteInput
                      label="Código"
                      value={form.codigo}
                      onChangeText={(text) => setForm((prev: any) => ({ ...prev, codigo: text }))}
                      suggestions={codigosDisponibles}
                      onSelectSuggestion={handleCodigoSelection}
                      placeholder="Ingrese el código"
                    />

                    {/* Feedback de validación en tiempo real */}
                    {form.codigo && form.codigo.trim() !== '' && (
                      <View style={styles.validationFeedback}>
                        {codigoValidation.isValidating ? (
                          <View style={styles.validationRow}>
                            <ActivityIndicator size="small" color="#6B7280" />
                            <Text style={styles.validationTextValidating}>
                              {codigoValidation.mensaje}
                            </Text>
                          </View>
                        ) : codigoValidation.disponible === true ? (
                          <View style={styles.validationRow}>
                            <Ionicons 
                              name={codigoValidation.mensaje.includes('duplicado') ? 'information-circle' : 'checkmark-circle'} 
                              size={18} 
                              color={codigoValidation.mensaje.includes('duplicado') ? '#3B82F6' : '#10B981'} 
                            />
                            <Text style={[
                              styles.validationTextSuccess,
                              codigoValidation.mensaje.includes('duplicado') && styles.validationTextInfo
                            ]}>
                              {codigoValidation.mensaje}
                            </Text>
                          </View>
                        ) : codigoValidation.disponible === false ? (
                          <View style={styles.validationRow}>
                            <Ionicons name="close-circle" size={18} color="#EF4444" />
                            <Text style={styles.validationTextError}>
                              {codigoValidation.mensaje}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Sección de Planta */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="leaf-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Información de la Planta</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Género', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="flower-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TextInput
                          style={styles.modernInput}
                          value={form.genero}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, genero: v }))}
                          placeholder="Ingrese el género"
                        />
                      </View>
                    ), true)}
                  </View>

                  <View style={styles.inputColumn}>
                    {renderFormField('Especie/Variedad', (
                      <AutocompleteInput
                        value={form.especie_variedad}
                        onChangeText={(v: string) => setForm((f: any) => ({ ...f, especie_variedad: v }))}
                        suggestions={especiesDisponibles}
                        onSelectSuggestion={handleEspecieSelection}
                        placeholder="Ingrese la especie o variedad"
                      />
                    ), true)}
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Clima', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="partly-sunny-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowClimaPicker(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.clima && styles.placeholderText
                          ]}>
                            {form.clima ?
                              CLIMAS.find(opt => opt.value === form.clima)?.label || form.clima
                              : 'Seleccionar clima'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ), true)}

                    {showClimaPicker && (
                      <View style={styles.integratedDropdown}>
                        {CLIMAS.map((clima) => (
                          <TouchableOpacity
                            key={clima.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.clima === clima.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, clima: clima.value }));
                              setShowClimaPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.integratedDropdownOptionText,
                              form.clima === clima.value && styles.integratedDropdownOptionTextSelected
                            ]}>
                              {clima.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Sección de Estados */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="git-branch-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Estados</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Estado de Cápsula', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="ellipse-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowEstadoCapsula(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.estado_capsula && styles.placeholderText
                          ]}>
                            {form.estado_capsula ?
                              ESTADOS_CAPSULA.find(opt => opt.value === form.estado_capsula)?.label || form.estado_capsula
                              : 'Seleccionar estado'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ), true)}

                    {showEstadoCapsula && (
                      <View style={styles.integratedDropdown}>
                        {ESTADOS_CAPSULA.map((estado) => (
                          <TouchableOpacity
                            key={estado.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.estado_capsula === estado.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, estado_capsula: estado.value }));
                              setShowEstadoCapsula(false);
                            }}
                          >
                            <Text style={[
                              styles.integratedDropdownOptionText,
                              form.estado_capsula === estado.value && styles.integratedDropdownOptionTextSelected
                            ]}>
                              {estado.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputColumn}>
                    {renderFormField('Estado de Semilla', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="water-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowEstadoSemilla(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.estado_semilla && styles.placeholderText
                          ]}>
                            {form.estado_semilla ?
                              ESTADOS_SEMILLA.find(opt => opt.value === form.estado_semilla)?.label || form.estado_semilla
                              : 'Seleccionar estado'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ), true)}

                    {showEstadoSemilla && (
                      <View style={styles.integratedDropdown}>
                        {ESTADOS_SEMILLA.map((estado) => (
                          <TouchableOpacity
                            key={estado.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.estado_semilla === estado.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, estado_semilla: estado.value }));
                              setShowEstadoSemilla(false);
                            }}
                          >
                            <Text style={[
                              styles.integratedDropdownOptionText,
                              form.estado_semilla === estado.value && styles.integratedDropdownOptionTextSelected
                            ]}>
                              {estado.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Sección de Cantidades */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="calculator-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Cantidades</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Cantidad de Semilla', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="leaf-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowCantidadSemilla(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.cantidad_semilla && styles.placeholderText
                          ]}>
                            {form.cantidad_semilla ?
                              CANTIDADES_SEMILLA.find(opt => opt.value === form.cantidad_semilla)?.label || form.cantidad_semilla
                              : 'Seleccionar cantidad'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ), true)}

                    {showCantidadSemilla && (
                      <View style={styles.integratedDropdown}>
                        {CANTIDADES_SEMILLA.map((cantidad) => (
                          <TouchableOpacity
                            key={cantidad.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.cantidad_semilla === cantidad.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, cantidad_semilla: cantidad.value }));
                              setShowCantidadSemilla(false);
                            }}
                          >
                            <Text style={[
                              styles.integratedDropdownOptionText,
                              form.cantidad_semilla === cantidad.value && styles.integratedDropdownOptionTextSelected
                            ]}>
                              {cantidad.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputColumn}>
                    {renderFormField('Cantidad Solicitada', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="arrow-up-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TextInput
                          style={styles.modernInput}
                          value={form.cantidad_solicitada}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, cantidad_solicitada: validateNumericInput(v) }))}
                          placeholder="Cantidad solicitada"
                          keyboardType="numeric"
                        />
                      </View>
                    ), true)}
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Número de Cápsulas', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="ellipsis-horizontal-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TextInput
                          style={styles.modernInput}
                          value={form.no_capsulas}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, no_capsulas: validateNumericInput(v) }))}
                          placeholder="Número de cápsulas"
                          keyboardType="numeric"
                        />
                      </View>
                    ), true)}
                  </View>
                </View>
              </View>

              {/* Sección de Ubicación */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="location-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Ubicación</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Percha', (
                      <AutocompleteInput
                        label=""
                        value={form.percha}
                        onChangeText={(text) => setForm((prev: any) => ({ ...prev, percha: text }))}
                        suggestions={perchasDisponibles}
                        onSelectSuggestion={(percha) => setForm((prev: any) => ({ ...prev, percha }))}
                        placeholder="Ingrese o seleccione percha"
                      />
                    ), true)}
                  </View>

                  <View style={styles.inputColumn}>
                    {renderFormField('Nivel', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="layers-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowNivel(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.nivel && styles.placeholderText
                          ]}>
                            {form.nivel || 'Seleccionar nivel'}
                          </Text>
                          <Ionicons name="chevron-down" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ), true)}

                    {showNivel && (
                      <View style={styles.integratedDropdown}>
                        {nivelesDisponibles.length > 0 ? (
                          nivelesDisponibles.map((nivel) => (
                            <TouchableOpacity
                              key={nivel}
                              style={[
                                styles.integratedDropdownOption,
                                form.nivel === nivel && styles.integratedDropdownOptionSelected
                              ]}
                              onPress={() => {
                                setForm((f: any) => ({ ...f, nivel: nivel }));
                                setShowNivel(false);
                              }}
                            >
                              <Text style={[
                                styles.integratedDropdownOptionText,
                                form.nivel === nivel && styles.integratedDropdownOptionTextSelected
                              ]}>
                                {nivel}
                              </Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.integratedDropdownOption}>
                            <Text style={styles.integratedDropdownOptionText}>
                              No hay niveles disponibles
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Sección de Observaciones */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="document-text-outline" size={20} color="#e9ad14" />
                  </View>
                  <Text style={styles.sectionTitle}>Observaciones y Responsable</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Observaciones', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="document-text-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.modernInput, styles.textAreaInput]}
                          value={form.observaciones}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, observaciones: v }))}
                          placeholder="Observaciones adicionales"
                          multiline={true}
                          numberOfLines={3}
                        />
                      </View>
                    ), false)}
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Responsable', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#e9ad14" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.modernInput, styles.autoFilledInput]}
                          value={form.responsable}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, responsable: v }))}
                          placeholder="Responsable"
                          editable={true}
                        />
                        <View style={styles.autoFillIndicator}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                        </View>
                      </View>
                    ), true)}
                  </View>
                </View>
              </View>

              {/* Sección de Predicción Automática */}
              <PredictionDisplay
                prediccionData={prediccionData}
                loadingPrediccion={loadingPrediccion}
                fechaInicio={form.fecha_siembra}
                tipo="germinacion"
              />

              {/* Botones de acción */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={onSubmit}
                  disabled={saving}
                >
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
    </ScrollView>
  );

  // Si usa su propio modal, envolver el contenido
  if (useOwnModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        presentationStyle="overFullScreen"
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            {formContent}
          </View>
        </View>
      </Modal>
    );
  }

  // Si no usa su propio modal, solo retornar el contenido
  return formContent;
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  popupContainer: {
    backgroundColor: '#fff',
    width: '85%',
    maxWidth: 600,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  popupScrollView: {
    maxHeight: '100%',
  },
  popupContent: {
    paddingBottom: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#182d49',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(233, 173, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182d49',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputColumn: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 8,
  },
  autoFilledInput: {
    backgroundColor: '#f0f9ff',
  },
  autoFillIndicator: {
    marginLeft: 8,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerText: {
    fontSize: 14,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  integratedDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  integratedDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  integratedDropdownOptionSelected: {
    backgroundColor: '#f0f9ff',
  },
  integratedDropdownOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  integratedDropdownOptionTextSelected: {
    color: '#182d49',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#182d49',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldLabelRequired: {
    color: '#182d49',
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  // Estilos de validación de código en tiempo real
  validationFeedback: {
    marginTop: 8,
    marginBottom: 4,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationTextValidating: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  validationTextSuccess: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  validationTextError: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  validationTextInfo: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Estilos para panel lateral
  sidePanelScrollView: {
    flex: 1,
  },
  sidePanelContent: {
    padding: 32,
  },
});

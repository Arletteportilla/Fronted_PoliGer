import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { SimpleCalendarPicker } from '@/components/common';
import { PrediccionMLPolinizacion } from '@/components/polinizaciones/PrediccionMLPolinizacion';
import { TIPOS_POLINIZACION, CLIMAS, CANTIDAD_SEMILLA } from '@/utils/polinizacionConstants';
import { polinizacionService } from '@/services/polinizacion.service';
import { polinizacionPrediccionService } from '@/services/polinizacion-prediccion.service';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';

interface PolinizacionFormProps {
  visible: boolean;
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSave: () => void;
  onPrediccion: () => void;
  saving: boolean;
  isPredicting: boolean;
  prediccion: any;
}

export const PolinizacionForm: React.FC<PolinizacionFormProps> = ({
  visible,
  onClose,
  form,
  setForm,
  onSave,
  onPrediccion,
  saving,
  isPredicting,
  prediccion
}) => {
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  
  const [showTipoPicker, setShowTipoPicker] = useState(false);
  const [showCantidadSemillaPicker, setShowCantidadSemillaPicker] = useState(false);
  const [buscandoPlanta, setBuscandoPlanta] = useState<string | null>(null);

  // Estados para predicción automática
  const [prediccionData, setPrediccionData] = useState<any>(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const prediccionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados para autocompletado de códigos
  const [codigosDisponibles, setCodigosDisponibles] = useState<Array<{codigo: string, genero: string, especie: string, clima: string}>>([]);
  const [showCodigosMadre, setShowCodigosMadre] = useState(false);
  const [showCodigosPadre, setShowCodigosPadre] = useState(false);
  const [showCodigosNueva, setShowCodigosNueva] = useState(false);
  const [codigosFiltrados, setCodigosFiltrados] = useState<Array<{codigo: string, genero: string, especie: string, clima: string}>>([]);

  // Estados para autocompletado de ubicaciones
  const [opcionesViveros, setOpcionesViveros] = useState<string[]>([]);
  const [opcionesMesas, setOpcionesMesas] = useState<string[]>([]);
  const [opcionesParedes, setOpcionesParedes] = useState<string[]>([]);
  const [showViveros, setShowViveros] = useState(false);
  const [showMesas, setShowMesas] = useState(false);
  const [showParedes, setShowParedes] = useState(false);
  const [viverosFiltrados, setViverosFiltrados] = useState<string[]>([]);
  const [mesasFiltradas, setMesasFiltradas] = useState<string[]>([]);
  const [paredesFiltradas, setParedesFiltradas] = useState<string[]>([]);

  // Estado para tipo de ubicación secundaria (mesa o pared)
  const [tipoUbicacionSecundaria, setTipoUbicacionSecundaria] = useState<'mesa' | 'pared' | ''>('');

  // Sincronizar el estado inicial y cuando cambia el form
  useEffect(() => {
    if (form.mesa && form.mesa.trim() !== '') {
      setTipoUbicacionSecundaria('mesa');
    } else if (form.pared && form.pared.trim() !== '') {
      setTipoUbicacionSecundaria('pared');
    } else {
      // Solo resetear si ambos están vacíos
      if (!form.mesa && !form.pared) {
        setTipoUbicacionSecundaria('');
      }
    }
  }, [form.mesa, form.pared]);

  // Estado para validación de cantidades
  const [cantidadError, setCantidadError] = useState<string>('');

  // Función para validar cantidades
  const validarCantidades = (solicitada: string, disponible: string) => {
    const numSolicitada = parseFloat(solicitada) || 0;
    const numDisponible = parseFloat(disponible) || 0;

    if (numDisponible > numSolicitada && numSolicitada > 0) {
      setCantidadError('La cantidad disponible no puede ser mayor que la cantidad solicitada');
      return false;
    } else {
      setCantidadError('');
      return true;
    }
  };

  // Manejadores para cambios en cantidades con validación
  const handleCantidadSolicitadaChange = (value: string) => {
    setForm((f: any) => ({ ...f, cantidad_solicitada: value }));
    validarCantidades(value, form.cantidad_disponible);
  };

  const handleCantidadDisponibleChange = (value: string) => {
    setForm((f: any) => ({ ...f, cantidad_disponible: value }));
    validarCantidades(form.cantidad_solicitada, value);
  };

  // Cargar códigos disponibles al montar el componente
  useEffect(() => {
    const cargarCodigos = async () => {
      try {
        const codigos = await polinizacionService.getCodigosConEspecies();
        // Asegurarse de que siempre sea un array
        if (Array.isArray(codigos)) {
          setCodigosDisponibles(codigos);
        } else {
          console.warn('getCodigosConEspecies no retornó un array:', codigos);
          setCodigosDisponibles([]);
        }
      } catch (error) {
        console.error('Error cargando códigos:', error);
        setCodigosDisponibles([]);
      }
    };
    cargarCodigos();
  }, []);

  // Cargar opciones de ubicación al montar el componente
  useEffect(() => {
    const cargarOpcionesUbicacion = async () => {
      try {
        const response = await polinizacionService.getOpcionesUbicacion();
        setOpcionesViveros(response.viveros.opciones || []);
        setOpcionesMesas(response.mesas.opciones || []);
        setOpcionesParedes(response.paredes.opciones || []);
      } catch (error) {
        console.error('Error cargando opciones de ubicación:', error);
      }
    };
    cargarOpcionesUbicacion();
  }, []);

  // Función para filtrar códigos según lo que el usuario escribe
  const filtrarCodigos = (texto: string) => {
    if (!texto || texto.trim() === '') {
      return [];
    }
    // Asegurarse de que codigosDisponibles es un array
    if (!Array.isArray(codigosDisponibles)) {
      console.warn('codigosDisponibles no es un array:', codigosDisponibles);
      return [];
    }
    return codigosDisponibles
      .filter(c => c.codigo.toLowerCase().includes(texto.toLowerCase()))
      .slice(0, 10); // Limitar a 10 resultados
  };

  // Funciones para filtrar ubicaciones
  const filtrarViveros = (texto: string) => {
    if (!texto || texto.trim() === '') {
      return opcionesViveros;  // Mostrar todos si está vacío
    }
    return opcionesViveros.filter(v =>
      v.toLowerCase().includes(texto.toLowerCase())
    );
  };

  const filtrarMesas = (texto: string) => {
    let mesas = opcionesMesas;

    if (!texto || texto.trim() === '') {
      return mesas;
    }
    return mesas.filter(m =>
      m.toLowerCase().includes(texto.toLowerCase())
    );
  };

  const filtrarParedes = (texto: string) => {
    if (!texto || texto.trim() === '') {
      return opcionesParedes;
    }
    return opcionesParedes.filter(p =>
      p.toLowerCase().includes(texto.toLowerCase())
    );
  };

  // Manejadores para cambiar código y mostrar sugerencias
  const handleCodigoMadreChange = (texto: string) => {
    setForm((f: any) => ({ ...f, madre_codigo: texto }));
    const filtrados = filtrarCodigos(texto);
    setCodigosFiltrados(filtrados);
    setShowCodigosMadre(filtrados.length > 0);
  };

  const handleCodigoPadreChange = (texto: string) => {
    setForm((f: any) => ({ ...f, padre_codigo: texto }));
    const filtrados = filtrarCodigos(texto);
    setCodigosFiltrados(filtrados);
    setShowCodigosPadre(filtrados.length > 0);
  };

  const handleCodigoNuevaChange = (texto: string) => {
    setForm((f: any) => ({ ...f, nueva_codigo: texto }));
    const filtrados = filtrarCodigos(texto);
    setCodigosFiltrados(filtrados);
    setShowCodigosNueva(filtrados.length > 0);
  };

  // Función para seleccionar un código del dropdown
  const seleccionarCodigo = (codigo: {codigo: string, genero: string, especie: string, clima: string}, tipo: 'madre' | 'padre' | 'nueva') => {
    if (tipo === 'madre') {
      setForm((f: any) => ({
        ...f,
        madre_codigo: codigo.codigo,
        madre_genero: codigo.genero,
        madre_especie: codigo.especie,
        madre_clima: codigo.clima
      }));
      setShowCodigosMadre(false);
    } else if (tipo === 'padre') {
      setForm((f: any) => ({
        ...f,
        padre_codigo: codigo.codigo,
        padre_genero: codigo.genero,
        padre_especie: codigo.especie,
        padre_clima: codigo.clima
      }));
      setShowCodigosPadre(false);
    } else if (tipo === 'nueva') {
      setForm((f: any) => ({
        ...f,
        nueva_codigo: codigo.codigo,
        nueva_genero: codigo.genero,
        nueva_especie: codigo.especie,
        nueva_clima: codigo.clima
      }));
      setShowCodigosNueva(false);
    }
  };

  // Función para buscar información de una planta por código
  const buscarInfoPlanta = async (codigo: string, tipo: 'madre' | 'padre' | 'nueva') => {
    if (!codigo || codigo.trim() === '') return;

    setBuscandoPlanta(tipo);
    try {
      const info = await polinizacionService.buscarPlantaInfo(codigo.trim());

      if (info) {
        console.log(`✅ Información encontrada para ${tipo}:`, info);

        if (tipo === 'madre') {
          setForm((f: any) => ({
            ...f,
            madre_genero: info.genero || f.madre_genero,
            madre_especie: info.especie || f.madre_especie,
            madre_clima: info.clima || f.madre_clima
          }));
        } else if (tipo === 'padre') {
          setForm((f: any) => ({
            ...f,
            padre_genero: info.genero || f.padre_genero,
            padre_especie: info.especie || f.padre_especie,
            padre_clima: info.clima || f.padre_clima
          }));
        } else if (tipo === 'nueva') {
          setForm((f: any) => ({
            ...f,
            nueva_genero: info.genero || f.nueva_genero,
            nueva_especie: info.especie || f.nueva_especie,
            nueva_clima: info.clima || f.nueva_clima
          }));
        }
      } else {
        console.log(`⚠️ No se encontró información para código: ${codigo}`);
      }
    } catch (error) {
      console.error(`❌ Error buscando información de planta ${tipo}:`, error);
    } finally {
      setBuscandoPlanta(null);
    }
  };

  // Manejadores de cambio para ubicaciones
  const handleViveroChange = (texto: string) => {
    setForm((f: any) => ({ ...f, vivero: texto }));
    const filtrados = filtrarViveros(texto);
    setViverosFiltrados(filtrados);
    setShowViveros(filtrados.length > 0);
  };

  const handleTipoUbicacionSecundariaChange = (tipo: 'mesa' | 'pared' | '') => {
    setTipoUbicacionSecundaria(tipo);
    if (tipo === 'mesa') {
      // Limpiar pared cuando se selecciona mesa
      setForm((f: any) => ({ ...f, pared: '', mesa: f.mesa || '' }));
    } else if (tipo === 'pared') {
      // Limpiar mesa cuando se selecciona pared
      setForm((f: any) => ({ ...f, mesa: '', pared: f.pared || '' }));
    } else {
      // Limpiar ambos cuando no hay selección
      setForm((f: any) => ({ ...f, mesa: '', pared: '' }));
    }
  };

  const handleMesaChange = (texto: string) => {
    setForm((f: any) => ({ ...f, mesa: texto, pared: '' })); // Limpiar pared al cambiar mesa
    setTipoUbicacionSecundaria('mesa');
    const filtrados = filtrarMesas(texto);
    setMesasFiltradas(filtrados);
    setShowMesas(filtrados.length > 0);
  };

  const handleParedChange = (texto: string) => {
    setForm((f: any) => ({ ...f, pared: texto, mesa: '' })); // Limpiar mesa al cambiar pared
    setTipoUbicacionSecundaria('pared');
    const filtrados = filtrarParedes(texto);
    setParedesFiltradas(filtrados);
    setShowParedes(filtrados.length > 0);
  };

  // Autocompletar campos de "Nueva Planta" según tipo de polinización
  useEffect(() => {
    if (!form.tipo_polinizacion) return;

    if (form.tipo_polinizacion === 'SELF') {
      // SELF: Autocomplete con datos de la madre
      setForm((f: any) => ({
        ...f,
        nueva_codigo: f.madre_codigo || '',
        nueva_genero: f.madre_genero || '',
        nueva_especie: f.madre_especie || '',
        nueva_clima: f.madre_clima || ''
      }));
    } else if (form.tipo_polinizacion === 'SIBLING') {
      // SIBLING: Combinar madre y padre
      const genero = form.madre_genero || form.padre_genero || '';
      const codigo = form.madre_codigo && form.padre_codigo
        ? `${form.madre_codigo} x ${form.padre_codigo}`
        : form.madre_codigo || form.padre_codigo || '';
      const especie = form.madre_especie && form.padre_especie
        ? `${form.madre_especie} x ${form.padre_especie}`
        : form.madre_especie || form.padre_especie || '';
      const clima = form.madre_clima || form.padre_clima || '';

      setForm((f: any) => ({
        ...f,
        nueva_codigo: codigo,
        nueva_genero: genero,
        nueva_especie: especie,
        nueva_clima: clima
      }));
    }
    // Para HIBRIDA no hacemos nada, se deja editable
  }, [
    form.tipo_polinizacion,
    form.madre_codigo,
    form.madre_genero,
    form.madre_especie,
    form.madre_clima,
    form.padre_codigo,
    form.padre_genero,
    form.padre_especie,
    form.padre_clima
  ]);

  // Calcular predicción automáticamente cuando los campos necesarios estén completos
  useEffect(() => {
    // Limpiar timeout anterior
    if (prediccionTimeoutRef.current) {
      clearTimeout(prediccionTimeoutRef.current);
    }

    // Verificar si todos los campos necesarios están completos
    const camposCompletos =
      form.madre_especie && form.madre_especie.trim() !== '' &&
      form.fecha_polinizacion && form.fecha_polinizacion.trim() !== '' &&
      form.madre_clima && form.madre_clima.trim() !== '';

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
          especie: form.madre_especie,
          clima: form.madre_clima,
          ubicacion: form.vivero || form.mesa || undefined,
          fecha_polinizacion: form.fecha_polinizacion,
        };

        console.log('🌸 PolinizacionForm - Calculando predicción automática con:', formDataPrediccion);

        const resultado = await polinizacionPrediccionService.generarPrediccionInicial(formDataPrediccion);

        // Adaptar formato de respuesta para el componente PredictionDisplay
        const resultadoAdaptado = {
          prediccion: {
            fecha_estimada: resultado.fecha_estimada_semillas,
            dias_estimados: resultado.dias_estimados,
            confianza: resultado.confianza,
            metodo: resultado.especie_info?.metodo === 'prediccion heuristica' ? 'Heurístico' : 'ML',
          }
        };

        setPrediccionData(resultadoAdaptado);
        console.log('✅ Predicción calculada:', resultadoAdaptado);
      } catch (error: any) {
        console.error('❌ Error calculando predicción automática:', error);
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
  }, [form.madre_especie, form.madre_clima, form.fecha_polinizacion, form.vivero, form.mesa]);

  const renderFormField = (label: string, component: React.ReactNode, required: boolean = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, required && styles.fieldLabelRequired]}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      {component}
    </View>
  );

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
          <ScrollView 
            style={styles.popupScrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.popupContent}
          >
            {/* Header del formulario */}
            <View style={styles.popupHeader}>
              <View style={styles.closeButton}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButtonInner}
                >
                  <Ionicons name="close" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.popupTitle}>Nueva Polinización</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Contenido del formulario */}
            <View style={styles.formContainer}>
              {/* Sección de Fechas */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="calendar-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Fechas</Text>
                </View>
                
                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <SimpleCalendarPicker
                      label="Fecha de Polinización"
                      value={form.fecha_polinizacion}
                      onDateChange={(date: string) => setForm((f: any) => ({ ...f, fecha_polinizacion: date }))}
                      placeholder="Seleccionar fecha"
                      required={true}
                    />
                  </View>
                </View>
              </View>

              {/* Sección de Tipo de Polinización */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="flower-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Tipo de Polinización</Text>
                </View>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Tipo de Polinización', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="list-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowTipoPicker(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.tipo_polinizacion && styles.placeholderText
                          ]}>
                            {form.tipo_polinizacion ? 
                              TIPOS_POLINIZACION.find(opt => opt.value === form.tipo_polinizacion)?.label || form.tipo_polinizacion
                              : 'Seleccionar tipo de polinización'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color={themeColors.text.tertiary} />
                        </TouchableOpacity>
                      </View>
                    ), true)}
                    
                    {/* Dropdown integrado dentro del campo */}
                    {showTipoPicker && (
                      <View style={styles.integratedDropdown}>
                        {TIPOS_POLINIZACION.map((tipo) => (
                          <TouchableOpacity
                            key={tipo.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.tipo_polinizacion === tipo.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, tipo_polinizacion: tipo.value }));
                              setShowTipoPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.integratedDropdownOptionText,
                              form.tipo_polinizacion === tipo.value && styles.integratedDropdownOptionTextSelected
                            ]}>
                              {tipo.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Sección de Plantas - Condicional según tipo de polinización */}
              {form.tipo_polinizacion && (
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                      <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} />
                    </View>
                    <Text style={styles.sectionTitle}>Información de Plantas</Text>
                  </View>

                  {/* Planta Madre - Mostrar siempre */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionSubtitle}>Planta Madre</Text>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                        {renderFormField('Código Madre', (
                          <View style={styles.autocompleteWrapper}>
                            <View style={styles.inputContainer}>
                              <Ionicons name="barcode-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={styles.modernInput}
                                value={form.madre_codigo}
                                onChangeText={handleCodigoMadreChange}
                                onBlur={() => {
                                  setTimeout(() => setShowCodigosMadre(false), 200);
                                  if (form.madre_codigo) {
                                    buscarInfoPlanta(form.madre_codigo, 'madre');
                                  }
                                }}
                                onFocus={() => {
                                  if (form.madre_codigo) {
                                    const filtrados = filtrarCodigos(form.madre_codigo);
                                    setCodigosFiltrados(filtrados);
                                    setShowCodigosMadre(filtrados.length > 0);
                                  }
                                }}
                                placeholder="Código de la planta madre"
                              />
                              {buscandoPlanta === 'madre' && (
                                <Ionicons name="hourglass-outline" size={16} color={themeColors.status.success} style={styles.loadingIcon} />
                              )}
                            </View>
                            {showCodigosMadre && codigosFiltrados.length > 0 && (
                              <View style={styles.autocompleteDropdown}>
                                {codigosFiltrados.map((item, index) => (
                                  <TouchableOpacity
                                    key={`${item.codigo}-${index}`}
                                    style={[
                                      styles.autocompleteOption,
                                      index === codigosFiltrados.length - 1 && styles.autocompleteOptionLast
                                    ]}
                                    onPress={() => {
                                      seleccionarCodigo(item, 'madre');
                                      setShowCodigosMadre(false);
                                    }}
                                  >
                                    <Text style={styles.autocompleteOptionCodigo}>{item.codigo}</Text>
                                    <Text style={styles.autocompleteOptionDetalle}>
                                      {item.genero} - {item.especie}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        ), false)}
                      </View>

                      <View style={styles.inputColumn}>
                        {renderFormField('Género Madre', (
                          <View style={styles.inputContainer}>
                            <Ionicons name="flask-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <TextInput
                              style={styles.modernInput}
                              value={form.madre_genero}
                              onChangeText={(v: string) => setForm((f: any) => ({ ...f, madre_genero: v }))}
                              placeholder="Género de la planta madre"
                            />
                          </View>
                        ), false)}
                      </View>
                    </View>

                    <View style={[styles.inputRow, showCodigosMadre && codigosFiltrados.length > 0 && styles.inputRowWithDropdown]}>
                      <View style={styles.inputColumn}>
                        {renderFormField('Especie Madre', (
                          <View style={styles.inputContainer}>
                            <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <TextInput
                              style={styles.modernInput}
                              value={form.madre_especie}
                              onChangeText={(v: string) => setForm((f: any) => ({ ...f, madre_especie: v }))}
                              placeholder="Especie de la planta madre"
                            />
                          </View>
                        ), false)}
                      </View>

                      <View style={styles.inputColumn}>
                        {renderFormField('Clima Madre', (
                          <View style={styles.pickerContainer}>
                            <Ionicons name="partly-sunny-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <Picker
                              selectedValue={form.madre_clima}
                              onValueChange={(v: string) => setForm((f: any) => ({ ...f, madre_clima: v }))}
                              style={styles.modernPicker}
                            >
                              <Picker.Item label="Seleccionar clima" value="" />
                              {CLIMAS.map(clima => (
                                <Picker.Item key={clima.value} label={clima.label} value={clima.value} />
                              ))}
                            </Picker>
                          </View>
                        ), false)}
                      </View>
                    </View>
                  </View>

                  {/* Planta Padre - Mostrar solo para SIBLING e HIBRIDA */}
                  {(form.tipo_polinizacion === 'SIBLING' || form.tipo_polinizacion === 'HIBRIDA') && (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionSubtitle}>Planta Padre</Text>

                      <View style={styles.inputRow}>
                        <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                          {renderFormField('Código Padre', (
                            <View style={styles.autocompleteWrapper}>
                              <View style={styles.inputContainer}>
                                <Ionicons name="barcode-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                                <TextInput
                                  style={styles.modernInput}
                                  value={form.padre_codigo}
                                  onChangeText={handleCodigoPadreChange}
                                  onBlur={() => {
                                    setTimeout(() => setShowCodigosPadre(false), 200);
                                    if (form.padre_codigo) {
                                      buscarInfoPlanta(form.padre_codigo, 'padre');
                                    }
                                  }}
                                  onFocus={() => {
                                    if (form.padre_codigo) {
                                      const filtrados = filtrarCodigos(form.padre_codigo);
                                      setCodigosFiltrados(filtrados);
                                      setShowCodigosPadre(filtrados.length > 0);
                                    }
                                  }}
                                  placeholder="Código de la planta padre"
                                />
                                {buscandoPlanta === 'padre' && (
                                  <Ionicons name="hourglass-outline" size={16} color={themeColors.status.success} style={styles.loadingIcon} />
                                )}
                              </View>
                              {showCodigosPadre && codigosFiltrados.length > 0 && (
                                <View style={styles.autocompleteDropdown}>
                                  {codigosFiltrados.map((item, index) => (
                                    <TouchableOpacity
                                      key={`${item.codigo}-${index}`}
                                      style={[
                                        styles.autocompleteOption,
                                        index === codigosFiltrados.length - 1 && styles.autocompleteOptionLast
                                      ]}
                                      onPress={() => {
                                        seleccionarCodigo(item, 'padre');
                                        setShowCodigosPadre(false);
                                      }}
                                    >
                                      <Text style={styles.autocompleteOptionCodigo}>{item.codigo}</Text>
                                      <Text style={styles.autocompleteOptionDetalle}>
                                        {item.genero} - {item.especie}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          ), false)}
                        </View>

                        <View style={styles.inputColumn}>
                          {renderFormField('Género Padre', (
                            <View style={styles.inputContainer}>
                              <Ionicons name="flask-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={styles.modernInput}
                                value={form.padre_genero}
                                onChangeText={(v: string) => setForm((f: any) => ({ ...f, padre_genero: v }))}
                                placeholder="Género de la planta padre"
                              />
                            </View>
                          ), false)}
                        </View>
                      </View>

                      <View style={[styles.inputRow, showCodigosPadre && codigosFiltrados.length > 0 && styles.inputRowWithDropdown]}>
                        <View style={styles.inputColumn}>
                          {renderFormField('Especie Padre', (
                            <View style={styles.inputContainer}>
                              <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={styles.modernInput}
                                value={form.padre_especie}
                                onChangeText={(v: string) => setForm((f: any) => ({ ...f, padre_especie: v }))}
                                placeholder="Especie de la planta padre"
                              />
                            </View>
                          ), false)}
                        </View>

                        <View style={styles.inputColumn}>
                          {renderFormField('Clima Padre', (
                            <View style={styles.pickerContainer}>
                              <Ionicons name="partly-sunny-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <Picker
                                selectedValue={form.padre_clima}
                                onValueChange={(v: string) => setForm((f: any) => ({ ...f, padre_clima: v }))}
                                style={styles.modernPicker}
                              >
                                <Picker.Item label="Seleccionar clima" value="" />
                                {CLIMAS.map(clima => (
                                  <Picker.Item key={clima.value} label={clima.label} value={clima.value} />
                                ))}
                              </Picker>
                            </View>
                          ), false)}
                        </View>
                    </View>
                  </View>
                  )}

                  {/* Nueva Planta - Mostrar siempre */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionSubtitle}>
                      Nueva Planta {form.tipo_polinizacion === 'HIBRIDA' ? '(Híbrido)' : '(Autocompletado)'}
                    </Text>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                        {renderFormField('Código Nueva Planta', (
                          <View style={styles.autocompleteWrapper}>
                            <View style={styles.inputContainer}>
                              <Ionicons name="barcode-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={[
                                  styles.modernInput,
                                  (form.tipo_polinizacion === 'SELF' || form.tipo_polinizacion === 'SIBLING') && styles.inputDisabled
                                ]}
                                value={form.nueva_codigo}
                                onChangeText={form.tipo_polinizacion === 'HIBRIDA' ? handleCodigoNuevaChange : (v: string) => setForm((f: any) => ({ ...f, nueva_codigo: v }))}
                                onBlur={() => {
                                  setTimeout(() => setShowCodigosNueva(false), 200);
                                  if (form.tipo_polinizacion === 'HIBRIDA' && form.nueva_codigo) {
                                    buscarInfoPlanta(form.nueva_codigo, 'nueva');
                                  }
                                }}
                                onFocus={() => {
                                  if (form.tipo_polinizacion === 'HIBRIDA' && form.nueva_codigo) {
                                    const filtrados = filtrarCodigos(form.nueva_codigo);
                                    setCodigosFiltrados(filtrados);
                                    setShowCodigosNueva(filtrados.length > 0);
                                  }
                                }}
                                placeholder="Código de la nueva planta"
                                editable={form.tipo_polinizacion === 'HIBRIDA'}
                              />
                              {buscandoPlanta === 'nueva' && (
                                <Ionicons name="hourglass-outline" size={16} color={themeColors.status.success} style={styles.loadingIcon} />
                              )}
                            </View>
                            {form.tipo_polinizacion === 'HIBRIDA' && showCodigosNueva && codigosFiltrados.length > 0 && (
                              <View style={styles.autocompleteDropdown}>
                                {codigosFiltrados.map((item, index) => (
                                  <TouchableOpacity
                                    key={`${item.codigo}-${index}`}
                                    style={[
                                      styles.autocompleteOption,
                                      index === codigosFiltrados.length - 1 && styles.autocompleteOptionLast
                                    ]}
                                    onPress={() => {
                                      seleccionarCodigo(item, 'nueva');
                                      setShowCodigosNueva(false);
                                    }}
                                  >
                                    <Text style={styles.autocompleteOptionCodigo}>{item.codigo}</Text>
                                    <Text style={styles.autocompleteOptionDetalle}>
                                      {item.genero} - {item.especie}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        ), false)}
                      </View>

                      <View style={styles.inputColumn}>
                        {renderFormField('Género Nueva Planta', (
                          <View style={styles.inputContainer}>
                            <Ionicons name="flask-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <TextInput
                              style={[
                                styles.modernInput,
                                (form.tipo_polinizacion === 'SELF' || form.tipo_polinizacion === 'SIBLING') && styles.inputDisabled
                              ]}
                              value={form.nueva_genero}
                              onChangeText={(v: string) => setForm((f: any) => ({ ...f, nueva_genero: v }))}
                              placeholder="Género de la nueva planta"
                              editable={form.tipo_polinizacion === 'HIBRIDA'}
                            />
                          </View>
                        ), false)}
                      </View>
                    </View>

                    <View style={[styles.inputRow, form.tipo_polinizacion === 'HIBRIDA' && showCodigosNueva && codigosFiltrados.length > 0 && styles.inputRowWithDropdown]}>
                      <View style={styles.inputColumn}>
                        {renderFormField('Especie Nueva Planta', (
                          <View style={styles.inputContainer}>
                            <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <TextInput
                              style={[
                                styles.modernInput,
                                (form.tipo_polinizacion === 'SELF' || form.tipo_polinizacion === 'SIBLING') && styles.inputDisabled
                              ]}
                              value={form.nueva_especie}
                              onChangeText={(v: string) => setForm((f: any) => ({ ...f, nueva_especie: v }))}
                              placeholder="Especie de la nueva planta"
                              editable={form.tipo_polinizacion === 'HIBRIDA'}
                            />
                          </View>
                        ), false)}
                      </View>

                      <View style={styles.inputColumn}>
                        {renderFormField('Clima Nueva Planta', (
                          <View style={styles.pickerContainer}>
                            <Ionicons name="partly-sunny-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <Picker
                              selectedValue={form.nueva_clima}
                              onValueChange={(v: string) => setForm((f: any) => ({ ...f, nueva_clima: v }))}
                              style={[
                                styles.modernPicker,
                                (form.tipo_polinizacion === 'SELF' || form.tipo_polinizacion === 'SIBLING') && styles.inputDisabled
                              ]}
                              enabled={form.tipo_polinizacion === 'HIBRIDA'}
                            >
                              <Picker.Item label="Seleccionar clima" value="" />
                              {CLIMAS.map(clima => (
                                <Picker.Item key={clima.value} label={clima.label} value={clima.value} />
                              ))}
                            </Picker>
                          </View>
                        ), false)}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Sección de Ubicación y Clima */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="location-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Ubicación y Clima</Text>
                </View>
                
                {/* Ubicación Específica - Container con overflow visible */}
                <View style={[styles.sectionContainer, { overflow: 'visible', zIndex: 9000 }]}>
                  <Text style={styles.sectionSubtitle}>Ubicación Específica</Text>

                  {/* Selector de tipo Mesa/Pared */}
                  <View style={styles.inputRow}>
                    <View style={styles.inputColumn}>
                      {renderFormField('Tipo de Ubicación Secundaria', (
                        <View style={styles.tipoUbicacionSelector}>
                          <TouchableOpacity
                            style={[
                              styles.tipoUbicacionButton,
                              tipoUbicacionSecundaria === 'mesa' && styles.tipoUbicacionButtonActive
                            ]}
                            onPress={() => handleTipoUbicacionSecundariaChange('mesa')}
                          >
                            <Ionicons 
                              name="grid-outline" 
                              size={18} 
                              color={tipoUbicacionSecundaria === 'mesa' ? themeColors.text.inverse : themeColors.text.tertiary} 
                            />
                            <Text style={[
                              styles.tipoUbicacionButtonText,
                              tipoUbicacionSecundaria === 'mesa' && styles.tipoUbicacionButtonTextActive
                            ]}>
                              Mesa
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.tipoUbicacionButton,
                              tipoUbicacionSecundaria === 'pared' && styles.tipoUbicacionButtonActive
                            ]}
                            onPress={() => handleTipoUbicacionSecundariaChange('pared')}
                          >
                            <Ionicons 
                              name="square-outline" 
                              size={18} 
                              color={tipoUbicacionSecundaria === 'pared' ? themeColors.text.inverse : themeColors.text.tertiary} 
                            />
                            <Text style={[
                              styles.tipoUbicacionButtonText,
                              tipoUbicacionSecundaria === 'pared' && styles.tipoUbicacionButtonTextActive
                            ]}>
                              Pared
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ), false)}
                    </View>
                  </View>

                  {/* VIVERO CON AUTOCOMPLETADO - Fila separada */}
                  <View style={[styles.inputRow, { zIndex: 9999, elevation: 9999 }, showViveros && viverosFiltrados.length > 0 && { marginBottom: 220 }]}>
                    <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                      {renderFormField('Vivero', (
                        <View style={styles.autocompleteWrapper}>
                          <View style={styles.inputContainer}>
                            <Ionicons name="home-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                            <TextInput
                              style={styles.modernInput}
                              value={form.vivero}
                              onChangeText={handleViveroChange}
                              onFocus={() => {
                                const filtrados = filtrarViveros(form.vivero || '');
                                setViverosFiltrados(filtrados);
                                setShowViveros(true);
                              }}
                              onBlur={() => setTimeout(() => setShowViveros(false), 300)}
                              placeholder="Ej: V-1, V-13"
                            />
                          </View>
                          {showViveros && viverosFiltrados.length > 0 && (
                            <View
                              style={styles.autocompleteDropdown}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {viverosFiltrados.slice(0, 10).map((vivero, index) => (
                                <TouchableOpacity
                                  key={`vivero-${index}`}
                                  style={[
                                    styles.autocompleteOption,
                                    index === Math.min(9, viverosFiltrados.length - 1) && styles.autocompleteOptionLast
                                  ]}
                                  onPress={() => {
                                    setForm((f: any) => ({ ...f, vivero: vivero }));
                                    setShowViveros(false);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.autocompleteOptionCodigo}>{vivero}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      ), false)}
                    </View>
                  </View>

                  {/* MESA CON AUTOCOMPLETADO - Fila separada */}
                  {tipoUbicacionSecundaria === 'mesa' && (
                    <View style={[styles.inputRow, { zIndex: 8888, elevation: 8888 }, showMesas && mesasFiltradas.length > 0 && { marginBottom: 220 }]}>
                      <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                        {renderFormField('Mesa', (
                          <View style={styles.autocompleteWrapper}>
                            <View style={styles.inputContainer}>
                              <Ionicons name="grid-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={styles.modernInput}
                                value={form.mesa}
                                onChangeText={handleMesaChange}
                                onFocus={() => {
                                  const filtrados = filtrarMesas(form.mesa || '');
                                  setMesasFiltradas(filtrados);
                                  setShowMesas(true);
                                }}
                                onBlur={() => setTimeout(() => setShowMesas(false), 300)}
                                placeholder="Ej: M-1A, M-2B"
                              />
                            </View>
                          {showMesas && mesasFiltradas.length > 0 && (
                            <View
                              style={styles.autocompleteDropdown}
                              onStartShouldSetResponder={() => true}
                              onMoveShouldSetResponder={() => true}
                            >
                              {mesasFiltradas.slice(0, 10).map((mesa, index) => (
                                <TouchableOpacity
                                  key={`mesa-${index}`}
                                  style={[
                                    styles.autocompleteOption,
                                    index === Math.min(9, mesasFiltradas.length - 1) && styles.autocompleteOptionLast
                                  ]}
                                  onPress={() => {
                                    setForm((f: any) => ({ ...f, mesa: mesa }));
                                    setShowMesas(false);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.autocompleteOptionCodigo}>{mesa}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      ), false)}
                    </View>
                  </View>
                  )}

                  {/* PARED CON AUTOCOMPLETADO - Fila separada */}
                  {tipoUbicacionSecundaria === 'pared' && (
                    <View style={[styles.inputRow, { zIndex: 7777, elevation: 7777 }, showParedes && paredesFiltradas.length > 0 && { marginBottom: 220 }]}>
                      <View style={[styles.inputColumn, styles.inputColumnWithAutocomplete]}>
                        {renderFormField('Pared', (
                          <View style={styles.autocompleteWrapper}>
                            <View style={styles.inputContainer}>
                              <Ionicons name="square-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                              <TextInput
                                style={styles.modernInput}
                                value={form.pared}
                                onChangeText={handleParedChange}
                                onFocus={() => {
                                  const filtrados = filtrarParedes(form.pared || '');
                                  setParedesFiltradas(filtrados);
                                  setShowParedes(true);
                                }}
                                onBlur={() => setTimeout(() => setShowParedes(false), 300)}
                                placeholder="Ej: P-A, P-100"
                              />
                            </View>
                            {showParedes && paredesFiltradas.length > 0 && (
                              <View
                                style={styles.autocompleteDropdown}
                                onStartShouldSetResponder={() => true}
                                onMoveShouldSetResponder={() => true}
                              >
                                {paredesFiltradas.slice(0, 10).map((pared, index) => (
                                  <TouchableOpacity
                                    key={`pared-${index}`}
                                    style={[
                                      styles.autocompleteOption,
                                      index === Math.min(9, paredesFiltradas.length - 1) && styles.autocompleteOptionLast
                                    ]}
                                    onPress={() => {
                                      setForm((f: any) => ({ ...f, pared: pared }));
                                      setShowParedes(false);
                                    }}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.autocompleteOptionCodigo}>{pared}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        ), false)}
                      </View>
                    </View>
                  )}
                </View>

                <View style={[styles.inputRow, { zIndex: 1 }]}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Responsable', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.modernInput, styles.autoFilledInput]}
                          value={form.responsable}
                          onChangeText={(v: string) => setForm((f: any) => ({ ...f, responsable: v }))}
                          placeholder="Responsable"
                          editable={true}
                        />
                        <View style={styles.autoFillIndicator}>
                            <Ionicons name="checkmark-circle" size={16} color={themeColors.status.success} />
                        </View>
                      </View>
                    ), false)}
                  </View>
                </View>
              </View>

              {/* Sección de Cantidades */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="calculator-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Cantidades</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Cantidad Solicitada', (
                      <View style={[styles.inputContainer, cantidadError && styles.inputContainerError]}>
                        <Ionicons name="arrow-up-outline" size={20} color={cantidadError ? themeColors.status.error : themeColors.status.success} style={styles.inputIcon} />
                        <TextInput
                          style={styles.modernInput}
                          value={form.cantidad_solicitada}
                          onChangeText={handleCantidadSolicitadaChange}
                          placeholder="Cantidad solicitada"
                          keyboardType="numeric"
                        />
                      </View>
                    ), false)}
                  </View>

                  <View style={styles.inputColumn}>
                    {renderFormField('Cantidad Disponible', (
                      <View style={[styles.inputContainer, cantidadError && styles.inputContainerError]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={cantidadError ? themeColors.status.error : themeColors.status.success} style={styles.inputIcon} />
                        <TextInput
                          style={styles.modernInput}
                          value={form.cantidad_disponible}
                          onChangeText={handleCantidadDisponibleChange}
                          placeholder="Cantidad disponible"
                          keyboardType="numeric"
                        />
                      </View>
                    ), false)}
                  </View>
                </View>

                {/* Mensaje de error */}
                {cantidadError && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={themeColors.status.error} />
                    <Text style={styles.errorText}>{cantidadError}</Text>
                  </View>
                )}
                
                {/* Nueva fila para Cantidad de Semilla */}
                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Cantidad de Semilla', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="leaf-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
                        <TouchableOpacity
                          style={styles.modernInput}
                          onPress={() => setShowCantidadSemillaPicker(true)}
                        >
                          <Text style={[
                            styles.pickerText,
                            !form.cantidad_semilla && styles.placeholderText
                          ]}>
                            {form.cantidad_semilla ? 
                              CANTIDAD_SEMILLA.find(opt => opt.value === form.cantidad_semilla)?.label || form.cantidad_semilla
                              : 'Seleccionar cantidad de semilla'
                            }
                          </Text>
                          <Ionicons name="chevron-down" size={16} color={themeColors.text.tertiary} />
                        </TouchableOpacity>
                      </View>
                    ), false)}
                    
                    {/* Dropdown integrado dentro del campo */}
                    {showCantidadSemillaPicker && (
                      <View style={styles.integratedDropdown}>
                        {CANTIDAD_SEMILLA.map((cantidad) => (
                          <TouchableOpacity
                            key={cantidad.value}
                            style={[
                              styles.integratedDropdownOption,
                              form.cantidad_semilla === cantidad.value && styles.integratedDropdownOptionSelected
                            ]}
                            onPress={() => {
                              setForm((f: any) => ({ ...f, cantidad_semilla: cantidad.value }));
                              setShowCantidadSemillaPicker(false);
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
                </View>
              </View>

              {/* Sección de Observaciones */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="document-text-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Observaciones</Text>
                </View>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputColumn}>
                    {renderFormField('Observaciones', (
                      <View style={styles.inputContainer}>
                        <Ionicons name="document-text-outline" size={20} color={themeColors.status.success} style={styles.inputIcon} />
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
              </View>

              {/* Sección de Predicción ML Automática */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name="analytics-outline" size={20} color={themeColors.status.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Predicción de Maduración</Text>
                </View>

                <PrediccionMLPolinizacion
                  formData={form}
                  onPrediccionComplete={(resultado) => {
                    // Aplicar la fecha estimada de maduración al formulario
                    setForm((f: any) => ({
                      ...f,
                      fecha_maduracion: resultado.fecha_estimada_maduracion
                    }));
                  }}
                />
              </View>

              {/* Botón de acción */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    (saving || cantidadError) && styles.saveButtonDisabled
                  ]}
                  onPress={onSave}
                  disabled={saving || !!cantidadError}
                >
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {saving ? 'Guardando...' : cantidadError ? 'Corrige los errores' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  popupContainer: {
    backgroundColor: colors.background.primary,
    width: '85%',
    maxWidth: 600,
    height: '100%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1,
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
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
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
    color: colors.text.primary,
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
    borderBottomColor: colors.border.default,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.status.success + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
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
  inputRowWithDropdown: {
    marginTop: 260,
  },
  inputColumn: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  inputColumnWithAutocomplete: {
    zIndex: 99999,
    elevation: 99999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  inputDisabled: {
    backgroundColor: colors.background.tertiary,
    color: colors.text.disabled,
  },
  autoFilledInput: {
    backgroundColor: colors.accent.secondary + '10',
  },
  autoFillIndicator: {
    marginLeft: 8,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 12,
  },
  modernPicker: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  pickerText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.disabled,
    fontSize: 14,
  },
  integratedDropdown: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
  },
  integratedDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  integratedDropdownOptionSelected: {
    backgroundColor: colors.accent.secondary + '10',
  },
  integratedDropdownOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  integratedDropdownOptionTextSelected: {
    color: colors.text.primary,
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
    backgroundColor: colors.accent.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.disabled,
    opacity: 0.6,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainerError: {
    borderColor: colors.status.error,
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.status.error,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  fieldContainerWithDropdown: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 99999,
    elevation: 99999,
  },
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 99999,
    elevation: 99999,
  },
  fieldContainerWithAutocomplete: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 99999,
    elevation: 99999,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  fieldLabelRequired: {
    color: colors.text.primary,
  },
  requiredAsterisk: {
    color: colors.status.error,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 200,
    paddingHorizontal: 20,
  },
  autocompleteDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: 4,
    maxHeight: 250,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 12,
    elevation: 99999,
    zIndex: 99999,
    overflow: 'hidden',
  },
  autocompleteModalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  autocompleteModalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '60%',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  autocompleteModalScrollView: {
    maxHeight: 300,
  },
  autocompleteOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
    minHeight: 50,
  },
  autocompleteOptionLast: {
    borderBottomWidth: 0,
  },
  autocompleteOptionCodigo: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  autocompleteOptionDetalle: {
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  tipoUbicacionSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoUbicacionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  tipoUbicacionButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  tipoUbicacionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tipoUbicacionButtonTextActive: {
    color: colors.text.inverse,
  },
});
/**
 * Utilidades de validación para germinaciones
 */

export interface GerminacionFormData {
  codigo: string;
  especie_variedad: string;
  fecha_siembra: string;
  fecha_polinizacion?: string;
  cantidad_solicitada: string | number;
  no_capsulas: string | number;
  responsable: string;
  clima?: string;
  percha?: string;
  nivel?: string;
  clima_lab?: string;
  observaciones?: string;
  estado_capsula?: string;
  estado_semilla?: string;
  cantidad_semilla?: string;
  semilla_en_stock?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class GerminacionValidator {
  /**
   * Valida todos los campos del formulario de germinación
   */
  static validateForm(data: Partial<GerminacionFormData>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar campos requeridos
    const requiredFields = [
      { field: 'codigo', message: 'El código es obligatorio' },
      { field: 'especie_variedad', message: 'La especie/variedad es obligatoria' },
      { field: 'fecha_siembra', message: 'La fecha de siembra es obligatoria' },
      { field: 'cantidad_solicitada', message: 'La cantidad solicitada es obligatoria' },
      { field: 'no_capsulas', message: 'El número de cápsulas es obligatorio' },
      { field: 'responsable', message: 'El responsable es obligatorio' }
    ];

    for (const { field, message } of requiredFields) {
      if (!data[field as keyof GerminacionFormData] || 
          (typeof data[field as keyof GerminacionFormData] === 'string' && 
           !data[field as keyof GerminacionFormData]?.toString().trim())) {
        errors.push({ field, message });
      }
    }

    // Validar formato de fechas
    if (data.fecha_siembra) {
      const fechaError = this.validateDate(data.fecha_siembra, 'fecha_siembra');
      if (fechaError) errors.push(fechaError);
    }

    if (data.fecha_polinizacion) {
      const fechaError = this.validateDate(data.fecha_polinizacion, 'fecha_polinizacion');
      if (fechaError) errors.push(fechaError);
    }

    // Validar coherencia de fechas
    if (data.fecha_siembra && data.fecha_polinizacion) {
      const fechaSiembra = new Date(data.fecha_siembra);
      const fechaPolinizacion = new Date(data.fecha_polinizacion);
      
      if (fechaPolinizacion > fechaSiembra) {
        errors.push({
          field: 'fecha_polinizacion',
          message: 'La fecha de polinización no puede ser posterior a la fecha de siembra'
        });
      }
    }

    // Validar números
    if (data.cantidad_solicitada) {
      const cantidadError = this.validatePositiveNumber(
        data.cantidad_solicitada, 
        'cantidad_solicitada',
        'La cantidad solicitada'
      );
      if (cantidadError) errors.push(cantidadError);
    }

    if (data.no_capsulas) {
      const capsulaError = this.validatePositiveNumber(
        data.no_capsulas,
        'no_capsulas', 
        'El número de cápsulas'
      );
      if (capsulaError) errors.push(capsulaError);
    }

    // Validar longitud de campos de texto
    if (data.codigo && data.codigo.length > 50) {
      errors.push({
        field: 'codigo',
        message: 'El código no puede tener más de 50 caracteres'
      });
    }

    if (data.especie_variedad && data.especie_variedad.length > 200) {
      errors.push({
        field: 'especie_variedad',
        message: 'La especie/variedad no puede tener más de 200 caracteres'
      });
    }

    return errors;
  }

  /**
   * Valida formato de fecha
   */
  private static validateDate(dateString: string, fieldName: string): ValidationError | null {
    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return {
        field: fieldName,
        message: 'El formato de fecha debe ser YYYY-MM-DD'
      };
    }

    // Validar que sea una fecha válida
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return {
        field: fieldName,
        message: 'La fecha no es válida'
      };
    }

    // Validar que no sea futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date > today) {
      return {
        field: fieldName,
        message: 'La fecha no puede ser futura'
      };
    }

    return null;
  }

  /**
   * Valida números positivos
   */
  private static validatePositiveNumber(
    value: string | number, 
    fieldName: string, 
    displayName: string
  ): ValidationError | null {
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    
    if (isNaN(numValue)) {
      return {
        field: fieldName,
        message: `${displayName} debe ser un número válido`
      };
    }

    if (numValue <= 0) {
      return {
        field: fieldName,
        message: `${displayName} debe ser mayor a 0`
      };
    }

    // Límites razonables
    if (fieldName === 'cantidad_solicitada' && numValue > 1000000) {
      return {
        field: fieldName,
        message: `${displayName} parece demasiado alta (máximo 1,000,000)`
      };
    }

    if (fieldName === 'no_capsulas' && numValue > 10000) {
      return {
        field: fieldName,
        message: `${displayName} parece demasiado alto (máximo 10,000)`
      };
    }

    return null;
  }

  /**
   * Prepara los datos para envío al backend
   */
  static prepareDataForSubmission(data: Partial<GerminacionFormData>): any {
    const prepared = { ...data };

    // Limpiar strings
    if (prepared.codigo) prepared.codigo = prepared.codigo.trim();
    if (prepared.especie_variedad) prepared.especie_variedad = prepared.especie_variedad.trim();
    if (prepared.responsable) prepared.responsable = prepared.responsable.trim();
    if (prepared.percha) prepared.percha = prepared.percha.trim();
    if (prepared.observaciones) prepared.observaciones = prepared.observaciones.trim();

    // Convertir números
    if (prepared.cantidad_solicitada) {
      prepared.cantidad_solicitada = parseInt(prepared.cantidad_solicitada.toString());
    }
    if (prepared.no_capsulas) {
      prepared.no_capsulas = parseInt(prepared.no_capsulas.toString());
    }

    // Remover campos vacíos opcionales
    Object.keys(prepared).forEach(key => {
      const typedKey = key as keyof typeof prepared;
      if (prepared[typedKey] === '' || prepared[typedKey] === null || prepared[typedKey] === undefined) {
        delete prepared[typedKey];
      }
    });

    return prepared;
  }

  /**
   * Formatea errores para mostrar al usuario
   */
  static formatErrorsForDisplay(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    
    if (errors.length === 1) {
      return errors[0]?.message || 'Error desconocido';
    }

    return `Se encontraron ${errors.length} errores:\n\n• ${errors.map(e => e.message).join('\n• ')}`;
  }

  /**
   * Valida un campo individual
   */
  static validateField(fieldName: string, value: any, allData?: Partial<GerminacionFormData>): ValidationError | null {
    const tempData = { ...allData, [fieldName]: value };
    const errors = this.validateForm(tempData);
    return errors.find(error => error.field === fieldName) || null;
  }
}
import api from './api';

export interface GerminacionOptions {
  niveles: {value: string, label: string}[];
  tipos_semilla: {value: string, label: string}[];
  estados_capsula: {value: string, label: string}[];
}

export const germinacionOptionsService = {
  /**
   * Obtiene las opciones disponibles para los campos de choices del modelo Germinacion
   */
  getOptions: async (): Promise<GerminacionOptions> => {
    try {
      console.log('🔍 germinacionOptionsService.getOptions() - Obteniendo opciones...');
      
      const response = await api.get('/germinaciones/opciones/');
      
      console.log('✅ germinacionOptionsService.getOptions() - Opciones obtenidas:', response.data);
      
      return {
        niveles: response.data.niveles || [],
        tipos_semilla: response.data.tipos_semilla || [],
        estados_capsula: response.data.estados_capsula || [],
      };
    } catch (error) {
      console.error('❌ germinacionOptionsService.getOptions() - Error:', error);
      
      // Fallback con opciones por defecto
      return {
        niveles: [
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
        ],
        tipos_semilla: [
          { value: 'MADURA', label: 'Madura' },
          { value: 'TIERNA', label: 'Tierna' },
          { value: 'VANA', label: 'Vana' },
        ],
        estados_capsula: [
          { value: 'VIABLE', label: 'Viable' },
          { value: 'NO_VIABLE', label: 'No viable' },
          { value: 'GERMINADA', label: 'Germinada' },
          { value: 'EXITOSA', label: 'Exitosa' },
          { value: 'CERRADA', label: 'Cerrada' },
          { value: 'ABIERTA', label: 'Abierta' },
          { value: 'SEMIABIERTA', label: 'Semiabierta' },
        ],
      };
    }
  },

  /**
   * Obtiene solo las opciones de niveles
   */
  getNiveles: async (): Promise<{value: string, label: string}[]> => {
    const options = await germinacionOptionsService.getOptions();
    return options.niveles;
  },

  /**
   * Obtiene solo las opciones de tipos de semilla
   */
  getTiposSemilla: async (): Promise<{value: string, label: string}[]> => {
    const options = await germinacionOptionsService.getOptions();
    return options.tipos_semilla;
  },

  /**
   * Obtiene solo las opciones de estados de cápsula
   */
  getEstadosCapsula: async (): Promise<{value: string, label: string}[]> => {
    const options = await germinacionOptionsService.getOptions();
    return options.estados_capsula;
  },
};

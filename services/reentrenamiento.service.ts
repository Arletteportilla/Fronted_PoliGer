import api from './api';

export type ModeloReentrenamiento = 'polinizacion' | 'germinacion' | 'ambos';

export interface ResultadoReentrenamiento {
  modelo: string;
  registros_usados: number;
  mae: number;
  rmse: number;
  r2: number;
  n_features: number;
  timestamp: string;
}

export interface RespuestaReentrenamiento {
  polinizacion?: ResultadoReentrenamiento;
  germinacion?: ResultadoReentrenamiento;
  // cuando modelo='polinizacion' o 'germinacion', viene directamente el resultado
  modelo?: string;
  registros_usados?: number;
  mae?: number;
  rmse?: number;
  r2?: number;
  n_features?: number;
  timestamp?: string;
}

export interface ConteosReentrenamiento {
  polinizacion: number;
  germinacion: number;
  minimo_requerido: number;
}

class ReentrenamientoService {
  async reentrenar(modelo: ModeloReentrenamiento): Promise<RespuestaReentrenamiento> {
    const response = await api.post('predicciones/reentrenar/', { modelo }, { timeout: 300000 }); // 5 min
    return response.data;
  }

  async getConteos(): Promise<ConteosReentrenamiento> {
    const response = await api.get('predicciones/conteos-reentrenamiento/');
    return response.data;
  }
}

export const reentrenamientoService = new ReentrenamientoService();

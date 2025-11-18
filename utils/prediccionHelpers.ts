// Prediction helpers - extracted from germinaciones.tsx
export const calcularDiasRestantes = (fechaEstimada: string): number | null => {
  if (!fechaEstimada) return null;
  
  const hoy = new Date();
  const fechaEst = new Date(fechaEstimada);
  const diferencia = Math.ceil((fechaEst.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  
  return diferencia;
};

export const getNivelConfianza = (confianza?: number): 'alta' | 'media' | 'baja' => {
  if (!confianza) return 'baja';
  if (confianza >= 80) return 'alta';
  if (confianza >= 60) return 'media';
  return 'baja';
};

export const getConfianzaColor = (nivel: 'alta' | 'media' | 'baja'): string => {
  switch (nivel) {
    case 'alta': return '#28a745';
    case 'media': return '#ffc107';
    case 'baja': return '#dc3545';
    default: return '#6c757d';
  }
};

export const getEstadoPrediccion = (diasRestantes: number | null) => {
  if (diasRestantes === null) {
    return {
      texto: 'Sin predicción',
      color: '#6c757d',
      icono: 'help-circle',
      urgencia: 'ninguna' as const
    };
  }

  if (diasRestantes < 0) {
    return {
      texto: `Vencido hace ${Math.abs(diasRestantes)} días`,
      color: '#dc3545',
      icono: 'alert-circle',
      urgencia: 'critica' as const
    };
  }

  if (diasRestantes === 0) {
    return {
      texto: 'Hoy es el día estimado',
      color: '#e9ad14',
      icono: 'calendar',
      urgencia: 'hoy' as const
    };
  }

  if (diasRestantes <= 3) {
    return {
      texto: `Faltan ${diasRestantes} días`,
      color: '#fd7e14',
      icono: 'time',
      urgencia: 'alta' as const
    };
  }

  if (diasRestantes <= 7) {
    return {
      texto: `Faltan ${diasRestantes} días`,
      color: '#ffc107',
      icono: 'time',
      urgencia: 'media' as const
    };
  }

  return {
    texto: `Faltan ${diasRestantes} días`,
    color: '#28a745',
    icono: 'time',
    urgencia: 'baja' as const
  };
};
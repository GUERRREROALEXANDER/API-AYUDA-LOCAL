export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
export const ESTADOS = ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'RECHAZADO'];

// Ciclo de vida: a que estados puede pasar un reporte desde cada estado.
// CERRADO y RECHAZADO son finales. RESUELTO puede volver a EN_PROCESO si la
// solucion no funciono. Repetir el estado actual (solo dejar una nota) se permite
// mientras el reporte no este en un estado final.
export const TRANSICIONES: Record<string, string[]> = {
  PENDIENTE: ['ASIGNADO', 'RECHAZADO'],
  ASIGNADO: ['EN_PROCESO', 'RECHAZADO'],
  EN_PROCESO: ['RESUELTO', 'RECHAZADO'],
  RESUELTO: ['CERRADO', 'EN_PROCESO'],
  CERRADO: [],
  RECHAZADO: [],
};

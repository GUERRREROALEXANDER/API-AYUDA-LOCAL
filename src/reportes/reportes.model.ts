export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  usuarioId: string;
  organizacionId?: string;
  barrio: string;
  direccion: string;
  prioridad: string;
  estado: string;
  fechaCreacion: string;
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReporteDto, UpdateReporteDto, AsignarReporteDto } from './reportes.dto';
import { Reporte } from './reportes.model';

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const ESTADOS = ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'RECHAZADO'];

@Injectable()
export class ReportesService {
  // Datos de demostracion: se reinician al detener la API.
  private reportes: Reporte[] = [
    {
      id: '1',
      titulo: 'Apoyo urgente a persona mayor',
      descripcion: 'Vecina en situacion vulnerable necesita acompanamiento',
      categoriaId: '2',
      usuarioId: '1',
      barrio: 'Centro',
      direccion: 'Calle 10 #5-20',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      fechaCreacion: '2026-09-01T10:00:00.000Z',
    },
    {
      id: '2',
      titulo: 'Falta de alimentos en comedor',
      descripcion: 'Comedor comunitario sin reservas para la semana',
      categoriaId: '1',
      usuarioId: '2',
      organizacionId: '1',
      barrio: 'San Jose',
      direccion: 'Carrera 8 #12-30',
      prioridad: 'MEDIA',
      estado: 'ASIGNADO',
      fechaCreacion: '2026-09-05T10:00:00.000Z',
    },
    {
      id: '3',
      titulo: 'Dano en via principal',
      descripcion: 'Hueco grande frente al parque infantil',
      categoriaId: '3',
      usuarioId: '3',
      organizacionId: '2',
      barrio: 'Los Pinos',
      direccion: 'Calle 45 #20-10',
      prioridad: 'URGENTE',
      estado: 'EN_PROCESO',
      fechaCreacion: '2026-09-10T10:00:00.000Z',
    },
    {
      id: '4',
      titulo: 'Donacion de ropa entregada',
      descripcion: 'Entrega de cobijas y prendas en jornada barrial',
      categoriaId: '4',
      usuarioId: '4',
      organizacionId: '1',
      barrio: 'Centro',
      direccion: 'Plaza central',
      prioridad: 'BAJA',
      estado: 'RESUELTO',
      fechaCreacion: '2026-09-12T10:00:00.000Z',
    },
  ];
  private nextId = 5;

  findAll(): Reporte[] {
    return this.reportes;
  }

  findById(id: string): Reporte {
    const item = this.reportes.find((item) => item.id === id);
    if (!item) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return item;
  }

  findByEstado(estado: string): Reporte[] {
    return this.reportes.filter((r) => r.estado === estado);
  }

  findByCategoria(categoriaId: string): Reporte[] {
    return this.reportes.filter((r) => r.categoriaId === categoriaId);
  }

  findByBarrio(barrio: string): Reporte[] {
    return this.reportes.filter((r) => r.barrio === barrio);
  }

  findByPrioridad(prioridad: string): Reporte[] {
    return this.reportes.filter((r) => r.prioridad === prioridad);
  }

  findByUsuario(usuarioId: string): Reporte[] {
    return this.reportes.filter((r) => r.usuarioId === usuarioId);
  }

  findByOrganizacion(organizacionId: string): Reporte[] {
    return this.reportes.filter((r) => r.organizacionId === organizacionId);
  }

  create(data: CreateReporteDto): Reporte {
    if (!PRIORIDADES.includes(data.prioridad)) {
      throw new BadRequestException('Prioridad invalida');
    }
    const item: Reporte = {
      ...data,
      id: String(this.nextId++),
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString(),
    };
    this.reportes.push(item);
    return item;
  }

  update(id: string, data: UpdateReporteDto): Reporte {
    const item = this.findById(id);
    if (!PRIORIDADES.includes(data.prioridad)) {
      throw new BadRequestException('Prioridad invalida');
    }
    Object.assign(item, data);
    return item;
  }

  asignar(id: string, data: AsignarReporteDto): Reporte {
    const item = this.findById(id);
    item.organizacionId = data.orgId;
    if (item.estado === 'PENDIENTE') {
      item.estado = 'ASIGNADO';
    }
    return item;
  }

  cambiarEstado(id: string, estado: string): Reporte {
    const item = this.findById(id);
    if (!ESTADOS.includes(estado)) {
      throw new BadRequestException('Estado invalido');
    }
    item.estado = estado;
    return item;
  }

  delete(id: string) {
    this.findById(id);
    this.reportes = this.reportes.filter((item) => item.id !== id);
    return { message: 'Reporte eliminado' };
  }
}

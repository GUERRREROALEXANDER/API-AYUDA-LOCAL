import { Injectable } from '@nestjs/common';
import { ReportesService } from '../reportes/reportes.service';
import { CreateSeguimientoDto } from './seguimientos.dto';
import { Seguimiento } from './seguimientos.model';

@Injectable()
export class SeguimientosService {
  // Datos de demostracion: se reinician al detener la API.
  private seguimientos: Seguimiento[] = [
    {
      id: '1',
      reporteId: '2',
      autorId: '1',
      nota: 'Organizacion asignada al caso',
      estadoAnterior: 'PENDIENTE',
      estadoNuevo: 'ASIGNADO',
      fecha: '2026-09-06T10:00:00.000Z',
    },
    {
      id: '2',
      reporteId: '3',
      autorId: '2',
      nota: 'Cuadrilla en camino',
      estadoAnterior: 'ASIGNADO',
      estadoNuevo: 'EN_PROCESO',
      fecha: '2026-09-11T10:00:00.000Z',
    },
  ];
  private nextId = 3;

  constructor(private readonly reportesService: ReportesService) {}

  findByReporte(reporteId: string): Seguimiento[] {
    this.reportesService.findById(reporteId);
    return this.seguimientos.filter((s) => s.reporteId === reporteId);
  }

  create(reporteId: string, data: CreateSeguimientoDto): Seguimiento {
    const reporte = this.reportesService.findById(reporteId);
    const estadoAnterior = reporte.estado;
    this.reportesService.cambiarEstado(reporteId, data.estadoNuevo);
    const item: Seguimiento = {
      ...data,
      id: String(this.nextId++),
      reporteId,
      estadoAnterior,
      fecha: new Date().toISOString(),
    };
    this.seguimientos.push(item);
    return item;
  }
}

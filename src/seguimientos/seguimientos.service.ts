import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesService } from '../reportes/reportes.service';
import { OrganizacionEntity } from '../organizaciones/entities/organizacion.entity';
import { ReporteEntity } from '../reportes/entities/reporte.entity';
import { SeguimientoEntity } from './entities/seguimiento.entity';
import { CreateSeguimientoDto } from './seguimientos.dto';

// Datos de demostracion: referencian los reportes 2 y 3 y las organizaciones 1 y 2
// sembrados por ReportesService y OrganizacionesService.
const SEED = [
  { reporteId: 2, autorId: 1, nota: 'Organizacion asignada al caso', estadoAnterior: 'PENDIENTE', estadoNuevo: 'ASIGNADO' },
  { reporteId: 3, autorId: 2, nota: 'Cuadrilla en camino', estadoAnterior: 'ASIGNADO', estadoNuevo: 'EN_PROCESO' },
];

@Injectable()
export class SeguimientosService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(SeguimientoEntity)
    private readonly seguimientosRepository: Repository<SeguimientoEntity>,
    @InjectRepository(OrganizacionEntity)
    private readonly organizacionesRepository: Repository<OrganizacionEntity>,
    private readonly reportesService: ReportesService,
  ) {}

  // Siembra los datos de demostracion la primera vez que la tabla esta vacia.
  async onApplicationBootstrap() {
    // Los seguimientos apuntan a reportes: esperar a que su siembra termine.
    await this.reportesService.seedOnce();
    if ((await this.seguimientosRepository.count()) > 0) {
      return;
    }
    for (const seed of SEED) {
      await this.seguimientosRepository.save(
        this.seguimientosRepository.create({
          reporte: { id: seed.reporteId } as ReporteEntity,
          autor: { id: seed.autorId } as OrganizacionEntity,
          nota: seed.nota,
          estadoAnterior: seed.estadoAnterior,
          estadoNuevo: seed.estadoNuevo,
        }),
      );
    }
  }

  async findByReporte(reporteId: string): Promise<SeguimientoEntity[]> {
    await this.reportesService.findById(reporteId);
    return this.seguimientosRepository.find({
      where: { reporte: { id: Number(reporteId) } },
      relations: { autor: true },
      order: { id: 'ASC' },
    });
  }

  async create(reporteId: string, data: CreateSeguimientoDto): Promise<SeguimientoEntity> {
    // Se valida todo antes de cambiar el estado, para no dejar el reporte
    // modificado si el autor no existe.
    const reporte = await this.reportesService.findById(reporteId);
    const autor = await this.organizacionesRepository.findOneBy({ id: Number(data.autorId) });
    if (!autor) {
      throw new NotFoundException('Organización no encontrada');
    }
    const estadoAnterior = reporte.estado;
    await this.reportesService.cambiarEstado(reporteId, data.estadoNuevo);
    return this.seguimientosRepository.save(
      this.seguimientosRepository.create({
        reporte: { id: Number(reporteId) } as ReporteEntity,
        autor: { id: Number(data.autorId) } as OrganizacionEntity,
        nota: data.nota,
        estadoAnterior,
        estadoNuevo: data.estadoNuevo,
      }),
    );
  }
}

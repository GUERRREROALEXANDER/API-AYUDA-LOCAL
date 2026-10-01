import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateReporteDto, UpdateReporteDto, AsignarReporteDto } from './reportes.dto';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  findAll() {
    return this.reportesService.findAll();
  }

  // Nota: las rutas fijas van ANTES de ':id'.
  @Get('estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.reportesService.findByEstado(estado);
  }

  @Get('categoria/:categoriaId')
  findByCategoria(@Param('categoriaId') categoriaId: string) {
    return this.reportesService.findByCategoria(categoriaId);
  }

  @Get('barrio/:barrio')
  findByBarrio(@Param('barrio') barrio: string) {
    return this.reportesService.findByBarrio(barrio);
  }

  @Get('prioridad/:prioridad')
  findByPrioridad(@Param('prioridad') prioridad: string) {
    return this.reportesService.findByPrioridad(prioridad);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reportesService.findById(id);
  }

  @Post()
  create(@Body() data: CreateReporteDto) {
    return this.reportesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateReporteDto) {
    return this.reportesService.update(id, data);
  }

  @Put(':id/asignar')
  asignar(@Param('id') id: string, @Body() data: AsignarReporteDto) {
    return this.reportesService.asignar(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reportesService.delete(id);
  }
}

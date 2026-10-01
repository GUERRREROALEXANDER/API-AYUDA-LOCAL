import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSeguimientoDto } from './seguimientos.dto';
import { SeguimientosService } from './seguimientos.service';

@Controller('reportes')
export class SeguimientosController {
  constructor(private readonly seguimientosService: SeguimientosService) {}

  @Get(':reporteId/seguimientos')
  findByReporte(@Param('reporteId') reporteId: string) {
    return this.seguimientosService.findByReporte(reporteId);
  }

  @Post(':reporteId/seguimientos')
  create(@Param('reporteId') reporteId: string, @Body() data: CreateSeguimientoDto) {
    return this.seguimientosService.create(reporteId, data);
  }
}

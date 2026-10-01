import { Module } from '@nestjs/common';
import { ReportesModule } from '../reportes/reportes.module';
import { SeguimientosController } from './seguimientos.controller';
import { SeguimientosService } from './seguimientos.service';

@Module({
  imports: [ReportesModule],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}

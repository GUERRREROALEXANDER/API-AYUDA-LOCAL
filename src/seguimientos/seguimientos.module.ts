import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguimientoEntity } from './entities/seguimiento.entity';
import { ReportesModule } from '../reportes/reportes.module';
import { SeguimientosController } from './seguimientos.controller';
import { SeguimientosService } from './seguimientos.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeguimientoEntity]), ReportesModule],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}

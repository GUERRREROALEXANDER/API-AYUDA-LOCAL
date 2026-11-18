import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguimientoEntity } from './entities/seguimiento.entity';
import { OrganizacionEntity } from '../organizaciones/entities/organizacion.entity';
import { ReportesModule } from '../reportes/reportes.module';
import { SeguimientosController } from './seguimientos.controller';
import { SeguimientosService } from './seguimientos.service';

@Module({
  // Se registra OrganizacionEntity (no OrganizacionesModule) para validar el autor sin crear un ciclo.
  imports: [TypeOrmModule.forFeature([SeguimientoEntity, OrganizacionEntity]), ReportesModule],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}

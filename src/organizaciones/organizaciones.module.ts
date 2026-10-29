import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionEntity } from './entities/organizacion.entity';
import { ReportesModule } from '../reportes/reportes.module';
import { OrganizacionesController } from './organizaciones.controller';
import { OrganizacionesService } from './organizaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizacionEntity]), ReportesModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}

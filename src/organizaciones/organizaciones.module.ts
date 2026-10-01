import { Module } from '@nestjs/common';
import { ReportesModule } from '../reportes/reportes.module';
import { OrganizacionesController } from './organizaciones.controller';
import { OrganizacionesService } from './organizaciones.service';

@Module({
  imports: [ReportesModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}

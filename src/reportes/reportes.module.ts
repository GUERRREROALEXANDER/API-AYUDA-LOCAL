import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteEntity } from './entities/reporte.entity';
import { CategoriaEntity } from '../categorias/entities/categoria.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrganizacionEntity } from '../organizaciones/entities/organizacion.entity';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  // Se registran tambien CategoriaEntity, UserEntity y OrganizacionEntity (no los modulos
  // completos) para poder validar que esos IDs existan antes de guardar un reporte, sin
  // crear un ciclo de modulos con UsersModule/OrganizacionesModule (que ya importan este).
  imports: [TypeOrmModule.forFeature([ReporteEntity, CategoriaEntity, UserEntity, OrganizacionEntity])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { OrganizacionesModule } from './organizaciones/organizaciones.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeguimientosModule } from './seguimientos/seguimientos.module';

@Module({
  imports: [UsersModule, OrganizacionesModule, CategoriasModule, ReportesModule, SeguimientosModule],
})
export class AppModule {}

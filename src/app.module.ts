import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { OrganizacionesModule } from './organizaciones/organizaciones.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [UsersModule, OrganizacionesModule, CategoriasModule],
})
export class AppModule {}

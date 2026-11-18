import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model';
import { UsersModule } from './users/users.module';
import { OrganizacionesModule } from './organizaciones/organizaciones.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeguimientosModule } from './seguimientos/seguimientos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow<number>('POSTGRES_PORT'),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        database: configService.getOrThrow('POSTGRES_DB'),
        autoLoadEntities: true,
        // Crea y ajusta las tablas a partir de las entidades (solo desarrollo).
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule, OrganizacionesModule, CategoriasModule, ReportesModule, SeguimientosModule,
  ],
})
export class AppModule {}

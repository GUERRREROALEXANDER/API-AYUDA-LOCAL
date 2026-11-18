import { IsIn, IsString, Matches } from 'class-validator';
import { ESTADOS } from '../reportes/reportes.constants';

// Los DTO validan el body antes de llamar al Service.
export class CreateSeguimientoDto {
  @IsString() @Matches(/\S/)
  autorId: string;
  @IsString() @Matches(/\S/)
  nota: string;
  @IsIn(ESTADOS)
  estadoNuevo: string;
}

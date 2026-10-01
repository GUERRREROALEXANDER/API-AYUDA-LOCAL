import { IsString, Matches } from 'class-validator';

// Los DTO validan el body antes de llamar al Service.
export class CreateSeguimientoDto {
  @IsString() @Matches(/\S/)
  autorId: string;
  @IsString() @Matches(/\S/)
  nota: string;
  @IsString() @Matches(/\S/)
  estadoNuevo: string;
}

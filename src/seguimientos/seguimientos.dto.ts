import { IsIn, IsString, Matches } from 'class-validator';
import { IdToString } from '../common/id-to-string.decorator';
import { ESTADOS } from '../reportes/reportes.constants';

// Los DTO validan el body antes de llamar al Service.
export class CreateSeguimientoDto {
  @IdToString()
  @IsString() @Matches(/\S/)
  autorId: string;
  @IsString() @Matches(/\S/)
  nota: string;
  @IsIn(ESTADOS)
  estadoNuevo: string;
}

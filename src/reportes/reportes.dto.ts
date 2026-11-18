import { IsString, Matches } from 'class-validator';
import { IdToString } from '../common/id-to-string.decorator';

// Los DTO validan el body antes de llamar al Service.
export class CreateReporteDto {
  @IsString() @Matches(/\S/)
  titulo: string;
  @IsString() @Matches(/\S/)
  descripcion: string;
  @IdToString()
  @IsString() @Matches(/\S/)
  categoriaId: string;
  @IdToString()
  @IsString() @Matches(/\S/)
  usuarioId: string;
  @IsString() @Matches(/\S/)
  barrio: string;
  @IsString() @Matches(/\S/)
  direccion: string;
  @IsString() @Matches(/\S/)
  prioridad: string;
}
// PUT exige todos los campos editables. El id, usuarioId,
// organizacionId, estado y fecha los administra el Service.
export class UpdateReporteDto {
  @IsString() @Matches(/\S/)
  titulo: string;
  @IsString() @Matches(/\S/)
  descripcion: string;
  @IdToString()
  @IsString() @Matches(/\S/)
  categoriaId: string;
  @IsString() @Matches(/\S/)
  barrio: string;
  @IsString() @Matches(/\S/)
  direccion: string;
  @IsString() @Matches(/\S/)
  prioridad: string;
}
export class AsignarReporteDto {
  @IdToString()
  @IsString() @Matches(/\S/)
  orgId: string;
}

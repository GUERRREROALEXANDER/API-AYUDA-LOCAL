import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, Matches } from 'class-validator';

// Los DTO validan el body antes de llamar al Service.
export class CreateCategoriaDto {
  @IsString() @Matches(/\S/)
  nombre: string;
  @IsString() @Matches(/\S/)
  descripcion: string;
}
// PUT exige todos los campos editables. El id lo administra el Service.
export class UpdateCategoriaDto extends CreateCategoriaDto {}
// PATCH acepta cualquier subconjunto de los campos editables.
export class PatchCategoriaDto extends PartialType(CreateCategoriaDto) {}

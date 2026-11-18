import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, Matches } from 'class-validator';

// Los DTO validan el body antes de llamar al Service.
export class CreateUserDto {
  @IsString() @Matches(/\S/)
  name: string;
  @IsEmail()
  email: string;
  @IsString() @Matches(/\S/)
  telefono: string;
  @IsString() @Matches(/\S/)
  barrio: string;
}
// PUT exige todos los campos editables. El id lo administra el Service.
export class UpdateUserDto extends CreateUserDto {}
// PATCH acepta cualquier subconjunto de los campos editables.
export class PatchUserDto extends PartialType(CreateUserDto) {}

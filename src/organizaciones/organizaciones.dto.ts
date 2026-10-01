import { IsEmail, IsString, Matches } from 'class-validator';

// Los DTO validan el body antes de llamar al Service.
export class CreateOrganizacionDto {
  @IsString() @Matches(/\S/)
  nombre: string;
  @IsString() @Matches(/\S/)
  nit: string;
  @IsEmail()
  email: string;
  @IsString() @Matches(/\S/)
  telefono: string;
  @IsString() @Matches(/\S/)
  zona: string;
}
// PUT exige todos los campos editables. El id lo administra el Service.
export class UpdateOrganizacionDto extends CreateOrganizacionDto {}

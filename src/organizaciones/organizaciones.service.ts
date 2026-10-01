import { Injectable, NotFoundException } from '@nestjs/common';
import { Organizacion } from './organizaciones.model';
import { CreateOrganizacionDto, UpdateOrganizacionDto } from './organizaciones.dto';

@Injectable()
export class OrganizacionesService {
  // Datos de demostracion: se reinician al detener la API.
  private organizaciones: Organizacion[] = [
  {
    "id": "1",
    "nombre": "Fundacion Comunidad Solidaria",
    "nit": "900100001",
    "email": "contacto@comunidad.example",
    "telefono": "3004445566",
    "zona": "Centro"
  },
  {
    "id": "2",
    "nombre": "Red Vecinal de Apoyo",
    "nit": "900100002",
    "email": "contacto@redvecinal.example",
    "telefono": "3005556677",
    "zona": "Norte"
  },
  {
    "id": "3",
    "nombre": "Fundacion Manos del Barrio",
    "nit": "900100003",
    "email": "organizacion3@example.com",
    "telefono": "3010000003",
    "zona": "Centro"
  },
  {
    "id": "4",
    "nombre": "Banco Comunitario de Alimentos",
    "nit": "900100004",
    "email": "organizacion4@example.com",
    "telefono": "3010000004",
    "zona": "Sur"
  },
  {
    "id": "5",
    "nombre": "Asociacion Techo Solidario",
    "nit": "900100005",
    "email": "organizacion5@example.com",
    "telefono": "3010000005",
    "zona": "Occidente"
  },
  {
    "id": "6",
    "nombre": "Red de Apoyo al Adulto Mayor",
    "nit": "900100006",
    "email": "organizacion6@example.com",
    "telefono": "3010000006",
    "zona": "Norte"
  },
  {
    "id": "7",
    "nombre": "Colectivo Semillas de Futuro",
    "nit": "900100007",
    "email": "organizacion7@example.com",
    "telefono": "3010000007",
    "zona": "Oriente"
  },
  {
    "id": "8",
    "nombre": "Brigada Comunitaria de Bienestar",
    "nit": "900100008",
    "email": "organizacion8@example.com",
    "telefono": "3010000008",
    "zona": "Zona rural"
  }
];
  private nextId = 9;

  findAll(): Organizacion[] {
    return this.organizaciones;
  }

  findById(id: string): Organizacion {
    const item = this.organizaciones.find(item => item.id === id);
    if (!item) {
      throw new NotFoundException('Organización no encontrada');
    }
    return item;
  }

  create(data: CreateOrganizacionDto): Organizacion {
    const item: Organizacion = { ...data, id: String(this.nextId++) };
    this.organizaciones.push(item);
    return item;
  }

  update(id: string, data: UpdateOrganizacionDto): Organizacion {
    const item = this.findById(id);
    Object.assign(item, data);
    return item;
  }

  delete(id: string) {
    this.findById(id);
    this.organizaciones = this.organizaciones.filter(item => item.id !== id);
    return { message: 'Organización eliminada' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './users.model';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  // Datos de demostracion: se reinician al detener la API.
  private users: User[] = [
  {
    "id": "1",
    "name": "Nicolas Casanova",
    "email": "nicolas@example.com",
    "telefono": "3001112233",
    "barrio": "Centro"
  },
  {
    "id": "2",
    "name": "Alexander Guerrero",
    "email": "alexander@example.com",
    "telefono": "3002223344",
    "barrio": "San Jose"
  },
  {
    "id": "3",
    "name": "Valentina Rojas",
    "email": "valentina.rojas@example.com",
    "telefono": "3000000003",
    "barrio": "Los Pinos"
  },
  {
    "id": "4",
    "name": "Mateo Salazar",
    "email": "mateo.salazar@example.com",
    "telefono": "3000000004",
    "barrio": "La Esperanza"
  },
  {
    "id": "5",
    "name": "Camila Torres",
    "email": "camila.torres@example.com",
    "telefono": "3000000005",
    "barrio": "El Progreso"
  },
  {
    "id": "6",
    "name": "Samuel Medina",
    "email": "samuel.medina@example.com",
    "telefono": "3000000006",
    "barrio": "Villa Nueva"
  },
  {
    "id": "7",
    "name": "Isabella Mora",
    "email": "isabella.mora@example.com",
    "telefono": "3000000007",
    "barrio": "Las Flores"
  },
  {
    "id": "8",
    "name": "Daniel Pineda",
    "email": "daniel.pineda@example.com",
    "telefono": "3000000008",
    "barrio": "San Jose"
  },
  {
    "id": "9",
    "name": "Luciana Vega",
    "email": "luciana.vega@example.com",
    "telefono": "3000000009",
    "barrio": "Centro"
  },
  {
    "id": "10",
    "name": "Sebastian Duarte",
    "email": "sebastian.duarte@example.com",
    "telefono": "3000000010",
    "barrio": "El Bosque"
  },
  {
    "id": "11",
    "name": "Mariana Cardenas",
    "email": "mariana.cardenas@example.com",
    "telefono": "3000000011",
    "barrio": "La Rivera"
  },
  {
    "id": "12",
    "name": "Tomas Acosta",
    "email": "tomas.acosta@example.com",
    "telefono": "3000000012",
    "barrio": "Los Robles"
  }
];
  private nextId = 13;

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User {
    const item = this.users.find(item => item.id === id);
    if (!item) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return item;
  }

  create(data: CreateUserDto): User {
    const item: User = { ...data, id: String(this.nextId++) };
    this.users.push(item);
    return item;
  }

  update(id: string, data: UpdateUserDto): User {
    const item = this.findById(id);
    Object.assign(item, data);
    return item;
  }

  delete(id: string) {
    this.findById(id);
    this.users = this.users.filter(item => item.id !== id);
    return { message: 'Usuario eliminado' };
  }
}

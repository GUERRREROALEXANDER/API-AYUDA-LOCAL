import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const SEED: Partial<UserEntity>[] = [
  { name: 'Nicolas Casanova', email: 'nicolas@example.com', telefono: '3001112233', barrio: 'Centro' },
  { name: 'Alexander Guerrero', email: 'alexander@example.com', telefono: '3002223344', barrio: 'San Jose' },
  { name: 'Valentina Rojas', email: 'valentina.rojas@example.com', telefono: '3000000003', barrio: 'Los Pinos' },
  { name: 'Mateo Salazar', email: 'mateo.salazar@example.com', telefono: '3000000004', barrio: 'La Esperanza' },
  { name: 'Camila Torres', email: 'camila.torres@example.com', telefono: '3000000005', barrio: 'El Progreso' },
  { name: 'Samuel Medina', email: 'samuel.medina@example.com', telefono: '3000000006', barrio: 'Villa Nueva' },
  { name: 'Isabella Mora', email: 'isabella.mora@example.com', telefono: '3000000007', barrio: 'Las Flores' },
  { name: 'Daniel Pineda', email: 'daniel.pineda@example.com', telefono: '3000000008', barrio: 'San Jose' },
  { name: 'Luciana Vega', email: 'luciana.vega@example.com', telefono: '3000000009', barrio: 'Centro' },
  { name: 'Sebastian Duarte', email: 'sebastian.duarte@example.com', telefono: '3000000010', barrio: 'El Bosque' },
  { name: 'Mariana Cardenas', email: 'mariana.cardenas@example.com', telefono: '3000000011', barrio: 'La Rivera' },
  { name: 'Tomas Acosta', email: 'tomas.acosta@example.com', telefono: '3000000012', barrio: 'Los Robles' },
];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // Siembra los datos de demostracion la primera vez que la tabla esta vacia.
  async onModuleInit() {
    const count = await this.usersRepository.count();
    if (count === 0) {
      await this.usersRepository.save(this.usersRepository.create(SEED));
    }
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<UserEntity> {
    const item = await this.usersRepository.findOneBy({ id: Number(id) });
    if (!item) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return item;
  }

  create(data: CreateUserDto): Promise<UserEntity> {
    return this.usersRepository.save(this.usersRepository.create(data));
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.usersRepository.save(item);
  }

  async delete(id: string) {
    const item = await this.findById(id);
    await this.usersRepository.remove(item);
    return { message: 'Usuario eliminado' };
  }
}

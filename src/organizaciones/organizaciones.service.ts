import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionEntity } from './entities/organizacion.entity';
import { CreateOrganizacionDto, UpdateOrganizacionDto } from './organizaciones.dto';

const SEED: Partial<OrganizacionEntity>[] = [
  { nombre: 'Fundacion Comunidad Solidaria', nit: '900100001', email: 'contacto@comunidad.example', telefono: '3004445566', zona: 'Centro' },
  { nombre: 'Red Vecinal de Apoyo', nit: '900100002', email: 'contacto@redvecinal.example', telefono: '3005556677', zona: 'Norte' },
  { nombre: 'Fundacion Manos del Barrio', nit: '900100003', email: 'organizacion3@example.com', telefono: '3010000003', zona: 'Centro' },
  { nombre: 'Banco Comunitario de Alimentos', nit: '900100004', email: 'organizacion4@example.com', telefono: '3010000004', zona: 'Sur' },
  { nombre: 'Asociacion Techo Solidario', nit: '900100005', email: 'organizacion5@example.com', telefono: '3010000005', zona: 'Occidente' },
  { nombre: 'Red de Apoyo al Adulto Mayor', nit: '900100006', email: 'organizacion6@example.com', telefono: '3010000006', zona: 'Norte' },
  { nombre: 'Colectivo Semillas de Futuro', nit: '900100007', email: 'organizacion7@example.com', telefono: '3010000007', zona: 'Oriente' },
  { nombre: 'Brigada Comunitaria de Bienestar', nit: '900100008', email: 'organizacion8@example.com', telefono: '3010000008', zona: 'Zona rural' },
];

@Injectable()
export class OrganizacionesService implements OnModuleInit {
  constructor(
    @InjectRepository(OrganizacionEntity)
    private readonly organizacionesRepository: Repository<OrganizacionEntity>,
  ) {}

  // Siembra los datos de demostracion la primera vez que la tabla esta vacia.
  async onModuleInit() {
    const count = await this.organizacionesRepository.count();
    if (count === 0) {
      await this.organizacionesRepository.save(this.organizacionesRepository.create(SEED));
    }
  }

  findAll(): Promise<OrganizacionEntity[]> {
    return this.organizacionesRepository.find();
  }

  async findById(id: string): Promise<OrganizacionEntity> {
    const item = await this.organizacionesRepository.findOneBy({ id: Number(id) });
    if (!item) {
      throw new NotFoundException('Organización no encontrada');
    }
    return item;
  }

  create(data: CreateOrganizacionDto): Promise<OrganizacionEntity> {
    return this.organizacionesRepository.save(this.organizacionesRepository.create(data));
  }

  async update(id: string, data: UpdateOrganizacionDto): Promise<OrganizacionEntity> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.organizacionesRepository.save(item);
  }

  async delete(id: string) {
    const item = await this.findById(id);
    await this.organizacionesRepository.remove(item);
    return { message: 'Organización eliminada' };
  }
}

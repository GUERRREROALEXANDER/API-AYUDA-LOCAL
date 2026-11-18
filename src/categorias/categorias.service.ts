import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEntity } from './entities/categoria.entity';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';

const SEED: Partial<CategoriaEntity>[] = [
  { nombre: 'Alimentos', descripcion: 'Necesidades de alimentacion' },
  { nombre: 'Persona vulnerable', descripcion: 'Apoyo a personas en situacion vulnerable' },
  { nombre: 'Infraestructura', descripcion: 'Problemas de infraestructura comunitaria' },
  { nombre: 'Ayuda general', descripcion: 'Otras necesidades de ayuda' },
  { nombre: 'Salud', descripcion: 'Apoyo comunitario para necesidades de salud y bienestar' },
  { nombre: 'Educacion', descripcion: 'Apoyo con utiles escolares y acompanamiento educativo' },
  { nombre: 'Vivienda', descripcion: 'Necesidades de alojamiento y mejoras basicas del hogar' },
  { nombre: 'Ropa y abrigo', descripcion: 'Donacion de prendas, calzado y cobijas' },
];

@Injectable()
export class CategoriasService implements OnModuleInit {
  constructor(
    @InjectRepository(CategoriaEntity)
    private readonly categoriasRepository: Repository<CategoriaEntity>,
  ) {}

  // Siembra los datos de demostracion la primera vez que la tabla esta vacia.
  async onModuleInit() {
    const count = await this.categoriasRepository.count();
    if (count === 0) {
      await this.categoriasRepository.save(this.categoriasRepository.create(SEED));
    }
  }

  findAll(): Promise<CategoriaEntity[]> {
    return this.categoriasRepository.find();
  }

  async findById(id: string): Promise<CategoriaEntity> {
    const item = await this.categoriasRepository.findOneBy({ id: Number(id) });
    if (!item) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return item;
  }

  create(data: CreateCategoriaDto): Promise<CategoriaEntity> {
    return this.categoriasRepository.save(this.categoriasRepository.create(data));
  }

  async update(id: string, data: UpdateCategoriaDto): Promise<CategoriaEntity> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.categoriasRepository.save(item);
  }

  async delete(id: string) {
    const item = await this.findById(id);
    await this.categoriasRepository.remove(item);
    return { message: 'Categoría eliminada' };
  }
}

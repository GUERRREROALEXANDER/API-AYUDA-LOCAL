import { Injectable, NotFoundException } from '@nestjs/common';
import { Categoria } from './categorias.model';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';

@Injectable()
export class CategoriasService {
  // Datos de demostracion: se reinician al detener la API.
  private categorias: Categoria[] = [
  {
    "id": "1",
    "nombre": "Alimentos",
    "descripcion": "Necesidades de alimentacion"
  },
  {
    "id": "2",
    "nombre": "Persona vulnerable",
    "descripcion": "Apoyo a personas en situacion vulnerable"
  },
  {
    "id": "3",
    "nombre": "Infraestructura",
    "descripcion": "Problemas de infraestructura comunitaria"
  },
  {
    "id": "4",
    "nombre": "Ayuda general",
    "descripcion": "Otras necesidades de ayuda"
  },
  {
    "id": "5",
    "nombre": "Salud",
    "descripcion": "Apoyo comunitario para necesidades de salud y bienestar"
  },
  {
    "id": "6",
    "nombre": "Educacion",
    "descripcion": "Apoyo con utiles escolares y acompanamiento educativo"
  },
  {
    "id": "7",
    "nombre": "Vivienda",
    "descripcion": "Necesidades de alojamiento y mejoras basicas del hogar"
  },
  {
    "id": "8",
    "nombre": "Ropa y abrigo",
    "descripcion": "Donacion de prendas, calzado y cobijas"
  }
];
  private nextId = 9;

  findAll(): Categoria[] {
    return this.categorias;
  }

  findById(id: string): Categoria {
    const item = this.categorias.find(item => item.id === id);
    if (!item) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return item;
  }

  create(data: CreateCategoriaDto): Categoria {
    const item: Categoria = { ...data, id: String(this.nextId++) };
    this.categorias.push(item);
    return item;
  }

  update(id: string, data: UpdateCategoriaDto): Categoria {
    const item = this.findById(id);
    Object.assign(item, data);
    return item;
  }

  delete(id: string) {
    this.findById(id);
    this.categorias = this.categorias.filter(item => item.id !== id);
    return { message: 'Categoría eliminada' };
  }
}

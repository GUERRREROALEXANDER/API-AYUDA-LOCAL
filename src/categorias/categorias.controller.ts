import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoriasService.findById(id);
  }

  @Post()
  create(@Body() data: CreateCategoriaDto) {
    return this.categoriasService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateCategoriaDto) {
    return this.categoriasService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriasService.delete(id);
  }
}

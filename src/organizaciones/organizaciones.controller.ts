import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto, UpdateOrganizacionDto } from './organizaciones.dto';

@Controller('organizaciones')
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Get()
  findAll() {
    return this.organizacionesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.organizacionesService.findById(id);
  }

  @Post()
  create(@Body() data: CreateOrganizacionDto) {
    return this.organizacionesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateOrganizacionDto) {
    return this.organizacionesService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.organizacionesService.delete(id);
  }
}

import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReporteDto, UpdateReporteDto, AsignarReporteDto } from './reportes.dto';
import { ReporteEntity } from './entities/reporte.entity';
import { CategoriaEntity } from '../categorias/entities/categoria.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrganizacionEntity } from '../organizaciones/entities/organizacion.entity';
import { ESTADOS, PRIORIDADES } from './reportes.constants';

// Datos de demostracion: referencian los mismos IDs que siembran Categorias, Users
// y Organizaciones (1..N en el mismo orden), asi que solo tienen sentido sobre una
// base de datos recien creada donde esos tres ya se sembraron primero.
const SEED = [
  {
    titulo: 'Apoyo urgente a persona mayor',
    descripcion: 'Vecina en situacion vulnerable necesita acompanamiento',
    categoriaId: 2,
    usuarioId: 1,
    organizacionId: null as number | null,
    barrio: 'Centro',
    direccion: 'Calle 10 #5-20',
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
  },
  {
    titulo: 'Falta de alimentos en comedor',
    descripcion: 'Comedor comunitario sin reservas para la semana',
    categoriaId: 1,
    usuarioId: 2,
    organizacionId: 1,
    barrio: 'San Jose',
    direccion: 'Carrera 8 #12-30',
    prioridad: 'MEDIA',
    estado: 'ASIGNADO',
  },
  {
    titulo: 'Dano en via principal',
    descripcion: 'Hueco grande frente al parque infantil',
    categoriaId: 3,
    usuarioId: 3,
    organizacionId: 2,
    barrio: 'Los Pinos',
    direccion: 'Calle 45 #20-10',
    prioridad: 'URGENTE',
    estado: 'EN_PROCESO',
  },
  {
    titulo: 'Donacion de ropa entregada',
    descripcion: 'Entrega de cobijas y prendas en jornada barrial',
    categoriaId: 4,
    usuarioId: 4,
    organizacionId: 1,
    barrio: 'Centro',
    direccion: 'Plaza central',
    prioridad: 'BAJA',
    estado: 'RESUELTO',
  },
];

@Injectable()
export class ReportesService implements OnModuleInit {
  constructor(
    @InjectRepository(ReporteEntity)
    private readonly reportesRepository: Repository<ReporteEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriasRepository: Repository<CategoriaEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizacionEntity)
    private readonly organizacionesRepository: Repository<OrganizacionEntity>,
  ) {}

  // Siembra los datos de demostracion la primera vez que la tabla esta vacia.
  async onModuleInit() {
    const count = await this.reportesRepository.count();
    if (count === 0) {
      for (const seed of SEED) {
        const entity = this.reportesRepository.create({
          titulo: seed.titulo,
          descripcion: seed.descripcion,
          categoria: { id: seed.categoriaId } as CategoriaEntity,
          usuario: { id: seed.usuarioId } as UserEntity,
          organizacion: seed.organizacionId ? ({ id: seed.organizacionId } as OrganizacionEntity) : null,
          barrio: seed.barrio,
          direccion: seed.direccion,
          prioridad: seed.prioridad,
          estado: seed.estado,
        });
        await this.reportesRepository.save(entity);
      }
    }
  }

  // Se cargan siempre las tres relaciones para que la respuesta muestre la
  // categoria, el usuario y (si ya se asigno) la organizacion, no solo su ID.
  private static readonly RELATIONS = { categoria: true, usuario: true, organizacion: true };

  findAll(): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({ relations: ReportesService.RELATIONS });
  }

  async findById(id: string): Promise<ReporteEntity> {
    const item = await this.reportesRepository.findOne({
      where: { id: Number(id) },
      relations: ReportesService.RELATIONS,
    });
    if (!item) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return item;
  }

  findByEstado(estado: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({ where: { estado }, relations: ReportesService.RELATIONS });
  }

  findByCategoria(categoriaId: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({
      where: { categoria: { id: Number(categoriaId) } },
      relations: ReportesService.RELATIONS,
    });
  }

  findByBarrio(barrio: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({ where: { barrio }, relations: ReportesService.RELATIONS });
  }

  findByPrioridad(prioridad: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({ where: { prioridad }, relations: ReportesService.RELATIONS });
  }

  findByUsuario(usuarioId: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({
      where: { usuario: { id: Number(usuarioId) } },
      relations: ReportesService.RELATIONS,
    });
  }

  findByOrganizacion(organizacionId: string): Promise<ReporteEntity[]> {
    return this.reportesRepository.find({
      where: { organizacion: { id: Number(organizacionId) } },
      relations: ReportesService.RELATIONS,
    });
  }

  private async getCategoria(categoriaId: string): Promise<CategoriaEntity> {
    const categoria = await this.categoriasRepository.findOneBy({ id: Number(categoriaId) });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  private async getUsuario(usuarioId: string): Promise<UserEntity> {
    const usuario = await this.usersRepository.findOneBy({ id: Number(usuarioId) });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  private async getOrganizacion(organizacionId: string): Promise<OrganizacionEntity> {
    const organizacion = await this.organizacionesRepository.findOneBy({ id: Number(organizacionId) });
    if (!organizacion) {
      throw new NotFoundException('Organización no encontrada');
    }
    return organizacion;
  }

  async create(data: CreateReporteDto): Promise<ReporteEntity> {
    if (!PRIORIDADES.includes(data.prioridad)) {
      throw new BadRequestException('Prioridad invalida');
    }
    const categoria = await this.getCategoria(data.categoriaId);
    const usuario = await this.getUsuario(data.usuarioId);
    const entity = this.reportesRepository.create({
      titulo: data.titulo,
      descripcion: data.descripcion,
      categoria,
      usuario,
      barrio: data.barrio,
      direccion: data.direccion,
      prioridad: data.prioridad,
      estado: 'PENDIENTE',
    });
    return this.reportesRepository.save(entity);
  }

  async update(id: string, data: UpdateReporteDto): Promise<ReporteEntity> {
    const item = await this.findById(id);
    if (!PRIORIDADES.includes(data.prioridad)) {
      throw new BadRequestException('Prioridad invalida');
    }
    item.categoria = await this.getCategoria(data.categoriaId);
    item.titulo = data.titulo;
    item.descripcion = data.descripcion;
    item.barrio = data.barrio;
    item.direccion = data.direccion;
    item.prioridad = data.prioridad;
    return this.reportesRepository.save(item);
  }

  async asignar(id: string, data: AsignarReporteDto): Promise<ReporteEntity> {
    const item = await this.findById(id);
    item.organizacion = await this.getOrganizacion(data.orgId);
    if (item.estado === 'PENDIENTE') {
      item.estado = 'ASIGNADO';
    }
    return this.reportesRepository.save(item);
  }

  async cambiarEstado(id: string, estado: string): Promise<ReporteEntity> {
    const item = await this.findById(id);
    if (!ESTADOS.includes(estado)) {
      throw new BadRequestException('Estado invalido');
    }
    item.estado = estado;
    return this.reportesRepository.save(item);
  }

  async delete(id: string) {
    const item = await this.findById(id);
    await this.reportesRepository.remove(item);
    return { message: 'Reporte eliminado' };
  }
}

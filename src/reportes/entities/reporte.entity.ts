import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { CategoriaEntity } from '../../categorias/entities/categoria.entity';
import { OrganizacionEntity } from '../../organizaciones/entities/organizacion.entity';
import { SeguimientoEntity } from '../../seguimientos/entities/seguimiento.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ESTADOS, PRIORIDADES } from '../reportes.constants';

@Entity({ name: 'reporte' })
export class ReporteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.reportes, { nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaEntity;

  @ManyToOne(() => UserEntity, (usuario) => usuario.reportes, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity;

  // Queda vacia hasta que el reporte se asigna a una organizacion.
  @ManyToOne(() => OrganizacionEntity, (organizacion) => organizacion.reportes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizacion_id' })
  organizacion: OrganizacionEntity | null;

  @Column({ type: 'varchar', length: 100 })
  barrio: string;

  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @Column({ type: 'enum', enum: PRIORIDADES })
  prioridad: string;

  @Column({ type: 'enum', enum: ESTADOS, default: 'PENDIENTE' })
  estado: string;

  @OneToMany(() => SeguimientoEntity, (seguimiento) => seguimiento.reporte)
  seguimientos: SeguimientoEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}

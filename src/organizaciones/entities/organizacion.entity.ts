import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ReporteEntity } from '../../reportes/entities/reporte.entity';
import { SeguimientoEntity } from '../../seguimientos/entities/seguimiento.entity';

@Entity({ name: 'organizacion' })
export class OrganizacionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  nit: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 100 })
  zona: string;

  @OneToMany(() => ReporteEntity, (reporte) => reporte.organizacion)
  reportes: ReporteEntity[];

  @OneToMany(() => SeguimientoEntity, (seguimiento) => seguimiento.autor)
  seguimientos: SeguimientoEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}

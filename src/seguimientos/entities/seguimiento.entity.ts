import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReporteEntity } from '../../reportes/entities/reporte.entity';
import { ESTADOS } from '../../reportes/reportes.constants';
import { OrganizacionEntity } from '../../organizaciones/entities/organizacion.entity';

@Entity({ name: 'seguimiento' })
export class SeguimientoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReporteEntity, (reporte) => reporte.seguimientos, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporte_id' })
  reporte: ReporteEntity;

  // El autor es la organizacion que atiende el reporte.
  @ManyToOne(() => OrganizacionEntity, (organizacion) => organizacion.seguimientos, { nullable: false })
  @JoinColumn({ name: 'autor_id' })
  autor: OrganizacionEntity;

  @Column({ type: 'text' })
  nota: string;

  @Column({ type: 'enum', enum: ESTADOS, name: 'estado_anterior' })
  estadoAnterior: string;

  @Column({ type: 'enum', enum: ESTADOS, name: 'estado_nuevo' })
  estadoNuevo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}

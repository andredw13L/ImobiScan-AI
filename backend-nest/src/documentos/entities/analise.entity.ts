import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentosEntity } from './documento.entity';

@Entity('analises')
export class AnaliseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', nullable: true })
  textoExtraido: string;

  @Column({ type: 'text', nullable: true })
  insightsIA: string;

  @Column({ default: 'pendente' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => DocumentosEntity, (documento) => documento.analise, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documento_id' })
  documento: DocumentosEntity;
}

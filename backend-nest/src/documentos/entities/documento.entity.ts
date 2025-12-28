import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { AnaliseEntity } from './analise.entity';

@Entity('documentos')
export class DocumentosEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomeOriginal: string;

  @Column()
  nomeArquivo: string;

  @Column()
  tipo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => AnaliseEntity, (analise) => analise.documento, {
    cascade: true,
  })
  analise: AnaliseEntity;
}

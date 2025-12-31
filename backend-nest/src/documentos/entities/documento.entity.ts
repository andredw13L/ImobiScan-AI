import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
} from 'typeorm';
import { AnaliseEntity } from './analise.entity';
import { v7 as uuidv7 } from 'uuid';

@Entity('documentos')
export class DocumentosEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  nomeOriginal: string;

  @Column()
  nomeArquivo: string;

  @Column()
  tipo: string;

  @Column({ type: 'int', nullable: true })
  tamanho: number;

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

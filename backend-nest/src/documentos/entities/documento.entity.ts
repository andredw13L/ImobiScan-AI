import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import { AnaliseEntity } from './analise.entity';
import { v7 as uuidv7 } from 'uuid';

@Entity('documentos')
export class DocumentosEntity {
  @PrimaryColumn()
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

  @Column()
  path: string;

  @Column({ type: 'int', nullable: true })
  tamanho: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => AnaliseEntity, (analise) => analise.documento, {
    cascade: true,
  })
  analise: AnaliseEntity;
}

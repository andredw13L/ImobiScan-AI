import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { DocumentosEntity } from './documento.entity';
import { v7 as uuidv7 } from 'uuid';

@Entity('analises')
export class AnaliseEntity {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ type: 'longtext', nullable: true })
  textoExtraido: string;

  @Column({ type: 'json', nullable: true })
  metadados: any;

  @Column({ nullable: true })
  statusProcessamento: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => DocumentosEntity, (doc) => doc.analise)
  @JoinColumn({ name: 'documento_id' })
  documento: DocumentosEntity;
}

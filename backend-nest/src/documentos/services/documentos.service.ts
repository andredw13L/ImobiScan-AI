import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentosEntity } from '../entities/documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentosEntity)
    private readonly docRepository: Repository<DocumentosEntity>,
  ) {}

  async criarComAnalise(file: Express.Multer.File) {
    const novoDocumento = this.docRepository.create({
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      tipo: file.mimetype,
      analise: {
        status: 'pendente',
      },
    });

    return await this.docRepository.save(novoDocumento);
  }

  async listarTodos() {
    return await this.docRepository.find({
      relations: ['analise'],
      order: { createdAt: 'DESC' },
    });
  }

  async salvarDocumento(file: Express.Multer.File) {
    const novoDocumento = this.docRepository.create({
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      tipo: file.mimetype,
      isActive: true,
    });

    return await this.docRepository.save(novoDocumento);
  }
}

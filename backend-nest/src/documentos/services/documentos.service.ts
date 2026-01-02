import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentosEntity } from '../entities/documento.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentosEntity)
    private readonly docRepository: Repository<DocumentosEntity>,
    @InjectQueue('ocr-queue') private readonly ocrQueue: Queue,
  ) {}

  async criarComAnalise(file: Express.Multer.File): Promise<DocumentosEntity> {
    const novoDocumento = this.docRepository.create({
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      tipo: file.mimetype,
      path: file.path,
      tamanho: file.size,
      isActive: true,
      analise: {
        statusProcessamento: 'pendente',
      },
    });

    const docSalvo = await this.docRepository.save(novoDocumento);

    await this.ocrQueue.add(
      'process-ocr',
      {
        documentId: docSalvo.id,
        filePath: docSalvo.path,
      },
      {
        attempts: 3,
        backoff: 2000,
      },
    );

    return docSalvo;
  }

  async listarTodos(): Promise<DocumentosEntity[]> {
    return await this.docRepository.find({
      relations: ['analise'],
      order: { createdAt: 'DESC' },
    });
  }
}

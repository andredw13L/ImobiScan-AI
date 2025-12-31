import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { DocumentosEntity } from '../entities/documento.entity';

interface OcrResponse {
  texto: string;
  metadados: {
    valor_contrato: string | null;
    cpf_encontrado: string | null;
    data_contrato: string | null;
  };
  tipo: string;
  status: string;
}

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentosEntity)
    private readonly docRepository: Repository<DocumentosEntity>,
    private readonly httpService: HttpService,
  ) {}

  async enviarParaAnalise(file: Express.Multer.File): Promise<OcrResponse> {
    const formData = new FormData();

    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await lastValueFrom(
        this.httpService.post<OcrResponse>(
          'http://localhost:8000/extract-text',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro na integração com OCR:', errorMessage);
      throw new InternalServerErrorException(
        'O OCR não respondeu corretamente',
      );
    }
  }

  async criarComAnalise(file: Express.Multer.File): Promise<DocumentosEntity> {
    const novoDocumento = this.docRepository.create({
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      tipo: file.mimetype,
      tamanho: file.size,
      isActive: true,
      analise: {
        statusProcessamento: 'pendente',
        textoExtraido: '',
        metadados: {},
      },
    });

    return await this.docRepository.save(novoDocumento);
  }

  async listarTodos(): Promise<DocumentosEntity[]> {
    return await this.docRepository.find({
      relations: ['analise'],
      order: { createdAt: 'DESC' },
    });
  }

  async salvarDocumento(file: Express.Multer.File): Promise<DocumentosEntity> {
    const novoDoc = this.docRepository.create({
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      tipo: file.mimetype,
      tamanho: file.size,
    });

    return await this.docRepository.save(novoDoc);
  }
}

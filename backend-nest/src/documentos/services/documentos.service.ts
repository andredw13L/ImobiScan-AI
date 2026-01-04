import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentosEntity } from '../entities/documento.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { RespostaIaDto } from '../DTO/resposta-ia-dto';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentosEntity)
    private readonly docRepository: Repository<DocumentosEntity>,
    @InjectQueue('ocr-queue') private readonly ocrQueue: Queue,
    private readonly httpService: HttpService,
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
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      },
    );

    return docSalvo;
  }

  async perguntarParaIa(dados: {
    documento_id: string;
    pergunta: string;
  }): Promise<RespostaIaDto> {
    const { documento_id, pergunta } = dados;

    const documento = await this.docRepository.findOne({
      where: { id: documento_id },
      relations: ['analise'],
    });

    if (!documento || !documento.analise?.textoExtraido) {
      throw new HttpException(
        'Documento não encontrado ou sem texto extraído.',
        404,
      );
    }

    if (documento.analise.statusProcessamento !== 'concluído') {
      throw new HttpException('Documento ainda em processamento.', 409);
    }

    try {
      const { data } = await this.httpService.axiosRef.post<RespostaIaDto>(
        'http://ai-python:8000/perguntar',
        {},
        {
          params: {
            id_documento: documento.id,
            pergunta: pergunta,
          },
        },
      );

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao consultar o serviço de IA: ${errorMessage}`);
      throw new HttpException('Falha ao obter resposta do serviço de IA.', 500);
    }
  }
}

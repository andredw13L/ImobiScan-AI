import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Job } from 'bullmq';
import { lastValueFrom } from 'rxjs';
import FormData from 'form-data';
import fs from 'fs';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { DocumentosEntity } from '../documentos/entities/documento.entity';
import { AnaliseEntity, MetadadosAnalise } from './entities/analise.entity';

interface OcrJobData {
  documentId: string;
  filePath: string;
}

interface OcrResponse {
  texto: string;
  metadados: MetadadosAnalise;
  tipo: string;
  status: string;
}

@Processor('ocr-queue', { concurrency: 1 })
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(DocumentosEntity)
    private readonly docRepository: Repository<DocumentosEntity>,
    @InjectRepository(AnaliseEntity)
    private readonly analiseRepository: Repository<AnaliseEntity>,
  ) {
    super();
  }

  async process(job: Job<OcrJobData>): Promise<void> {
    const { documentId, filePath } = job.data;

    const resultadoOcr = await this.enviarParaAnalise(filePath);
    await this.analiseRepository.update(
      { documento: { id: documentId } },
      {
        statusProcessamento: 'concluído',
        textoExtraido: resultadoOcr.texto,
        metadados: resultadoOcr.metadados,
      },
    );
  }

  private async enviarParaAnalise(filePath: string): Promise<OcrResponse> {
    const formData = new FormData();

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado no caminho: ${filePath}`);
    }

    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await lastValueFrom(
        this.httpService.post<OcrResponse>(
          'http://ocr-service:8000/extract-text',
          formData,
          { headers: { ...formData.getHeaders() } },
        ),
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[Worker OCR Error]: ${errorMessage}`);
      throw new InternalServerErrorException('O serviço de OCR falhou');
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job<OcrJobData>) {
    this.logger.log(`[FILA] Iniciando OCR: Doc ${job.data.documentId}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OcrJobData>) {
    this.logger.log(`[FILA] OCR Concluído: Doc ${job.data.documentId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OcrJobData>, error: Error) {
    this.logger.error(
      `[FILA] Erro no Doc ${job.data.documentId}: ${error.message}`,
    );
  }
}

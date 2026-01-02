import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  OnQueueEvent,
} from '@nestjs/bullmq';
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

  @OnQueueEvent('waiting')
  onWaiting(jobId: string) {
    this.logger.log(
      `[FILA] O job ${jobId} entrou na fila e está aguardando processamento.`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<OcrJobData>) {
    this.logger.log(
      `[FILA] Iniciando OCR: Doc ${job.data.documentId} (Job ID: ${job.id})`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<OcrJobData>, progress: number) {
    this.logger.log(
      `[FILA] Progresso OCR Doc ${job.data.documentId}: ${progress}%`,
    );
  }
  @OnWorkerEvent('completed')
  onCompleted(job: Job<OcrJobData>) {
    this.logger.log(`[FILA] OCR Concluído: Doc ${job.data.documentId}`);
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.log(
      '[FILA] Fila vazia: Todos os jobs pendentes foram finalizados.',
    );
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(`[FILA] Erro na fila de OCR: ${error.message}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OcrJobData>, error: Error) {
    this.logger.error(
      `[FILA] Erro no Doc ${job.data.documentId}: ${error.message}`,
    );
  }

  @OnWorkerEvent('paused')
  onPaused() {
    this.logger.warn(`[FILA] O processamento da fila foi pausado.`);
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<OcrJobData>) {
    this.logger.warn(
      `[FILA] O Job ${job.data.documentId} ficou travado (stalled). Verifique a saúde do worker.`,
    );
  }
}

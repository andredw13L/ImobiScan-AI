import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosEntity } from './entities/documento.entity';
import { AnaliseEntity } from './entities/analise.entity';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { OcrProcessor } from './ocr.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentosEntity, AnaliseEntity]),
    HttpModule,
    BullModule.registerQueue({
      name: 'ocr-queue',
    }),
  ],
  providers: [DocumentosService, OcrProcessor],
  controllers: [DocumentosController],
})
export class DocumentosModule {}

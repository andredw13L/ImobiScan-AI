import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosEntity } from './entities/documento.entity';
import { AnaliseEntity } from './entities/analise.entity';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentosEntity, AnaliseEntity]),
    HttpModule,
  ],
  providers: [DocumentosService],
  controllers: [DocumentosController],
})
export class DocumentosModule {}

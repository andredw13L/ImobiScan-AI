import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosEntity } from './entities/documento.entity';
import { AnaliseEntity } from './entities/analise.entity';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentosEntity, AnaliseEntity])],
  providers: [DocumentosService],
  controllers: [DocumentosController],
})
export class DocumentosModule {}

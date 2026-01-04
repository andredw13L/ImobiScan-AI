import {
  Controller,
  Post,
  UseInterceptors,
  InternalServerErrorException,
  HttpException,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from '../services/documentos.service';
import { diskStorage } from 'multer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentoResponseDto } from '../DTO/documento-response.dto';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { PerguntaIaDto } from '../DTO/pergunta-ia-dto';
import { RespostaIaDto } from '../DTO/resposta-ia-dto';

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Realiza upload de múltiplos documentos para processamento',
  })
  @ApiResponse({ status: 201, type: [DocumentoResponseDto] })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${nomeUnico}-${file.originalname}`);
        },
      }),
    }),
  )
  async realizarUpload(
    @UploadedFiles(new FileValidationPipe())
    files: Express.Multer.File[],
  ): Promise<DocumentoResponseDto[]> {
    try {
      const docsEntities = await this.documentosService.criarComAnalise(files);
      return docsEntities.map((doc) => DocumentoResponseDto.fromEntity(doc));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar documentos';

      throw new InternalServerErrorException({
        statusCode: 500,
        message: message || 'Erro ao processar os documentos.',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar os documentos e seuys status de processamento',
  })
  async listarTodos(): Promise<DocumentoResponseDto[]> {
    try {
      const docs = await this.documentosService.listarTodos();
      return docs.map((doc) => DocumentoResponseDto.fromEntity(doc));
    } catch {
      throw new InternalServerErrorException(
        'Não foi possível carregar a lista de documentos.',
      );
    }
  }

  @Post(':id/perguntar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Faz uma pergunta à IA sobre um documento específico',
  })
  @ApiResponse({ status: 200, type: RespostaIaDto })
  async perguntar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() corpo: PerguntaIaDto,
  ): Promise<RespostaIaDto> {
    try {
      return await this.documentosService.perguntarParaIa({
        documento_id: id,
        pergunta: corpo.pergunta,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar documento';

      throw new InternalServerErrorException({
        statusCode: 500,
        message: message || 'Erro ao processar o documento.',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
}

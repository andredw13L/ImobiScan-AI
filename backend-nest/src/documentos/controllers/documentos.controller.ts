import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from '../services/documentos.service';
import { diskStorage } from 'multer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentoResponseDto } from '../DTO/documento-response.dto';
import { FileValidationPipe } from '../pipes/file-validation.pipe';

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Realiza upload de um documento para processamento',
  })
  @ApiResponse({ status: 201, type: DocumentoResponseDto })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @UseInterceptors(
    FileInterceptor('file', {
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
    @UploadedFile(new FileValidationPipe())
    file: Express.Multer.File,
  ): Promise<DocumentoResponseDto> {
    try {
      const docEntity = await this.documentosService.salvarDocumento(file);
      return DocumentoResponseDto.fromEntity(docEntity);
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

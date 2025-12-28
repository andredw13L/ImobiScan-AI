import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from '../services/documentos.service';
import { diskStorage } from 'multer';

@Controller('documentos')
export class DocumentosController {
  // TODO: Adicionar mais tipos de arquivos se necessário
  private allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];

  constructor(private readonly service: DocumentosService) {}

  @Post('upload')
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
  realizarUpload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Aceitos: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    return {
      status: 'sucesso',
      arquivo: file.filename,
      tamanho: file.size,
      mimetype: file.mimetype,
    };
  }
}

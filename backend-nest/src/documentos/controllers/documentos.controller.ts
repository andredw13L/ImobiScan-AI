import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from '../services/documentos.service';
import { diskStorage } from 'multer';

@Controller('documentos')
export class DocumentosController {
  private allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];

  constructor(private readonly documentosService: DocumentosService) {}

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
  async realizarUpload(
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

    return await this.documentosService.salvarDocumento(file);
  }
}

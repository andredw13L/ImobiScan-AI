import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'application/pdf',
  ];
  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf'];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'O arquivo é obrigatório.',
      });
    }

    const fileName = file.originalname.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Extensão inválida. Aceitas: ${this.ALLOWED_EXTENSIONS.join(', ')}`,
      });
    }

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Tipo de arquivo não permitido. Aceitos: ${this.ALLOWED_TYPES.join(', ')}`,
      });
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException({
        statusCode: 400,
        message: `O arquivo excede o limite de 5MB. Tamanho atual: ${this.formatBytes(file.size)}`,
      });
    }

    if (file.size === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'O arquivo está vazio.',
      });
    }

    return file;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

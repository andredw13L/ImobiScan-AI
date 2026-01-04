import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  private readonly MAX_SIZE = 10 * 1024 * 1024;

  private readonly ALLOWED_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.pdf',
    '.webp',
    '.docx',
    '.txt',
    '.tiff',
    '.tif',
    '.bmp',
  ];

  transform(value: Express.Multer.File | Express.Multer.File[]) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Nenhum arquivo enviado.',
      });
    }

    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      this.validateSingleFile(file);
    }

    return value;
  }

  private validateSingleFile(file: Express.Multer.File) {
    const fileName = file.originalname.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Arquivo ${file.originalname} possui extensão inválida.`,
      });
    }

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Tipo não permitido para ${file.originalname}: ${file.mimetype}`,
      });
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException({
        statusCode: 400,
        message: `O arquivo ${file.originalname} excede 10MB. (Atual: ${this.formatBytes(file.size)})`,
      });
    }

    if (file.size === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: `O arquivo ${file.originalname} está vazio.`,
      });
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }
}

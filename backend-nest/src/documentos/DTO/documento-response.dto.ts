import { ApiProperty } from '@nestjs/swagger';
import { DocumentosEntity } from '../entities/documento.entity';

export class DocumentoResponseDto {
  @ApiProperty({ description: 'ID único do documento no banco', example: 1 })
  id: string;

  @ApiProperty({
    description: 'Nome original do arquivo enviado',
    example: 'nota_fiscal.pdf',
  })
  nomeOriginal: string;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'application/pdf',
  })
  tipo: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-12-29T00:00:00Z',
  })
  createdAt: Date;

  static fromEntity(entity: DocumentosEntity): DocumentoResponseDto {
    const dto = new DocumentoResponseDto();
    dto.id = entity.id;
    dto.nomeOriginal = entity.nomeOriginal;
    dto.tipo = entity.tipo;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PerguntaIaDto {
  @ApiProperty({
    description:
      'A pergunta que você deseja fazer sobre o conteúdo do documento',
    example: 'Resuma os principais pontos deste contrato.',
  })
  @IsString()
  @IsNotEmpty()
  pergunta: string;
}

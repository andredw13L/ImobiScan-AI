import { ApiProperty } from '@nestjs/swagger';

export class RespostaIaDto {
  @ApiProperty({
    description:
      'A resposta gerada pela inteligência artificial com base no contexto do documento',
    example: 'O documento trata de...',
  })
  resposta: string;
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
    );
    console.error(
      'Detalhes do Erro:',
      exception instanceof Error ? exception.stack : exception,
    );

    let message = 'Ocorreu um erro interno no servidor';

    if (exception instanceof HttpException && status < 500) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message =
          ((exceptionResponse as Record<string, unknown>).message as string) ||
          JSON.stringify(exceptionResponse);
      } else {
        message = String(exceptionResponse);
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

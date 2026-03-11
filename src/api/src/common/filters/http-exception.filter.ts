import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface StandardErrorResponse {
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: StandardErrorResponse = {
      statusCode: status,
      message: 'Error interno del servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        body = { statusCode: status, message: exResponse };
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const r = exResponse as Record<string, unknown>;
        const message =
          typeof r.message === 'string'
            ? r.message
            : Array.isArray(r.message)
              ? (r.message[0] as string) || 'Error de validación'
              : 'Error de solicitud';

        const errors = Array.isArray(r.message)
          ? (r.message as string[]).map((m) => ({ message: m }))
          : undefined;

        body = { statusCode: status, message, errors };
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json(body);
  }
}

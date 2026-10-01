import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp: string;
}

/**
 * Uniform error envelope for the whole API:
 * `{ statusCode, message, error?, path, timestamp }`.
 * Unknown (non-HTTP) errors are logged with their stack and masked as 500 so
 * internal details never leak to clients.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: request.url,
        timestamp: new Date().toISOString(),
      } satisfies ErrorBody);
      return;
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();
    const base: ErrorBody = {
      statusCode: status,
      message:
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ??
            exception.message),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (typeof payload === 'object' && payload !== null) {
      const { error } = payload as { error?: string };
      if (error) base.error = error;
    }

    response.status(status).json(base);
  }
}

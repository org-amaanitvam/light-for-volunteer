import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Request/response logging with duration. No bodies are logged (PII-safe). */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const { method, url } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = context.switchToHttp().getResponse<{ statusCode: number }>();
        this.logger.log(`${method} ${url} ${statusCode} +${Date.now() - startedAt}ms`);
      }),
    );
  }
}

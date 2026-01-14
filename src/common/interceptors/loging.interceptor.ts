import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LogingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogingInterceptor.name);

  // context -> contains request and response objects
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user?: { id: string; email: string; role: string } }
      >();
    const method = request.method;
    const userAgent = request.headers['user-agent'];
    const url = request.url;
    const userId = request.user?.id || 'unauthorized';
    console.log(request.url);

    const startTime = Date.now();

    // tap operators allows us to perform side effects
    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.log(
            `[${method}:${url} - User:${userId} agent:${userAgent}]Duration: ${duration}ms`,
          );
        },
        error: () => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.log(
            `[${method}:${url} - User:${userId} agent:${userAgent}] - ERROR - Duration: ${duration}ms`,
          );
        },
      }),
    );
  }
}

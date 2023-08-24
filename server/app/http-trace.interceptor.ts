import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { DBError } from 'objection';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { NestRequest, NestResponse } from '@app/utils';

@Injectable()
export class HttpTraceInterceptor implements NestInterceptor {
  protected readonly logger = new Logger(HttpTraceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const now = Date.now();
    const request = context.switchToHttp().getRequest() as NestRequest;
    const method = request.method;
    const path = request.path;
    let query: string;

    try {
      query = JSON.stringify(request.query || {});
    } catch (err) {
      query = JSON.stringify({ queryStringifyErr: 1 });
    }

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        const status =
          Reflect.getMetadata(HTTP_CODE_METADATA, context.getHandler()) ||
          (method === 'POST' ? HttpStatus.CREATED : HttpStatus.OK);
        this.logger.log(`${method} [${status}] ${path} ${query} (${delay}ms)`);
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        const response = context.switchToHttp().getResponse() as NestResponse;

        if (
          [HttpStatus.NOT_FOUND, HttpStatus.TOO_MANY_REQUESTS].includes(
            err.status ?? response.statusCode,
          )
        ) {
          this.logger.debug(
            err,
            `${method} [${
              err.status ?? response.statusCode
            }] ${path} ${query} (${delay}ms)`,
          );
          return throwError(err);
        }

        this.logger.error(
          err instanceof DBError ? err.nativeError : err,
          `${method} [${
            err.status ?? response.statusCode
          }] ${path} ${query} (${delay}ms)`,
        );

        return throwError(err);
      }),
    );
  }
}

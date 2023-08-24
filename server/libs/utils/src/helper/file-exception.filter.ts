import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { removeFile } from './file-remove';

@Catch(HttpException)
export class FileExceptionFilter implements ExceptionFilter {
  constructor(private readonly fileField: string = 'file') {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (request[this.fileField]) {
      removeFile(request[this.fileField].path);
    }

    response.status(status).json(exception.getResponse());
  }
}

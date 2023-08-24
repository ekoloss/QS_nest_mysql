import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { DBError } from 'objection';

import { BaseModel } from '@app/utils';

@Catch(DBError)
export class ConflictExceptionFilter implements ExceptionFilter {
  catch(error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (BaseModel.isUniqueViolationError(error)) {
      response.status(HttpStatus.CONFLICT).send({
        statusCode: HttpStatus.CONFLICT,
        message: error.nativeError?.sqlMessage,
        detail: error.constraint,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}

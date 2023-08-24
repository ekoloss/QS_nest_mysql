import { PipeTransform, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';

const messages = {
  'date.base': 'should be an ISO string',
  'string.base': 'should be a string',
  'string.empty': 'cannot be an empty',
  'string.min': 'min length',
  'string.guid': 'invalid id format',
  'any.required': 'is required',
  'any.only': 'must be one of',
  'number.base': 'should be a number',
  'number.min': 'min',
};

export class ValidatorPipe<T> implements PipeTransform<T> {
  constructor(private readonly schema: Joi.ObjectSchema | Joi.ArraySchema) {}

  public transform(value: T): T {
    const result = this.schema.messages(messages).validate(value);

    if (result.error) {
      if (result.error instanceof Error) {
        const { label, value, regex, ...params } =
          result.error.details?.[0]?.context || {};

        throw new BadRequestException({
          message: result.error.message,
          ...params,
        });
      }

      throw new BadRequestException(result.error);
    }

    return result.value;
  }
}

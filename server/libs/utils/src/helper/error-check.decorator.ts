import { ConflictException } from '@nestjs/common';

import { BaseModel } from '../db';

export const ErrorCheck = ({
  onConflict,
  onError,
}: {
  onConflict?: (err: any) => void;
  onError?: (err: any) => void;
} = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      try {
        return await original.call(this, ...args);
      } catch (err) {
        if (BaseModel.isUniqueViolationError(err)) {
          onConflict && onConflict(err);
          const { nativeError } = err as any;

          throw new ConflictException({
            message: nativeError.constraint,
            detail: nativeError.detail,
          });
        }

        onError && onError(err);
        throw err;
      }
    };
  };
};

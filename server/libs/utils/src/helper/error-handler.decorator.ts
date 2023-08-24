import { logger } from '@app/logger';

export const ErrorHandler = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      try {
        return await original.call(this, ...args);
      } catch (err) {
        logger.error(err, `${target.constructor.name} -> ${propertyKey}`);
      }
    };
  };
};

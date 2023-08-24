import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

import { Config } from '@app/global';
import { logger } from '@app/logger';

export const Cache = ({
  key,
  ex,
}: {
  key: (...args: any[]) => string;
  ex?: (...args: any[]) => number;
}) => {
  const redisInjector = Inject('redis');
  const configInjector = Inject('config');

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    redisInjector(target, 'redis');
    configInjector(target, 'config');

    const original = descriptor.value;

    descriptor.value = async function (...args) {
      const redis: Redis = await this['redis'];
      const config: Config = await this['config'];

      const redisKey = key.call(this, config, ...args);

      const expire = [];

      if (ex) {
        expire.push('EX');
        expire.push(ex.call(this, config, ...args));
      }
      try {
        const data = await redis.get(redisKey);

        if (data) {
          return JSON.parse(data);
        }
      } catch (err) {
        logger.warn(err);
      }

      const res = await original.call(this, ...args);

      await redis.set(redisKey, JSON.stringify(res), ...expire);

      return res;
    };
  };
};

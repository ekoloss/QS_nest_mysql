import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: process.env.REDIS_PRIFIX,
}));

export const redisValidate = {
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_DB: Joi.number(),
  REDIS_PASSWORD: Joi.string(),
  REDIS_PREFIX: Joi.string(),
};

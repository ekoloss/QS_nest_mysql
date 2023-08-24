import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const authConfig = registerAs('auth', () => ({
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  ott: {
    expiresIn: process.env.OTT_EXPIRES_IN,
    storePrefix: process.env.OTT_STORE_PREFIX,
  },
}));

export const authValidate = {
  JWT_PRIVATE_KEY: Joi.string().required().min(100),
  JWT_ALGORITHM: Joi.string().default('HS256'),
  JWT_EXPIRES_IN: Joi.number()
    .integer()
    .default(1000 * 60 * 60 * 24 * 7),
  OTT_EXPIRES_IN: Joi.number()
    .integer()
    .default(1000 * 60 * 15),
  OTT_STORE_PREFIX: Joi.string().default('ott'),
};

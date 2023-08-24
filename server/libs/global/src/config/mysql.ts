import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const mysqlConfig = registerAs('mysql', () => ({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  user: process.env.MYSQL_USER,
}));

export const mysqlValidate = {
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().required(),
  MYSQL_DATABASE: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_USER: Joi.string().required(),
};

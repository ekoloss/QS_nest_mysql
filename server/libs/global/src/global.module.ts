import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  RedisModule,
  RedisModuleOptions,
  RedisService,
} from '@liaoliaots/nestjs-redis';
import {
  ObjectionModule,
  ObjectionModuleOptions,
} from '@willsoto/nestjs-objection';
import { Redis } from 'ioredis';
import * as Joi from 'joi';

import { BaseModel } from '@app/utils';

import {
  authConfig,
  authValidate,
  mysqlConfig,
  mysqlValidate,
  redisConfig,
  redisValidate,
} from './config';

export type Config = <T = any>(path: string, defaultValue?: any) => T;

@Global()
@Module({
  providers: [
    {
      provide: 'redis',
      inject: [RedisService],
      useFactory: (redisService): Redis => redisService.getClient(),
    },
    {
      provide: 'config',
      inject: [ConfigService],
      useFactory:
        (configService): Config =>
        (path: string, defaultValue?: any) =>
          configService.getOrThrow(path, defaultValue),
    },
  ],
  exports: ['redis', 'config'],
  imports: [
    ConfigModule.forRoot({
      load: [authConfig, redisConfig, mysqlConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        SERVER_PORT: Joi.when('NODE_ENV', {
          is: 'test',
          then: Joi.number().default(4000),
          otherwise: Joi.number().min(0).required(),
        }),
        ...authValidate,
        ...redisValidate,
        ...mysqlValidate,
      }),
      cache: true,
    }),
    ObjectionModule.registerAsync({
      inject: ['config'],
      useFactory: async (config: Config): Promise<ObjectionModuleOptions> => ({
        Model: BaseModel,
        config: {
          client: 'mysql2',
          connection: config('mysql'),
        },
      }),
    }),
    RedisModule.forRootAsync({
      inject: ['config'],
      useFactory: async (config: Config): Promise<RedisModuleOptions> => ({
        config: config('redis'),
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
})
export class GlobalModule {}

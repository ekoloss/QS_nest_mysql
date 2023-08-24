import {
  Inject,
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';

import { Config } from '@app/global';
import { logger } from '@app/logger';
import { NestRequest } from '@app/utils';

import { IAuthAccessOptions } from './interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('redis') private readonly redis: Redis,
    @Inject('config') private readonly config: Config,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options: IAuthAccessOptions = {
      ...this.reflector.get<IAuthAccessOptions>(
        'authAccess',
        context.getClass(),
      ),
      ...this.reflector.get<IAuthAccessOptions>(
        'authAccess',
        context.getHandler(),
      ),
    };

    if (options.useOTT) {
      await this.useOTT(context);
    } else {
      this.decryptToken(context);
    }

    return this.checkAccess(context);
  }

  checkAccess(context: ExecutionContext) {
    const { isAuthorized, auth } = context
      .switchToHttp()
      .getRequest<NestRequest>();
    const options: IAuthAccessOptions = {
      ...this.reflector.get<IAuthAccessOptions>(
        'authAccess',
        context.getClass(),
      ),
      ...this.reflector.get<IAuthAccessOptions>(
        'authAccess',
        context.getHandler(),
      ),
    };

    if (options.mode === 'any') {
      return true;
    }

    if (
      (isAuthorized && options.mode === 'guest') ||
      (!isAuthorized && (options.mode === 'authorised' || options.role))
    ) {
      throw new ForbiddenException('access denied');
    }

    if (options.mode === 'guest') {
      return true;
    }

    if (options.role) {
      if (!(options.role instanceof Array)) {
        options.role = [options.role];
      }

      if (options.role?.every((roleName) => !auth?.role[roleName])) {
        throw new ForbiddenException('access denied');
      }
    }

    return true;
  }

  async useOTT(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestRequest>();

    request.auth = null;
    request.isAuthorized = false;

    if (!request.query?.ott) {
      return;
    }

    try {
      const ott = await this.redis.get(`ott:${request.query?.ott}`);
      await this.redis.del(`ott:${request.query?.ott}`);

      if (ott) {
        request.auth = JSON.parse(ott);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  decryptToken(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestRequest>();

    request.auth = null;
    request.isAuthorized = false;

    if (request.headers['authorization']) {
      try {
        request.auth = jwt.verify(
          request.headers['authorization']
            .replace(/Bearer/gi, '')
            .replace(/ /g, '')
            .replace(/['"]+/g, ''),
          this.config('auth.jwt.privateKey'),
          {
            expiresIn: this.config('auth.jwt.expiresIn'),
            algorithm: this.config('auth.jwt.algorithm'),
          },
        );

        request.isAuthorized = true;
      } catch (err) {
        logger.warn(err);
        throw new UnauthorizedException('bad token');
      }
    }
  }
}

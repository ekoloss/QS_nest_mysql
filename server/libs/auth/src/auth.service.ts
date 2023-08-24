import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { raw } from 'objection';
import { v5 as hash, v4 as uuid } from 'uuid';

import { ILoginBody, ILoginResponse, IOTTResponse } from '@models';
import { Config } from '@app/global';
import { AccountOrm } from '@app/orm';
import { namespaces, IRequestAuth } from '@app/utils';

@Injectable()
export class AuthService {
  constructor(
    @Inject('redis') private readonly redis: Redis,
    @Inject('config') private readonly config: Config,
  ) {}

  async login({ login, password }: ILoginBody): Promise<ILoginResponse> {
    const account = await AccountOrm.query()
      .where(AccountOrm.column('login'), login)
      .first();

    if (!account) {
      throw new BadRequestException();
    }

    const salt = await this.redis.get(`salt:${account.id}`);
    if (!salt) {
      throw new BadRequestException();
    }

    if (hash(`${password}${salt}`, namespaces.password) !== account.password) {
      throw new BadRequestException();
    }

    await AccountOrm.query()
      .findById(account.id)
      .update({
        last_login: raw('CURRENT_TIME()'),
      });

    return {
      token: this.signe({
        id: account.id,
        role: account.role,
      }),
    };
  }

  async createOTT(auth: IRequestAuth): Promise<IOTTResponse> {
    const ott = uuid();

    await this.redis.set(
      `${this.config('auth.ott.storePrefix')}:${ott}`,
      JSON.stringify(auth),
      'PX',
      this.config('auth.ott.expiresIn'),
    );

    return { ott };
  }

  signe(data: IRequestAuth): string {
    return jwt.sign(data, this.config('auth.jwt.privateKey'), {
      expiresIn: this.config('auth.jwt.expiresIn'),
      algorithm: this.config('auth.jwt.algorithm'),
    });
  }
}

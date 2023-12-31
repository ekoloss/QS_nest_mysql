import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { startOfDay, endOfDay } from 'date-fns';
import Redis from 'ioredis';
import { raw, TransactionOrKnex } from 'objection';
import { v5 as hash, v4 as uuid } from 'uuid';

import {
  IAccountChangePasswordBody,
  IAccountCreateBody,
  IAccountGetListQuery,
  IAccountModel,
  IAccountResetPasswordBody,
  IAccountResponse,
  IAccountUpdateBody,
  IPaginateResult,
} from '@models';
import { AccountOrm } from '@app/orm';
import { Cache, namespaces, Transaction } from '@app/utils';
import { IRequestAuth } from '@app/utils';

@Injectable()
export class AccountService {
  constructor(
    @Inject('redis') private readonly redis: Redis,
    private eventEmitter: EventEmitter2,
  ) {}

  @Transaction()
  async create(
    { login, password, role }: IAccountCreateBody,
    trx?: TransactionOrKnex,
  ): Promise<IAccountResponse> {
    const salt = uuid();

    const account = this.cleanPublicAccount(
      await AccountOrm.query(trx).cleanInsertAndFetch({
        login,
        password: hash(`${password}${salt}`, namespaces.password),
        role,
      }),
    );

    this.eventEmitter.emit('account.create', account);
    await this.redis.set(`salt:${account.id}`, salt);

    return account;
  }

  async update(
    accountId: number,
    { login }: IAccountUpdateBody,
  ): Promise<IAccountResponse> {
    const account = await AccountOrm.query().updateAndFetchById(accountId, {
      login,
      updated_at: raw('CURRENT_TIME()'),
    });

    const cleanAcc = this.cleanPublicAccount(account);

    this.eventEmitter.emit('account.update', cleanAcc);

    return cleanAcc;
  }

  @Transaction()
  async delete(accountId: number, trx?: TransactionOrKnex): Promise<void> {
    await AccountOrm.query(trx).deleteById(accountId);

    await this.redis.del(`salt:${accountId}`);

    this.eventEmitter.emit('account.delete', { accountId });
  }

  async resetPassword(
    accountId: number,
    { password }: Pick<IAccountResetPasswordBody, 'password'>,
  ): Promise<IAccountResponse> {
    return this.hardResetPassword(accountId, { password });
  }

  async changePassword(
    { id }: IRequestAuth,
    { password, oldPassword }: IAccountChangePasswordBody,
  ): Promise<IAccountResponse> {
    const account = await AccountOrm.query().findById(id);

    if (!account) {
      throw new NotFoundException();
    }

    const oldSalt = await this.redis.get(`salt:${account.id}`);
    if (!oldSalt) {
      throw new BadRequestException('access denied');
    }

    if (
      hash(`${oldPassword}${oldSalt}`, namespaces.password) !== account.password
    ) {
      throw new BadRequestException('access denied');
    }

    return this.hardResetPassword(id, { password });
  }

  async getById(id: number): Promise<IAccountResponse> {
    const account = await AccountOrm.query().findById(id);

    if (!account) {
      throw new NotFoundException();
    }

    return this.cleanPublicAccount(account);
  }

  async getList({
    page,
    page_size,
    sort_by,
    sort_order,
    login,
    start_date,
    end_date,
  }: IAccountGetListQuery): Promise<IPaginateResult<IAccountResponse>> {
    const query = AccountOrm.query().page(page, page_size);

    if (login) {
      query.where(AccountOrm.column('login'), 'ilike', `%${login}%`);
    }

    if (start_date) {
      query.where(
        AccountOrm.column('created_at'),
        '>',
        startOfDay(new Date(start_date)).toISOString(),
      );
    }

    if (end_date) {
      query.where(
        AccountOrm.column('created_at'),
        '<',
        endOfDay(new Date(end_date)).toISOString(),
      );
    }

    if (sort_by && sort_order) {
      query.orderBy(sort_by, sort_order);
    }

    const res = await query;

    return {
      total: res.total,
      results: res.results.map((account) => this.cleanPublicAccount(account)),
    };
  }

  private cleanPublicAccount(account: IAccountModel): IAccountResponse {
    delete account?.is_active;
    delete account?.password;

    return account;
  }

  private async hardResetPassword(
    accountId: number,
    { password }: Pick<IAccountResetPasswordBody, 'password'>,
  ): Promise<IAccountResponse> {
    const salt = uuid();
    const account = await AccountOrm.query().updateAndFetchById(accountId, {
      password: hash(`${password}${salt}`, namespaces.password),
      updated_at: raw('CURRENT_TIME()'),
    });

    await this.redis.set(`salt:${accountId}`, salt);

    return this.cleanPublicAccount(account);
  }
}

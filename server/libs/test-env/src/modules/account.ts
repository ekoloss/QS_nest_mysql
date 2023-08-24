import { v4 as uuid } from 'uuid';

import { IAccountCreateBody, IAccountResponse } from '@models';
import { AccountModule, AccountService } from '@app/account';
import { AccountOrm } from '@app/orm';

import { BaseTestEnvEntity, creator } from '../BaseTestEnvModule';

class Account extends BaseTestEnvEntity<IAccountResponse> {
  @creator()
  create(accountData: Partial<IAccountCreateBody> = {}) {
    const pass = accountData?.password || uuid();
    const data: IAccountCreateBody = {
      login: uuid(),
      password: pass,
      passwordConfirm: pass,
      ...accountData,
      role: {
        user: false,
        admin: true,
        ...accountData?.role,
      },
    };

    const accountService = this.get<AccountService>(AccountService);

    return accountService.create(data);
  }

  async deleter(accountId) {
    const accountService = this.get<AccountService>(AccountService);

    await accountService.delete(accountId);

    await AccountOrm.baseQuery().findById(accountId).hardDelete();
  }
}

export const accountTestEnv = new Account({
  name: 'account',
  module: AccountModule,
});

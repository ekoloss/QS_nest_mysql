import { v4 as uuid } from 'uuid';

import { IAccountRole } from '@models';
import { AuthModule, AuthService } from '@app/auth';
import { AccountOrm } from '@app/orm';
import { IRequestAuth } from '@app/utils';

import { BaseTestEnvModule } from '../BaseTestEnvModule';

class Auth extends BaseTestEnvModule {
  fakeTokenData(roleType: keyof IAccountRole = 'admin'): IRequestAuth {
    let role: IAccountRole;

    switch (roleType) {
      case 'admin':
        role = {
          user: false,
          admin: true,
        };
        break;

      default:
        role = {
          user: true,
          admin: false,
        };
    }

    return {
      id: uuid(),
      role,
    };
  }

  fakeToken(roleType?: keyof IAccountRole) {
    const service = this.get<AuthService>(AuthService);

    return service.signe(this.fakeTokenData(roleType));
  }

  async accountTokenById(id: number) {
    const account = await AccountOrm.query().findById(id);
    const service = this.get<AuthService>(AuthService);

    return service.signe({
      id: account.id,
      role: account.role,
    });
  }
}

export const authTestEnv = new Auth({
  name: 'auth',
  module: AuthModule,
});

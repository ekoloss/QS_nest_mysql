import { IAccountModel, IAccountRole } from '@models';
import { SoftDeleteModel } from '@app/utils';

export class AccountOrm extends SoftDeleteModel implements IAccountModel {
  readonly id!: number;
  readonly login!: string;
  readonly password!: string;
  readonly role!: IAccountRole;
  readonly is_active!: boolean;
  readonly last_login!: string;
  readonly created_at!: string;
  readonly updated_at!: string;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'number' },
        login: { type: 'string' },
        password: { type: 'string' },
        role: {
          type: 'object',
          required: ['admin', 'user'],
          properties: {
            admin: { type: 'boolean' },
            user: { type: 'boolean' },
          },
        },
        is_active: { type: 'boolean', nullable: true },
        last_login: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
    };
  }

  static tableName = 'account';

  static column = this.columnsFactory<AccountColumnType>();
}

export type AccountColumnType = keyof IAccountModel;

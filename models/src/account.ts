import { IPaginate, ISoftDeleteModel, ISort, ITimingModel } from './core';

export interface IAccountRole {
  admin: boolean;
  user: boolean;
}

export interface IAccountModel extends ISoftDeleteModel, ITimingModel {
  id: number;
  login: string;
  password: string;
  role: IAccountRole;
  last_login?: string;
}

export interface IAccountCreateBody
  extends Omit<
    IAccountModel,
    'id' | 'is_deleted' | 'last_login' | 'created_at' | 'updated_at'
  > {
  passwordConfirm: string;
}

export interface IAccountUpdateParams {
  accountId: number;
}

export type IAccountUpdateBody = Pick<IAccountModel, 'login'>;

export interface IAccountResetPasswordBody
  extends Pick<IAccountModel, 'password'> {
  passwordConfirm: string;
}

export interface IAccountGetByIdParams extends IAccountUpdateParams {}
export interface IAccountDeleteParams extends IAccountUpdateParams {}

export type accountSortFields = 'login' | 'created_at' | 'last_login';

export interface IAccountGetListQuery
  extends IPaginate,
    ISort<accountSortFields> {
  login?: string;
  start_date?: string;
  end_date?: string;
}

export interface IAccountChangePasswordBody
  extends Pick<IAccountModel, 'password'> {
  passwordConfirm: string;
  oldPassword: string;
}

export type IAccountResponse = Omit<IAccountModel, 'password' | 'is_deleted'>;

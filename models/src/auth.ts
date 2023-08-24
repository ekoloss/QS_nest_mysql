import { IAccountModel } from './account';

export type ILoginBody = Pick<IAccountModel, 'login' | 'password'>;

export interface ILoginResponse {
  token: string;
}

export interface IOTTResponse {
  ott: string;
}

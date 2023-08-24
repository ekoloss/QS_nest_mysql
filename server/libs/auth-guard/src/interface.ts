import { IAccountRole } from '@models';

export interface IAuthAccessOptions {
  role?: keyof IAccountRole | (keyof IAccountRole)[];
  mode?: 'guest' | 'authorised' | 'any';
  useOTT?: boolean;
}

export enum checkResult {
  granted,
  denied,
  continue,
}

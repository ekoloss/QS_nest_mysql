import { Request } from 'express';

import { IAccountRole } from '@models';

export interface IRequestAuth {
  id: number;
  role: IAccountRole;
}

export interface NestRequest extends Request {
  auth: IRequestAuth;
  isAuthorized: boolean;
}

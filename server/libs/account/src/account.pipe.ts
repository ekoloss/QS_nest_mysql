import {
  Injectable,
  PipeTransform,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import { IAccountGetByIdParams, IAccountResponse } from '@models';
import { NestRequest } from '@app/utils';

import { AccountService } from './account.service';
import { validation } from './validate';

@Injectable()
export class AccountResolvePipe
  implements PipeTransform<IAccountGetByIdParams, Promise<IAccountResponse>>
{
  constructor(private readonly service: AccountService) {}

  transform({ accountId }: IAccountGetByIdParams): Promise<IAccountResponse> {
    return this.service.getById(accountId);
  }
}

export const AccountResolve = createParamDecorator(
  (
    {
      idParam,
    }: {
      idParam?: string;
    } = {
      idParam: 'accountId',
    },
    context: ExecutionContext,
  ): IAccountGetByIdParams => {
    const params = context.switchToHttp().getRequest<NestRequest>()?.params;
    const accountId = +params[idParam];

    return validation.getById.param.transform({ accountId });
  },
);

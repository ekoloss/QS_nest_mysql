import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  IAccountChangePasswordBody,
  IAccountCreateBody,
  IAccountGetListQuery,
  IAccountResetPasswordBody,
  IAccountResponse,
  IAccountUpdateBody,
  IPaginateResult,
} from '@models';
import { Auth, AuthData, AuthGuard } from '@app/auth-guard';
import { apiPrefix, IRequestAuth } from '@app/utils';

import { AccountResolvePipe } from './account.pipe';
import { AccountService } from './account.service';
import { validation } from './validate';

@Controller(`${apiPrefix}/account`)
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly appService: AccountService) {}

  @Put('change-password')
  @Auth({ mode: 'authorised' })
  changePassword(
    @AuthData() auth: IRequestAuth,
    @Body(validation.changePassword.body)
    body: IAccountChangePasswordBody,
  ): Promise<IAccountResponse> {
    return this.appService.changePassword(auth, body);
  }

  @Get('self')
  @Auth({ mode: 'authorised' })
  getSelfAccount(@AuthData() { id }: IRequestAuth): Promise<IAccountResponse> {
    return this.appService.getById(id);
  }

  @Post()
  @Auth({ role: ['admin'] })
  create(
    @Body(validation.create.body) body: IAccountCreateBody,
  ): Promise<IAccountResponse> {
    return this.appService.create(body);
  }

  @Put(':accountId')
  @Auth({ role: ['admin'] })
  update(
    @Param(validation.update.param, AccountResolvePipe)
    account: IAccountResponse,
    @Body(validation.update.body) body: IAccountUpdateBody,
  ): Promise<IAccountResponse> {
    return this.appService.update(account.id, body);
  }

  @Put(':accountId/reset-password')
  @Auth({ role: ['admin'] })
  resetPassword(
    @Param(validation.resetPassword.param, AccountResolvePipe)
    account: IAccountResponse,
    @Body(validation.resetPassword.body)
    body: IAccountResetPasswordBody,
  ): Promise<IAccountResponse> {
    return this.appService.resetPassword(account.id, body);
  }

  @Delete(':accountId')
  @Auth({ role: ['admin'] })
  async delete(
    @Param(validation.delete.param, AccountResolvePipe)
    account: IAccountResponse,
  ): Promise<IAccountResponse> {
    await this.appService.delete(account.id);
    return account;
  }

  @Get('list')
  @Auth({ role: ['admin'] })
  getList(
    @Query(validation.getList.query) query: IAccountGetListQuery,
  ): Promise<IPaginateResult<IAccountResponse>> {
    return this.appService.getList(query);
  }

  @Get(':accountId')
  @Auth({ role: ['admin'] })
  getById(
    @Param(validation.getById.param, AccountResolvePipe)
    account: IAccountResponse,
  ): IAccountResponse {
    return account;
  }
}

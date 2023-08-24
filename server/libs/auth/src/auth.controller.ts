import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { ILoginBody, ILoginResponse, IOTTResponse } from '@models';
import { Auth, AuthData, AuthGuard } from '@app/auth-guard';
import { apiPrefix, IRequestAuth } from '@app/utils';

import { AuthService } from './auth.service';
import { validation } from './validate';

@Controller(apiPrefix)
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('account/ott')
  @Auth({ mode: 'authorised' })
  createOTT(@AuthData() auth: IRequestAuth): Promise<IOTTResponse> {
    return this.service.createOTT(auth);
  }

  @Post('login')
  @Auth({ mode: 'guest' })
  login(
    @Body(validation.login.body) body: ILoginBody,
  ): Promise<ILoginResponse> {
    return this.service.login(body);
  }
}

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AccountModule } from '@app/account';
import { AuthModule } from '@app/auth';
import { AuthGuardModule } from '@app/auth-guard';
import { GlobalModule } from '@app/global';

import { HttpTraceInterceptor } from './http-trace.interceptor';

@Module({
  imports: [GlobalModule, AuthGuardModule, AccountModule, AuthModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpTraceInterceptor,
    },
  ],
})
export class AppModule {}

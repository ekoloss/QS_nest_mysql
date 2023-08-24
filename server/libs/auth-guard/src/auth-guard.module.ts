import { Module } from '@nestjs/common';

import { AuthGuardCoreModule } from './auth-guard-core.module';

@Module({
  imports: [AuthGuardCoreModule],
})
export class AuthGuardModule {}

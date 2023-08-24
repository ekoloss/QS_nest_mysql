import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IRequestAuth, NestRequest } from '@app/utils';

export const AuthData = createParamDecorator<
  unknown,
  ExecutionContext,
  IRequestAuth
>((data: unknown, context: ExecutionContext) => {
  const { auth } = context.switchToHttp().getRequest<NestRequest>();

  return auth;
});

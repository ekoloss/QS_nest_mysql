import { SetMetadata, CustomDecorator } from '@nestjs/common';

import { IAuthAccessOptions } from './interface';

export const Auth = (options?: IAuthAccessOptions): CustomDecorator<string> =>
  SetMetadata('authAccess', options);

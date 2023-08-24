import * as Joi from 'joi';

import { IAccountCreateBody } from '@models';
import { passMinLength, ValidatorPipe } from '@app/utils';

export const loginSchema = () => Joi.string();

export const passwordRuleSchema = (): Joi.StringSchema =>
  Joi.string()
    .required()
    .min(passMinLength)
    .pattern(/^(?=.*\d).*$/)
    .pattern(/^(?=.*\p{Ll}).*$/u)
    .pattern(/^(?=.*\p{Lu}).*$/u)
    .pattern(/^(?=.*[\W_]).*$/)
    .messages({
      'string.pattern.base': 'password fails to match the pattern',
    });

export const validation = {
  login: {
    body: new ValidatorPipe<IAccountCreateBody>(
      Joi.object<IAccountCreateBody>({
        login: loginSchema().required(),
        password: passwordRuleSchema(),
      }).required(),
    ),
  },
};

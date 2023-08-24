import * as Joi from 'joi';

import {
  IAccountChangePasswordBody,
  IAccountCreateBody,
  IAccountDeleteParams,
  IAccountGetListQuery,
  IAccountResetPasswordBody,
  IAccountRole,
  IAccountUpdateBody,
  IAccountUpdateParams,
  accountSortFields,
  IAccountGetByIdParams,
} from '@models';
import { loginSchema, passwordRuleSchema } from '@app/auth';
import {
  defaultPagination,
  idSchema,
  paginateSchema,
  sortSchema,
  ValidatorPipe,
} from '@app/utils';

const passwordSchema = () => ({
  passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'password does not match confirmation',
  }),
  password: passwordRuleSchema(),
});

const accountIdSchema = () => ({
  accountId: idSchema().required(),
});

export const validation = {
  create: {
    body: new ValidatorPipe<IAccountCreateBody>(
      Joi.object<IAccountCreateBody>({
        role: Joi.object<IAccountRole>({
          admin: Joi.boolean().required(),
          user: Joi.boolean()
            .when('admin', {
              is: true,
              then: Joi.boolean().valid(false),
            })
            .when('admin', {
              is: false,
              then: Joi.boolean().valid(true),
            })
            .required(),
        }).required(),
        login: loginSchema().required(),
        ...passwordSchema(),
      }).required(),
    ),
  },
  getById: {
    param: new ValidatorPipe<IAccountGetByIdParams>(
      Joi.object<IAccountGetByIdParams>(accountIdSchema()).required(),
    ),
  },
  update: {
    body: new ValidatorPipe<IAccountUpdateBody>(
      Joi.object<IAccountUpdateBody>({
        login: loginSchema().required(),
      }).required(),
    ),
    param: new ValidatorPipe<IAccountUpdateParams>(
      Joi.object<IAccountUpdateParams>(accountIdSchema()).required(),
    ),
  },
  resetPassword: {
    body: new ValidatorPipe<IAccountResetPasswordBody>(
      Joi.object<IAccountResetPasswordBody>(passwordSchema()).required(),
    ),
    param: new ValidatorPipe<IAccountUpdateParams>(
      Joi.object<IAccountUpdateParams>(accountIdSchema()).required(),
    ),
  },
  changePassword: {
    body: new ValidatorPipe<IAccountChangePasswordBody>(
      Joi.object<IAccountChangePasswordBody>({
        oldPassword: passwordRuleSchema(),
        ...passwordSchema(),
      }).required(),
    ),
  },
  delete: {
    param: new ValidatorPipe<IAccountDeleteParams>(
      Joi.object<IAccountDeleteParams>(accountIdSchema()).required(),
    ),
  },
  getList: {
    query: new ValidatorPipe<IAccountGetListQuery>(
      Joi.object<IAccountGetListQuery>({
        login: loginSchema(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        ...paginateSchema(),
        ...sortSchema<accountSortFields>(['login', 'last_login', 'created_at']),
      }).default({
        ...defaultPagination(),
      }),
    ),
  },
};

import * as Joi from 'joi';

export const sortSchema = <T extends string>(
  sortBy: T[],
): {
  sort_by: Joi.StringSchema;
  sort_order: Joi.StringSchema;
} => ({
  sort_by: Joi.string().valid(...sortBy),
  sort_order: Joi.string().valid('asc', 'desc').default('asc'),
});

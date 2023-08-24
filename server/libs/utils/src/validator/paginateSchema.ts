import * as Joi from 'joi';

import { IPaginate } from '@models';
import { defaultPage, defaultPageSize } from '@app/utils';

export const paginateSchema = ({
  pageSize = defaultPageSize,
  page = defaultPage,
} = {}): {
  page: Joi.NumberSchema;
  page_size: Joi.NumberSchema;
} => ({
  page: Joi.number().integer().default(page).min(0),
  page_size: Joi.number().integer().default(pageSize).min(1),
});

export const defaultPagination = ({
  pageSize = defaultPageSize,
  page = defaultPage,
} = {}): IPaginate => ({
  page_size: pageSize,
  page,
});

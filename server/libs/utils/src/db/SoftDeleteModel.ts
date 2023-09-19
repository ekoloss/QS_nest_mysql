import {
  Page,
  TransactionOrKnex,
  Constructor,
  QueryBuilderType,
  PartialModelObject,
  raw,
  Model,
} from 'objection';

import { ISoftDeleteModel } from '@models';

import { BaseModel, BaseQueryBuilder } from './BaseModel';

export class SoftDeleteModel extends BaseModel implements ISoftDeleteModel {
  readonly is_active!: boolean;
  readonly updated_at!: string;

  QueryBuilderType!: SoftDeleteQueryBuilder<this>;

  static get QueryBuilder() {
    return SoftDeleteQueryBuilder;
  }

  static query<M extends Model>(
    this: Constructor<M, any[]>,
    trxOrKnex?: TransactionOrKnex,
  ): QueryBuilderType<M> {
    const query = super.query(trxOrKnex) as SoftDeleteQueryBuilder<BaseModel>;

    return query.isNotDeleted() as any;
  }
}

class SoftDeleteQueryBuilder<M extends Model, Q = M[]> extends BaseQueryBuilder<
  M,
  Q
> {
  ArrayQueryBuilderType!: SoftDeleteQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: SoftDeleteQueryBuilder<M, M>;
  MaybeSingleQueryBuilderType!: SoftDeleteQueryBuilder<M, M | undefined>;
  NumberQueryBuilderType!: SoftDeleteQueryBuilder<M, number>;
  PageQueryBuilderType!: SoftDeleteQueryBuilder<M, Page<M>>;

  delete() {
    return this.update({
      is_active: null,
      updated_at: raw('CURRENT_TIME()'),
    } as PartialModelObject<BaseModel>);
  }

  hardDelete() {
    return super.delete();
  }

  unDelete() {
    return this.update({
      is_active: true,
      updated_at: raw('CURRENT_TIME()'),
    } as PartialModelObject<BaseModel>);
  }

  isDeleted() {
    return this.whereNot(`${this.modelClass().tableName}.is_active`, true);
  }

  isNotDeleted() {
    return this.where(`${this.modelClass().tableName}.is_active`, true);
  }
}

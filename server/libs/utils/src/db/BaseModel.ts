import {
  Constructor,
  Model,
  ModelClass,
  TransactionOrKnex,
  QueryBuilderType,
  QueryBuilder,
  Page,
  PartialModelObject,
  SingleQueryBuilder,
} from 'objection';

export interface IColumnsData {
  withTableName?: boolean;
}

export class BaseModel extends Model {
  QueryBuilderType!: BaseQueryBuilder<this>;

  static get QueryBuilder() {
    return BaseQueryBuilder;
  }

  static columnsFactory<T extends string>(): (
    name: T,
    options?: IColumnsData,
  ) => string {
    return function (
      n: T,
      { withTableName = true }: IColumnsData = {
        withTableName: true,
      },
    ): string {
      if (withTableName) {
        return `${this.tableName}.${n}`;
      }

      return n;
    };
  }

  static relationFactory =
    <T extends string>(): ((name: T) => T) =>
    (n: T) =>
      n;

  static isUniqueViolationError(err: unknown): boolean {
    return (
      (err as any)?.nativeError?.errno === 1062 ||
      (err as any)?.nativeError?.code == 'ER_DUP_ENTRY'
    );
  }

  static baseQuery<M extends BaseModel>(
    this: Constructor<M, any[]>,
    trxOrKnex?: TransactionOrKnex,
  ): QueryBuilderType<M> {
    return super.query(trxOrKnex) as QueryBuilderType<M>;
  }
}

export interface SafeInsertResult<T> {
  data: T;
  isExist: boolean;
}

export class BaseQueryBuilder<M extends Model, Q = M[]> extends QueryBuilder<
  M,
  Q
> {
  ArrayQueryBuilderType!: BaseQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: BaseQueryBuilder<M, M>;
  MaybeSingleQueryBuilderType!: BaseQueryBuilder<M, M | undefined>;
  NumberQueryBuilderType!: BaseQueryBuilder<M, number>;
  PageQueryBuilderType!: BaseQueryBuilder<M, Page<M>>;

  cleanInsert(obj: PartialModelObject<M>): SingleQueryBuilder<this> {
    return this.insert(this.cleanData(obj));
  }

  cleanInsertAndFetch(obj: PartialModelObject<M>): SingleQueryBuilder<this> {
    return this.insertAndFetch(this.cleanData(obj));
  }

  async insertOrGetOnConflict(
    obj: PartialModelObject<M>,
    onConflict: (builder: this) => Promise<M> | SingleQueryBuilder<this>,
  ): Promise<SafeInsertResult<M>> {
    const result = await this.clone()
      .insert(this.cleanData(obj))
      .toKnexQuery()
      .onConflict()
      .ignore()
      .returning('*');

    if (result[0]) {
      return {
        isExist: false,
        data: result[0] as M,
      };
    }

    return {
      isExist: true,
      data: await onConflict(this),
    };
  }

  cleanData(obj: PartialModelObject<M>): PartialModelObject<M> {
    return Object.keys(obj).reduce((all, key) => {
      if (obj[key] !== undefined) {
        all[key] = obj[key];
      }

      return all;
    }, {});
  }
}

export type BaseModelClass = ModelClass<BaseModel> & {
  isUniqueViolationError: (err: unknown) => boolean;
};

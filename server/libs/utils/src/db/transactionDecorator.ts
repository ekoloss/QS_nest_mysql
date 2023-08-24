import { BaseModel, BaseModelClass } from './';

export const Transaction = (
  {
    model = BaseModel,
    onRollback,
  }: {
    model?: BaseModelClass;
    onRollback?: (err: any) => void;
  } = {
    model: BaseModel,
  },
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      const trx = await model.startTransaction();

      try {
        const res = await original.call(this, ...args, trx);

        await trx.commit();

        return res;
      } catch (err) {
        await trx.rollback();
        onRollback && onRollback(err);

        throw err;
      }
    };
  };
};

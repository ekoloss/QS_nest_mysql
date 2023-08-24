import { TestEnv } from './testEnv';
import { ModuleType, registerModule } from './testEnvRegistry';

export class BaseTestEnvModule {
  protected testEnv: TestEnv;
  protected name: string;

  constructor({
    name,
    module,
    deps = [],
  }: {
    name: string;
    module: ModuleType;
    deps?: string[];
  }) {
    this.name = name;
    registerModule({ name, module, deps, env: this });
  }

  init(testEnv: TestEnv) {
    this.testEnv = testEnv;
  }

  protected get<T>(injectable) {
    if (!this.testEnv?.moduleRef?.get) {
      throw new Error(`Module '${this.name}' was not registered in TestEnv`);
    }

    const injectableItem = this.testEnv.moduleRef.get<T>(injectable);

    if (!injectableItem) {
      throw new Error(`Module '${this.name}' was not able to get item`);
    }

    return injectableItem;
  }
}

export class BaseTestEnvEntity<T> extends BaseTestEnvModule {
  private testList: Record<string, T> = {};

  addToTestList(key, data: T) {
    this.testList[key] = data;
  }

  deleter(key: string, data: T) {
    throw new Error('The `deleter` method needs to be reassigned');
  }

  async destroyTestEnv() {
    const keys = Object.keys(this.testList);

    if (!keys.length) {
      return;
    }

    await Promise.all(keys.map((key) => this.deleter(key, keys[key])));
  }
}

export const creator = (
  { idProp = 'id' }: { idProp: string } = { idProp: 'id' },
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      const res = await original.call(this, ...args);

      target.addToTestList.call(this, res[idProp], res);

      return res;
    };
  };
};

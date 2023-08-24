import { DynamicModule, ForwardReference, Type } from '@nestjs/common';

import { BaseTestEnvModule } from './BaseTestEnvModule';

export type ModuleType =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference;

interface ITestEnvImportModules {
  module: ModuleType;
  deps: string[];
}

export const moduleRegister: Record<string, ITestEnvImportModules> = {};
export const envRegister: Record<string, BaseTestEnvModule> = {};

export const registerModule = ({
  name,
  module,
  env,
  deps = [],
}: {
  name: string;
  module: ModuleType;
  env: BaseTestEnvModule;
  deps?: string[];
}) => {
  if (moduleRegister[name]) {
    throw new Error(
      `Attempting to re-register the '${name}' module in TestEnv`,
    );
  }

  envRegister[name] = env;

  moduleRegister[name] = {
    module,
    deps: deps ? deps : [],
  };
};

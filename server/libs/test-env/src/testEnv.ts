import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as request from 'supertest';
dotenv.config({ path: '.env.test' });

import { AuthGuardModule } from '@app/auth-guard';
import { GlobalModule } from '@app/global';
import { logger } from '@app/logger';

import { accountTestEnv } from './modules';
import { envRegister, moduleRegister, ModuleType } from './testEnvRegistry';

export const createTestEnv = async (modules: string[]): Promise<TestEnv> => {
  const env = new TestEnv(modules);
  await env.init();

  return env;
};

export class TestEnv {
  moduleRef: TestingModule;
  private nestApp: INestApplication;

  constructor(private modules: string[] = []) {}

  get request() {
    return request(this.nestApp.getHttpServer());
  }

  get(name) {
    if (!moduleRegister[name]) {
      throw new Error(`Module '${name}' was not registered in TestEnv`);
    }

    return envRegister[name];
  }

  async init(): Promise<void> {
    this.moduleRef = await Test.createTestingModule({
      imports: [AuthGuardModule, GlobalModule, ...this.getFullModuleList()],
    }).compile();

    this.nestApp = this.moduleRef.createNestApplication();
    this.nestApp.useLogger(logger);

    this.nestApp.init();
  }

  private getFullModuleList(): ModuleType[] {
    const modules: ModuleType[] = [];
    let tempList = [...this.modules, 'auth'];
    const mask: Record<string, boolean> = {};

    while (tempList.length) {
      const name = tempList.pop();

      if (!moduleRegister[name]) {
        throw new Error(`Module '${name}' was not registered in TestEnv`);
      }

      mask[name] = true;

      tempList = [...tempList, ...moduleRegister[name].deps];
    }

    Object.keys(mask).map((name) => {
      envRegister[name].init(this);

      modules.push(moduleRegister[name].module);
    });

    return modules;
  }

  async end() {
    await accountTestEnv.destroyTestEnv();
    await this.nestApp.close();
  }
}

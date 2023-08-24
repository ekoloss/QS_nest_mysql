import { v4 as uuid } from 'uuid';

import { IAccountCreateBody, ILoginBody } from '@models';
import { createTestEnv, TestEnv, accountTestEnv } from '@app/test-env';
import { apiPrefix } from '@app/utils';

describe('auth', () => {
  let testEnv: TestEnv;
  let accountToken: string;
  const testData: Partial<IAccountCreateBody> = {
    login: 'test_account2' + uuid(),
    password: 'Test_account@_2',
  };

  beforeAll(async () => {
    testEnv = await createTestEnv(['account']);
    await accountTestEnv.create(testData);
  });

  describe('POST login', () => {
    it('success', () => {
      return testEnv.request
        .post(`${apiPrefix}/login`)
        .send({
          login: testData.login,
          password: testData.password,
        } as ILoginBody)
        .expect(201)
        .expect(({ body }) => {
          accountToken = body.token;

          expect(Object.keys(body)).toEqual(expect.arrayContaining(['token']));
        });
    });

    it('not found', () => {
      return testEnv.request
        .post(`${apiPrefix}/login`)
        .send({
          login: 'login',
          password: testData.password,
        } as ILoginBody)
        .expect(400);
    });

    it('bad request', () => {
      return testEnv.request
        .post(`${apiPrefix}/login`)
        .send({
          login: testData.login,
          password: 'password',
        } as ILoginBody)
        .expect(400);
    });
  });

  describe('POST account/ott', () => {
    it('success', () => {
      return testEnv.request
        .post(`${apiPrefix}/account/ott`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(typeof body?.ott).toBe('string');
        });
    });

    it('unauthorized', () => {
      return testEnv.request.post(`${apiPrefix}/account/ott`).expect(403);
    });
  });

  afterAll(async () => {
    await testEnv.end();
  });
});

import { v4 as uuid } from 'uuid';

import {
  IAccountChangePasswordBody,
  IAccountCreateBody,
  IAccountResetPasswordBody,
  IAccountResponse,
  IAccountUpdateBody,
} from '@models';
import { AccountOrm } from '@app/orm';
import { createTestEnv, TestEnv, authTestEnv } from '@app/test-env';
import { apiPrefix } from '@app/utils';

describe('account', () => {
  let testEnv: TestEnv;
  let fakeToken: string;
  let accountToken: string;
  let account: IAccountResponse;
  const testData: IAccountCreateBody = {
    login: uuid(),
    role: {
      admin: false,
      user: true,
    },
    password: 'Test_account@_1',
    passwordConfirm: 'Test_account@_1',
  };

  const testAccountResponseStructure = (body) => {
    expect(Object.keys(body)).toEqual(
      expect.arrayContaining([
        'login',
        'role',
        'id',
        'created_at',
        'updated_at',
        'last_login',
      ]),
    );
  };

  const testAccountResponse = (body) => {
    testAccountResponseStructure(body);
    expect(body).toMatchObject(account);
  };

  beforeAll(async () => {
    testEnv = await createTestEnv(['account']);
    fakeToken = authTestEnv.fakeToken();
  });

  describe('POST account', () => {
    it('success', () => {
      return testEnv.request
        .post(`${apiPrefix}/account`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send(testData)
        .expect(201)
        .expect(({ body }) => {
          account = body;

          expect(body).toMatchObject({
            login: testData.login,
            role: testData.role,
          });

          expect(Object.keys(body)).toEqual(
            expect.arrayContaining([
              'login',
              'role',
              'id',
              'created_at',
              'updated_at',
              'last_login',
            ]),
          );
        });
    });

    it('conflict', () => {
      return testEnv.request
        .post(`${apiPrefix}/account`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send(testData)
        .expect(409);
    });

    it('unauthorized', () => {
      return testEnv.request.post(`${apiPrefix}/account`).expect(403);
    });
  });

  describe('GET account/self', () => {
    beforeAll(async () => {
      accountToken = await authTestEnv.accountTokenById(account.id);
    });

    it('success', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/self`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .expect(200)
        .expect(({ body }) => {
          account.updated_at = body.updated_at;
          account.last_login = body.last_login;

          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/self`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(404);
    });

    it('unauthorized', () => {
      return testEnv.request.get(`${apiPrefix}/account/self`).expect(403);
    });
  });

  describe('PUT account/change-password', () => {
    it('success', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/change-password`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
          oldPassword: testData.password,
        } as IAccountChangePasswordBody)
        .expect(200)
        .expect(({ body }) => {
          account.updated_at = body.updated_at;

          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/change-password`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
          oldPassword: testData.password,
        } as IAccountChangePasswordBody)
        .expect(404);
    });

    it('bad request', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/change-password`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
          oldPassword: 'password',
        } as IAccountChangePasswordBody)
        .expect(400);
    });

    it('unauthorized', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/change-password`)
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
          oldPassword: testData.password,
        } as IAccountChangePasswordBody)
        .expect(403);
    });
  });

  describe('PUT account/:id', () => {
    it('success', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          login: 'test_account1',
        } as IAccountUpdateBody)
        .expect(200)
        .expect(({ body }) => {
          account.updated_at = body.updated_at;
          account.login = 'test_account1';

          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/0`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          login: 'test_account1',
        } as IAccountUpdateBody)
        .expect(404);
    });

    it('forbidden', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .send({
          login: 'test_account1',
        } as IAccountUpdateBody)
        .expect(403);
    });

    it('unauthorized', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}`)
        .send({
          login: 'test_account1',
        } as IAccountUpdateBody)
        .expect(403);
    });
  });

  describe('PUT account/:id/reset-password', () => {
    it('success', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}/reset-password`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
        } as IAccountResetPasswordBody)
        .expect(200)
        .expect(({ body }) => {
          account.updated_at = body.updated_at;

          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/0/reset-password`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
        } as IAccountResetPasswordBody)
        .expect(404);
    });

    it('bad request', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}/reset-password`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_1',
        } as IAccountResetPasswordBody)
        .expect(400);
    });

    it('forbidden', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}/reset-password`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
        } as IAccountResetPasswordBody)
        .expect(403);
    });

    it('unauthorized', () => {
      return testEnv.request
        .put(`${apiPrefix}/account/${account.id}/reset-password`)
        .send({
          password: 'Test_account@_2',
          passwordConfirm: 'Test_account@_2',
        } as IAccountResetPasswordBody)
        .expect(403);
    });
  });

  describe('GET account/:id', () => {
    it('success', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/${account.id}`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(200)
        .expect(({ body }) => {
          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/0`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(404);
    });

    it('forbidden', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/${uuid()}`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .expect(403);
    });

    it('unauthorized', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/${account.id}`)
        .expect(403);
    });
  });

  describe('GET account/list', () => {
    it('success', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/list`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).not.toBe(0);
          expect(body.results.length).not.toBe(0);
          testAccountResponseStructure(body.results[0]);
        });
    });

    it('forbidden', () => {
      return testEnv.request
        .get(`${apiPrefix}/account/list`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .expect(403);
    });

    it('unauthorized', () => {
      return testEnv.request.get(`${apiPrefix}/account/list`).expect(403);
    });
  });

  describe('DELETE account/:id', () => {
    it('success', () => {
      return testEnv.request
        .delete(`${apiPrefix}/account/${account.id}`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(200)
        .expect(({ body }) => {
          account.updated_at = body.updated_at;

          testAccountResponse(body);
        });
    });

    it('not found', () => {
      return testEnv.request
        .delete(`${apiPrefix}/account/0`)
        .set({
          Authorization: `Bearer ${fakeToken}`,
        })
        .expect(404);
    });

    it('forbidden', () => {
      return testEnv.request
        .delete(`${apiPrefix}/account/${account.id}`)
        .set({
          Authorization: `Bearer ${accountToken}`,
        })
        .expect(403);
    });

    it('unauthorized', () => {
      return testEnv.request
        .delete(`${apiPrefix}/account/${account.id}`)
        .expect(403);
    });
  });

  afterAll(async () => {
    await AccountOrm.baseQuery().findById(account.id).hardDelete();
    await testEnv.end();
  });
});

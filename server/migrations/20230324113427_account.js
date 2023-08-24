// eslint-disable-next-line @typescript-eslint/no-var-requires
const Redis = require('ioredis');

exports.up = async function (knex) {
  await Promise.all([
    knex.schema.createTable('account', (table) => {
      table.increments('id').primary().unique();

      table.string('login').unique().notNullable();
      table.string('password').notNullable();
      table.jsonb('role').notNullable();
      table.boolean('is_deleted').defaultTo(false).notNullable();
      table.timestamp('last_login', { useTz: false });
      table
        .timestamp('created_at', { useTz: false })
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        .notNullable();
      table
        .timestamp('updated_at', { useTz: false })
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        .notNullable();

      table.index(['is_deleted', 'login']);
    }),
  ]);

  const [id] = await knex('account').insert({
    login: 'superAdmin',
    password: '266e7081-1f47-56de-8504-f3ba92474195',
    role: {
      admin: true,
      user: false,
    },
  });

  const redis = new Redis(+process.env.REDIS_PORT, process.env.REDIS_HOST);

  await redis.set(`salt:${id}`, '0ea7d323-f762-4c87-a93e-eccef4adacbe');
};

exports.down = async function (knex) {
  await knex.schema.dropTable('account');

  const redis = new Redis(+process.env.REDIS_PORT, process.env.REDIS_HOST);
  const keyList = await redis.keys('salt:*');
  if (keyList.length) {
    await redis.del(...keyList);
  }
};

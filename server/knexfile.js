// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      password: process.env.MYSQL_PASSWORD,
      user: process.env.MYSQL_USER,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

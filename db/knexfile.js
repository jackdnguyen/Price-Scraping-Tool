
module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'pricescraper',
      user:     'postgres',
      password: 'cmpt276'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

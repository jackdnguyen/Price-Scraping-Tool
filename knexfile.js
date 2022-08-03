const tempEnv = require("dotenv").config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,

    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './seeds/dev',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,

    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './seeds/production'
    },
  },

};

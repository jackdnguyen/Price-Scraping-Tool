// Update with your config settings.
const tempEnv = require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  }
};

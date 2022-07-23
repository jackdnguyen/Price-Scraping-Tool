const environment = 'development';    // if something else isn't setting ENV, use development
const config = require('./knexfile.js')[environment];    // require environment's settings from knexfile
module.exports = require('knex')(config);


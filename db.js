const { Pool } = require('pg');
require('dotenv').config(); // This loads our secret .env file

// We create a new 'Pool'. Think of this as a pool of available connections 
// our app can use to quickly talk to the database.
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports = pool; // We export this so server.js can use it later
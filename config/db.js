const mysql = require("mysql2/promise");
// loads a special version of mysql2 where functions return Promises instead of using callbacks.
// because it allows us to use async/await.

// Create the connection pool.
// A pool is a group of reusable database connections.

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 2,
    maxIdle: 2,
    idleTimeout: 60000
});
// uses the data from .env that was stored into process.env
// using require("dotenv").config(); 

module.exports = pool;

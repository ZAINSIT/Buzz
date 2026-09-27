const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5433,
  user: "buzz",
  password: "localpassword",
  database: "buzz_dev"
});

module.exports = pool;

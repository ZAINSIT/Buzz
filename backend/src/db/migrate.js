const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Starting migration...');

const client = new Client({
  host: '127.0.0.1',
  port: 5433,
  user: 'buzz',
  password: 'localpassword',
  database: 'buzz_dev'
});

async function migrate() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    const sqlPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    console.log('Reading SQL file from:', sqlPath);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('SQL file read successfully');

    await client.query(sql);
    console.log('Migration successful — all tables created');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

migrate();

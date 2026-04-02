const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => console.error('DB pool error:', err))
module.exports = pool

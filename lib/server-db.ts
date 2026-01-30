import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '192.168.0.76',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cekresi_satwa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_postgres_password',
  ssl: false
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  end: () => pool.end()
}

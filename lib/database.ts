import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '192.168.0.76',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cekresi_satwa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_postgres_password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  end: () => pool.end()
}

// Database types
export type Database = {
  users: {
    id: string
    username: string
    password: string
    role: 'admin' | 'user'
    created_at: string
    updated_at: string
  }
  satwa: {
    id: string
    kode_resi: string
    nama: string
    spesies: string
    asal: string
    tujuan: string
    status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED'
    created_at: string
    updated_at: string
  }
  progress: {
    id: string
    satwa_id: string
    status: string
    lokasi: string
    keterangan: string | null
    tanggal: string
    created_at: string
  }
  dokumen: {
    id: string
    satwa_id: string
    nama: string
    file_url: string
    uploaded_at: string
  }
}

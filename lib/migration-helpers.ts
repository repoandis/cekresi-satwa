import { db } from './database'

// User functions
export const users = {
  findByUsername: async (username: string) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username])
    return result.rows[0]
  },
  
  create: async (userData: { username: string; password: string; role?: string }) => {
    const result = await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [userData.username, userData.password, userData.role || 'user']
    )
    return result.rows[0]
  },
  
  findAll: async () => {
    const result = await db.query('SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC')
    return result.rows
  }
}

// Satwa functions
export const satwa = {
  findByKodeResi: async (kode_resi: string) => {
    const result = await db.query('SELECT * FROM satwa WHERE kode_resi = $1', [kode_resi])
    return result.rows[0]
  },
  
  create: async (satwaData: any) => {
    const { kode_resi, nama, spesies, asal, tujuan, status = 'PENDING' } = satwaData
    const result = await db.query(
      'INSERT INTO satwa (kode_resi, nama, spesies, asal, tujuan, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [kode_resi, nama, spesies, asal, tujuan, status]
    )
    return result.rows[0]
  },
  
  findAll: async () => {
    const result = await db.query('SELECT * FROM satwa ORDER BY created_at DESC')
    return result.rows
  },
  
  updateStatus: async (id: string, status: string) => {
    const result = await db.query(
      'UPDATE satwa SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    )
    return result.rows[0]
  }
}

// Progress functions
export const progress = {
  findBySatwaId: async (satwa_id: string) => {
    const result = await db.query('SELECT * FROM progress WHERE satwa_id = $1 ORDER BY tanggal DESC', [satwa_id])
    return result.rows
  },
  
  create: async (progressData: any) => {
    const { satwa_id, status, lokasi, keterangan, tanggal } = progressData
    const result = await db.query(
      'INSERT INTO progress (satwa_id, status, lokasi, keterangan, tanggal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [satwa_id, status, lokasi, keterangan, tanggal]
    )
    return result.rows[0]
  }
}

// Dokumen functions
export const dokumen = {
  findBySatwaId: async (satwa_id: string) => {
    const result = await db.query('SELECT * FROM dokumen WHERE satwa_id = $1 ORDER BY uploaded_at DESC', [satwa_id])
    return result.rows
  },
  
  create: async (dokumenData: any) => {
    const { satwa_id, nama, file_url } = dokumenData
    const result = await db.query(
      'INSERT INTO dokumen (satwa_id, nama, file_url) VALUES ($1, $2, $3) RETURNING *',
      [satwa_id, nama, file_url]
    )
    return result.rows[0]
  }
}

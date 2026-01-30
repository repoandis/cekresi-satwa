#!/bin/bash

# Configuration Update Script: Replace Supabase with PostgreSQL + MinIO
# This script updates your Next.js application configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="cekresi_satwa"
DB_USER="postgres"
DB_PASSWORD="your_postgres_password"

MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_BUCKET="cekresi-files"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"

# Backup original files
backup_files() {
    log "Creating backup of original files..."
    
    if [ -f "lib/supabase.ts" ]; then
        cp lib/supabase.ts lib/supabase.ts.backup
        log "Backed up lib/supabase.ts"
    fi
    
    if [ -f ".env.local" ]; then
        cp .env.local .env.local.backup
        log "Backed up .env.local"
    fi
    
    if [ -f ".env" ]; then
        cp .env .env.backup
        log "Backed up .env"
    fi
}

# Create new database client
create_database_client() {
    log "Creating new PostgreSQL database client..."
    
    cat > lib/database.ts << 'EOF'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cekresi_satwa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
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
EOF

    log "Created lib/database.ts"
}

# Create MinIO client
create_storage_client() {
    log "Creating MinIO storage client..."
    
    cat > lib/storage.ts << 'EOF'
import { Client } from 'minio'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
})

export const storage = {
  uploadFile: async (bucket: string, objectName: string, buffer: Buffer, metaData?: any) => {
    return await minioClient.putObject(bucket, objectName, buffer, metaData)
  },
  
  getFile: async (bucket: string, objectName: string) => {
    return await minioClient.getObject(bucket, objectName)
  },
  
  getFileUrl: (bucket: string, objectName: string) => {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
    const port = process.env.MINIO_PORT || '9000'
    return `http://${endpoint}:${port}/${bucket}/${objectName}`
  },
  
  deleteFile: async (bucket: string, objectName: string) => {
    return await minioClient.removeObject(bucket, objectName)
  },
  
  listFiles: async (bucket: string, prefix?: string) => {
    const stream = minioClient.listObjects(bucket, prefix, true)
    const files = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj))
      stream.on('error', reject)
      stream.on('end', () => resolve(files))
    })
  }
}

export default minioClient
EOF

    log "Created lib/storage.ts"
}

# Update package.json dependencies
update_dependencies() {
    log "Updating package.json dependencies..."
    
    # Add new dependencies
    npm install pg @types/pg minio
    
    log "Added pg, @types/pg, and minio packages"
    
    # Remove Supabase dependencies (optional)
    read -p "Do you want to remove Supabase dependencies? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared
        log "Removed Supabase dependencies"
    fi
}

# Create environment configuration
create_env_file() {
    log "Creating environment configuration..."
    
    cat > .env.local << EOF
# Database Configuration
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# MinIO Configuration
MINIO_ENDPOINT=${MINIO_ENDPOINT}
MINIO_PORT=${MINIO_PORT}
MINIO_BUCKET=${MINIO_BUCKET}
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

    log "Created .env.local"
}

# Create migration helper functions
create_migration_helpers() {
    log "Creating migration helper functions..."
    
    cat > lib/migration-helpers.ts << 'EOF'
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
EOF

    log "Created lib/migration-helpers.ts"
}

# Create example API routes
create_api_examples() {
    log "Creating example API routes..."
    
    mkdir -p pages/api/auth
    mkdir -p pages/api/satwa
    mkdir -p pages/api/upload
    
    # Auth API example
    cat > pages/api/auth/login.ts << 'EOF'
import { users } from '../../../lib/migration-helpers'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body
    
    const user = await users.findByUsername(username)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // In production, use proper session management
    res.status(200).json({ 
      id: user.id,
      username: user.username,
      role: user.role 
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
EOF

    # Satwa API example
    cat > pages/api/satwa/index.ts << 'EOF'
import { satwa } from '../../../lib/migration-helpers'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const data = await satwa.findAll()
      res.status(200).json(data)
    } else if (req.method === 'POST') {
      const data = await satwa.create(req.body)
      res.status(201).json(data)
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
EOF

    log "Created example API routes"
}

# Main execution
main() {
    log "Starting configuration update..."
    
    backup_files
    
    read -p "Do you want to create new database client? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_database_client
    fi
    
    read -p "Do you want to create MinIO storage client? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_storage_client
    fi
    
    read -p "Do you want to update dependencies? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        update_dependencies
    fi
    
    read -p "Do you want to create environment file? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_env_file
    fi
    
    read -p "Do you want to create migration helpers? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_migration_helpers
    fi
    
    read -p "Do you want to create example API routes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_api_examples
    fi
    
    log "Configuration update completed!"
    log "Next steps:"
    echo "1. Update your components to use the new database/storage clients"
    echo "2. Test all API endpoints"
    echo "3. Update authentication logic"
    echo "4. Test file upload/download functionality"
    echo ""
    echo "Backup files created with .backup extension"
    echo "Review and update the configuration as needed"
}

# Run main function
main "$@"

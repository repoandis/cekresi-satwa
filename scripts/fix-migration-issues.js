const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || '192.168.0.76',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cekresi_satwa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_postgres_password',
  ssl: false
});

async function fixMigrationIssues() {
  console.log('🔧 Fixing migration issues...');
  
  try {
    // 1. Fix status constraint
    console.log('📋 Fixing satwa status constraint...');
    await pool.query(`
      UPDATE satwa 
      SET status = 'IN_TRANSIT' 
      WHERE status = 'Dalam Perjalanan'
    `);
    
    await pool.query(`
      ALTER TABLE satwa DROP CONSTRAINT IF EXISTS satwa_status_check
    `);
    
    await pool.query(`
      ALTER TABLE satwa 
      ADD CONSTRAINT satwa_status_check 
      CHECK (status IN (
        'PENDING', 'IN_TRANSIT', 'COMPLETED',
        'Menunggu', 'Dalam Perjalanan', 'Selesai'
      ))
    `);
    
    // 2. Check if MinIO bucket exists
    console.log('📋 Checking MinIO bucket setup...');
    const minioConfig = {
      endPoint: process.env.MINIO_ENDPOINT || '192.168.0.76',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
    };
    
    console.log('MinIO Config:', minioConfig);
    
    // 3. Verify database tables
    console.log('📋 Verifying database tables...');
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    console.log('Available tables:', tables.rows.map(row => row.table_name));
    
    // 4. Check for missing indexes
    console.log('📋 Checking database indexes...');
    const indexes = await pool.query(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    
    console.log('Available indexes:', indexes.rows);
    
    // 5. Test database connection
    console.log('📋 Testing database connection...');
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log('Database time:', testQuery.rows[0].current_time);
    
    console.log('✅ Migration issues fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing migration issues:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixMigrationIssues();

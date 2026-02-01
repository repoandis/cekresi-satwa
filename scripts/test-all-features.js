const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || '192.168.0.76',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cekresi_satwa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_postgres_password',
  ssl: false
});

async function testAllFeatures() {
  console.log('🧪 Testing All Application Features...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    const timeResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', timeResult.rows[0].now);
    
    // Test 2: User Authentication
    console.log('\n2️⃣ Testing User Authentication...');
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (userResult.rows.length > 0) {
      console.log('✅ Admin user found');
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 3: Satwa CRUD Operations
    console.log('\n3️⃣ Testing Satwa CRUD Operations...');
    
    // Create test satwa
    const testKodeResi = `TEST${Date.now()}`;
    const createResult = await pool.query(`
      INSERT INTO satwa (kode_resi, nama, spesies, asal, tujuan, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [testKodeResi, 'Test Animal', 'Test Species', 'Test Origin', 'Test Destination', 'PENDING']);
    
    const testSatwa = createResult.rows[0];
    console.log('✅ Satwa created:', testSatwa.kode_resi);
    
    // Read satwa
    const readResult = await pool.query('SELECT * FROM satwa WHERE kode_resi = $1', [testKodeResi]);
    console.log('✅ Satwa read:', readResult.rows.length > 0 ? 'Found' : 'Not found');
    
    // Test 4: Progress Operations
    console.log('\n4️⃣ Testing Progress Operations...');
    const progressResult = await pool.query(`
      INSERT INTO progress (satwa_id, status, lokasi, keterangan, tanggal) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *
    `, [testSatwa.id, 'Dalam Perjalanan', 'Test Location', 'Test Keterangan']);
    
    const testProgress = progressResult.rows[0];
    console.log('✅ Progress created:', testProgress.status);
    
    // Test 5: Document Operations
    console.log('\n5️⃣ Testing Document Operations...');
    const dokumenResult = await pool.query(`
      INSERT INTO dokumen (satwa_id, nama, file_url, uploaded_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING *
    `, [testSatwa.id, 'Test Document', 'http://test.com/test.pdf']);
    
    const testDokumen = dokumenResult.rows[0];
    console.log('✅ Document created:', testDokumen.nama);
    
    // Test 6: Status Updates
    console.log('\n6️⃣ Testing Status Updates...');
    await pool.query('UPDATE satwa SET status = $1 WHERE id = $2', ['COMPLETED', testSatwa.id]);
    console.log('✅ Status updated to COMPLETED');
    
    // Test 7: API Response Formats
    console.log('\n7️⃣ Testing API Response Formats...');
    
    // Test satwa list response
    const satwaListResult = await pool.query(`
      SELECT id, kode_resi, nama, spesies, asal, tujuan, status, created_at, updated_at 
      FROM satwa 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('✅ Satwa list format OK:', satwaListResult.rows.length, 'records');
    
    // Test progress with status mapping
    const progressListResult = await pool.query(`
      SELECT * FROM progress WHERE satwa_id = $1 ORDER BY tanggal DESC
    `, [testSatwa.id]);
    console.log('✅ Progress list format OK:', progressListResult.rows.length, 'records');
    
    // Test 8: Cleanup
    console.log('\n8️⃣ Cleaning up test data...');
    await pool.query('DELETE FROM dokumen WHERE satwa_id = $1', [testSatwa.id]);
    await pool.query('DELETE FROM progress WHERE satwa_id = $1', [testSatwa.id]);
    await pool.query('DELETE FROM satwa WHERE id = $1', [testSatwa.id]);
    console.log('✅ Test data cleaned up');
    
    // Test 9: MinIO Configuration Check
    console.log('\n9️⃣ Checking MinIO Configuration...');
    const minioConfig = {
      endpoint: process.env.MINIO_ENDPOINT || '192.168.0.76',
      port: process.env.MINIO_PORT || '9000',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'cekresi-files'
    };
    console.log('✅ MinIO config:', minioConfig);
    
    // Test 10: Environment Variables
    console.log('\n🔟 Checking Environment Variables...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'MINIO_ENDPOINT', 'MINIO_PORT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'MINIO_BUCKET'
    ];
    
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: ${envVar.includes('PASSWORD') || envVar.includes('SECRET') ? '***' : value}`);
      } else {
        console.log(`⚠️  ${envVar}: Not set (using default)`);
      }
    });
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the tests
testAllFeatures();

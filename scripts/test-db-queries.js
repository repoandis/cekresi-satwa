const { Pool } = require('pg');

// Test database queries directly
async function testDatabaseQueries() {
  console.log('🚀 Testing database queries directly...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || '192.168.0.76',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cekresi_satwa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_postgres_password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    
    console.log('🔍 Testing table structures...');
    
    // Test users table
    console.log('\n📋 Users table:');
    const usersSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    usersSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Test satwa table
    console.log('\n📋 Satwa table:');
    const satwaSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'satwa' 
      ORDER BY ordinal_position
    `);
    satwaSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Test progress table
    console.log('\n📋 Progress table:');
    const progressSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'progress' 
      ORDER BY ordinal_position
    `);
    progressSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Test dokumen table
    console.log('\n📋 Dokumen table:');
    const dokumenSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'dokumen' 
      ORDER BY ordinal_position
    `);
    dokumenSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    console.log('\n🧪 Testing sample queries...');
    
    // Test count queries
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users count: ${userCount.rows[0].count}`);
    
    const satwaCount = await client.query('SELECT COUNT(*) as count FROM satwa');
    console.log(`🦊 Satwa count: ${satwaCount.rows[0].count}`);
    
    const progressCount = await client.query('SELECT COUNT(*) as count FROM progress');
    console.log(`📊 Progress count: ${progressCount.rows[0].count}`);
    
    const dokumenCount = await client.query('SELECT COUNT(*) as count FROM dokumen');
    console.log(`📁 Dokumen count: ${dokumenCount.rows[0].count}`);
    
    // Test sample data if exists
    if (parseInt(satwaCount.rows[0].count) > 0) {
      console.log('\n📋 Sample satwa data:');
      const sampleSatwa = await client.query('SELECT id, kode_resi, nama, spesies, status FROM satwa LIMIT 3');
      sampleSatwa.rows.forEach(row => {
        console.log(`  - ${row.kode_resi}: ${row.nama} (${row.spesies}) - ${row.status}`);
      });
    }
    
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('\n👥 Sample users:');
      const sampleUsers = await client.query('SELECT id, username, role FROM users LIMIT 3');
      sampleUsers.rows.forEach(row => {
        console.log(`  - ${row.username}: ${row.role}`);
      });
    }
    
    // Test query that would be used in API
    console.log('\n🔍 Testing API-like queries...');
    
    // Test resi search query
    const resiSearch = await client.query('SELECT * FROM satwa WHERE kode_resi ILIKE $1 LIMIT 1', ['%test%']);
    console.log(`🔍 Resi search results: ${resiSearch.rows.length} found`);
    
    // Test pagination query
    const paginatedQuery = await client.query('SELECT * FROM satwa ORDER BY created_at DESC LIMIT $1 OFFSET $2', [5, 0]);
    console.log(`📄 Paginated query: ${paginatedQuery.rows.length} results`);
    
    // Test join query
    const joinQuery = await client.query(`
      SELECT s.kode_resi, s.nama, COUNT(p.id) as progress_count 
      FROM satwa s 
      LEFT JOIN progress p ON s.id = p.satwa_id 
      GROUP BY s.id, s.kode_resi, s.nama 
      LIMIT 3
    `);
    console.log(`🔗 Join query results: ${joinQuery.rows.length} found`);
    joinQuery.rows.forEach(row => {
      console.log(`  - ${row.kode_resi}: ${row.progress_count} progress updates`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n✅ All database tests completed successfully!');
    console.log('🎉 Database is properly configured and accessible!');
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the tests
testDatabaseQueries().catch(console.error);

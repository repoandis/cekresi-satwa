const { Pool } = require('pg');

// Test SSL connection to PostgreSQL
async function testSSLConnection() {
  console.log('🚀 Testing SSL connection to PostgreSQL...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  console.log('🔍 Current SSL configuration:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`SSL setting: ${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'}`);
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  
  // Test 1: Without SSL (current setup)
  console.log('\n🔍 Test 1: Connection WITHOUT SSL...');
  try {
    const poolNoSSL = new Pool({
      host: process.env.DB_HOST || '192.168.0.76',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cekresi_satwa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_postgres_password',
      ssl: false
    });

    const clientNoSSL = await poolNoSSL.connect();
    const resultNoSSL = await clientNoSSL.query('SELECT version() as version, ssl_is_used() as ssl_used');
    
    console.log('✅ Connection successful WITHOUT SSL');
    console.log(`📊 PostgreSQL version: ${resultNoSSL.rows[0].version.split(',')[0]}`);
    console.log(`🔒 SSL used: ${resultNoSSL.rows[0].ssl_used}`);
    
    clientNoSSL.release();
    await poolNoSSL.end();
    
  } catch (error) {
    console.error('❌ Connection WITHOUT SSL failed:', error.message);
  }
  
  // Test 2: With SSL (if supported)
  console.log('\n🔍 Test 2: Connection WITH SSL...');
  try {
    const poolSSL = new Pool({
      host: process.env.DB_HOST || '192.168.0.76',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cekresi_satwa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_postgres_password',
      ssl: {
        rejectUnauthorized: false
      }
    });

    const clientSSL = await poolSSL.connect();
    const resultSSL = await clientSSL.query('SELECT version() as version, ssl_is_used() as ssl_used');
    
    console.log('✅ Connection successful WITH SSL');
    console.log(`📊 PostgreSQL version: ${resultSSL.rows[0].version.split(',')[0]}`);
    console.log(`🔒 SSL used: ${resultSSL.rows[0].ssl_used}`);
    
    clientSSL.release();
    await poolSSL.end();
    
  } catch (error) {
    console.error('❌ Connection WITH SSL failed:', error.message);
    console.log('💡 This is expected if PostgreSQL server doesn\'t support SSL');
  }
  
  // Test 3: Check PostgreSQL SSL configuration
  console.log('\n🔍 Test 3: Checking PostgreSQL SSL configuration...');
  try {
    const poolConfig = new Pool({
      host: process.env.DB_HOST || '192.168.0.76',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cekresi_satwa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_postgres_password',
      ssl: false
    });

    const clientConfig = await poolConfig.connect();
    
    // Check SSL settings
    const sslSettings = await clientConfig.query(`
      SELECT name, setting 
      FROM pg_settings 
      WHERE name LIKE '%ssl%' 
      ORDER BY name
    `);
    
    console.log('📋 PostgreSQL SSL settings:');
    sslSettings.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.setting}`);
    });
    
    // Check if SSL is enabled
    const sslEnabled = await clientConfig.query('SHOW ssl');
    console.log(`🔒 SSL enabled on server: ${sslEnabled.rows[0].ssl}`);
    
    clientConfig.release();
    await poolConfig.end();
    
  } catch (error) {
    console.error('❌ Could not check SSL configuration:', error.message);
  }
  
  // Test 4: Test current application configuration
  console.log('\n🔍 Test 4: Current application configuration...');
  try {
    const currentSSL = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
    console.log(`🔒 Current SSL config: ${JSON.stringify(currentSSL)}`);
    
    const poolCurrent = new Pool({
      host: process.env.DB_HOST || '192.168.0.76',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cekresi_satwa',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_postgres_password',
      ssl: currentSSL
    });

    const clientCurrent = await poolCurrent.connect();
    const resultCurrent = await clientCurrent.query('SELECT ssl_is_used() as ssl_used, inet_server_addr() as server_ip');
    
    console.log('✅ Current configuration working');
    console.log(`🔒 SSL used: ${resultCurrent.rows[0].ssl_used}`);
    console.log(`🌐 Server IP: ${resultCurrent.rows[0].server_ip}`);
    
    clientCurrent.release();
    await poolCurrent.end();
    
  } catch (error) {
    console.error('❌ Current configuration failed:', error.message);
  }
  
  console.log('\n📊 Summary:');
  console.log('🔒 SSL Configuration:');
  console.log('  - Development: SSL disabled (false)');
  console.log('  - Production: SSL enabled with rejectUnauthorized: false');
  console.log('  - Current: ' + (process.env.NODE_ENV === 'production' ? 'SSL enabled' : 'SSL disabled'));
  
  console.log('\n💡 Recommendations:');
  console.log('  - For local development: SSL is optional');
  console.log('  - For production: SSL is recommended');
  console.log('  - For cloud databases: SSL is usually required');
}

// Run the test
testSSLConnection().catch(console.error);

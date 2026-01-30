const { Pool } = require('pg');
const Minio = require('minio');

// Test PostgreSQL connection
async function testPostgreSQL() {
  console.log('🔍 Testing PostgreSQL connection...');
  
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
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    
    console.log('✅ PostgreSQL connected successfully!');
    console.log('📊 Current time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    // Test if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tablesResult = await client.query(tablesQuery);
    
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error('Error:', error.message);
    return false;
  }
}

// Test MinIO connection
async function testMinIO() {
  console.log('\n🔍 Testing MinIO connection...');
  
  try {
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '192.168.0.76',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
    });

    // Test bucket operations
    const bucketName = process.env.MINIO_BUCKET || 'cekresi-files';
    
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (bucketExists) {
      console.log(`✅ MinIO connected successfully!`);
      console.log(`📦 Bucket '${bucketName}' exists`);
      
      // List objects in bucket
      const objects = [];
      const stream = minioClient.listObjects(bucketName, '', true);
      
      for await (const obj of stream) {
        objects.push(obj);
      }
      
      console.log(`📁 Found ${objects.length} objects in bucket:`);
      objects.forEach(obj => {
        console.log(`  - ${obj.name} (${obj.size} bytes)`);
      });
      
    } else {
      console.log(`⚠️  Bucket '${bucketName}' does not exist`);
      console.log('Creating bucket...');
      
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket '${bucketName}' created successfully`);
    }
    
    // Test upload/download
    console.log('🧪 Testing file operations...');
    const testFileName = 'test-connection-' + Date.now() + '.txt';
    const testContent = 'Test connection at ' + new Date().toISOString();
    
    // Upload test file
    await minioClient.putObject(bucketName, testFileName, testContent);
    console.log(`✅ Successfully uploaded test file: ${testFileName}`);
    
    // Download test file
    const downloadStream = await minioClient.getObject(bucketName, testFileName);
    let downloadedContent = '';
    
    downloadStream.on('data', (chunk) => {
      downloadedContent += chunk.toString();
    });
    
    await new Promise((resolve, reject) => {
      downloadStream.on('end', resolve);
      downloadStream.on('error', reject);
    });
    
    if (downloadedContent === testContent) {
      console.log('✅ Successfully downloaded and verified test file');
    } else {
      console.log('❌ Downloaded content does not match uploaded content');
    }
    
    // Clean up test file
    await minioClient.removeObject(bucketName, testFileName);
    console.log('🧹 Cleaned up test file');
    
    return true;
  } catch (error) {
    console.error('❌ MinIO connection failed:');
    console.error('Error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting connection tests...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const pgSuccess = await testPostgreSQL();
  const minioSuccess = await testMinIO();
  
  console.log('\n📊 Test Results:');
  console.log(`PostgreSQL: ${pgSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`MinIO: ${minioSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (pgSuccess && minioSuccess) {
    console.log('\n🎉 All connections are working properly!');
    process.exit(0);
  } else {
    console.log('\n💥 Some connections failed. Please check your configuration.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);

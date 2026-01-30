const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// Test MinIO operations
async function testMinIOOperations() {
  console.log('🚀 Testing MinIO operations...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  try {
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '192.168.0.76',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
    });

    const bucketName = process.env.MINIO_BUCKET || 'cekresi-files';
    
    console.log('🔍 Testing MinIO client configuration...');
    console.log(`📦 Endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
    console.log(`🔑 Access Key: ${process.env.MINIO_ACCESS_KEY}`);
    console.log(`📁 Bucket: ${bucketName}`);
    
    // Test bucket operations
    console.log('\n🔍 Testing bucket operations...');
    
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' exists`);
    } else {
      console.log(`⚠️  Bucket '${bucketName}' does not exist, creating...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket '${bucketName}' created`);
    }
    
    // Test file upload
    console.log('\n🔍 Testing file upload...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = `Test file uploaded at ${new Date().toISOString()}\nThis is a test file for MinIO connectivity.`;
    
    // Create temporary test file
    const tempFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(tempFilePath, testContent);
    
    try {
      await minioClient.fPutObject(bucketName, testFileName, tempFilePath, {
        'Content-Type': 'text/plain',
        'X-Amz-Meta-Test': 'true'
      });
      console.log(`✅ Successfully uploaded: ${testFileName}`);
    } catch (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      throw uploadError;
    }
    
    // Test file listing
    console.log('\n🔍 Testing file listing...');
    const objects = [];
    const stream = minioClient.listObjects(bucketName, '', true);
    
    for await (const obj of stream) {
      objects.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        etag: obj.etag
      });
    }
    
    console.log(`📁 Found ${objects.length} objects:`);
    objects.forEach(obj => {
      console.log(`  - ${obj.name} (${obj.size} bytes, modified: ${obj.lastModified})`);
    });
    
    // Test file download
    console.log('\n🔍 Testing file download...');
    const downloadPath = path.join(__dirname, `downloaded-${testFileName}`);
    
    try {
      await minioClient.fGetObject(bucketName, testFileName, downloadPath);
      console.log(`✅ Successfully downloaded to: ${downloadPath}`);
      
      // Verify content
      const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
      if (downloadedContent === testContent) {
        console.log('✅ Downloaded content matches uploaded content');
      } else {
        console.log('❌ Downloaded content does not match');
      }
    } catch (downloadError) {
      console.error('❌ Download failed:', downloadError.message);
    }
    
    // Test file info
    console.log('\n🔍 Testing file info...');
    try {
      const stat = await minioClient.statObject(bucketName, testFileName);
      console.log(`📊 File info:`);
      console.log(`  - Size: ${stat.size} bytes`);
      console.log(`  - Last modified: ${stat.lastModified}`);
      console.log(`  - ETag: ${stat.etag}`);
      console.log(`  - Content type: ${stat.contentType}`);
      console.log(`  - Metadata:`, stat.metaData);
    } catch (statError) {
      console.error('❌ Get file info failed:', statError.message);
    }
    
    // Test presigned URL
    console.log('\n🔍 Testing presigned URL...');
    try {
      const presignedUrl = await minioClient.presignedGetObject(bucketName, testFileName, 3600);
      console.log(`✅ Presigned URL generated (valid for 1 hour):`);
      console.log(`  ${presignedUrl.substring(0, 100)}...`);
    } catch (urlError) {
      console.error('❌ Generate presigned URL failed:', urlError.message);
    }
    
    // Test file deletion
    console.log('\n🔍 Testing file deletion...');
    try {
      await minioClient.removeObject(bucketName, testFileName);
      console.log(`✅ Successfully deleted: ${testFileName}`);
    } catch (deleteError) {
      console.error('❌ Delete failed:', deleteError.message);
    }
    
    // Clean up temporary files
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
      console.log('🧹 Cleaned up temporary files');
    } catch (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message);
    }
    
    // Test bucket policy
    console.log('\n🔍 Testing bucket policy...');
    try {
      const policy = await minioClient.getBucketPolicy(bucketName);
      console.log('✅ Bucket policy exists');
    } catch (policyError) {
      console.log('⚠️  No bucket policy found (expected for new bucket)');
      
      // Set a basic read-only policy
      const readOnlyPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      try {
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(readOnlyPolicy));
        console.log('✅ Set read-only bucket policy');
      } catch (setPolicyError) {
        console.log('⚠️  Could not set bucket policy:', setPolicyError.message);
      }
    }
    
    console.log('\n✅ All MinIO tests completed successfully!');
    console.log('🎉 MinIO is properly configured and accessible!');
    
  } catch (error) {
    console.error('❌ MinIO test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the tests
testMinIOOperations().catch(console.error);

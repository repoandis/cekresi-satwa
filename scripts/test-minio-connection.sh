#!/bin/bash

# Script to test MinIO connection and bucket creation
echo "🔍 Testing MinIO Connection..."

# Check if MinIO is accessible
echo "📋 Testing MinIO endpoint..."
curl -I http://192.168.0.76:9000/minio/health/live

echo -e "\n📋 Testing bucket access..."
# Test if bucket exists and is accessible
curl -I http://192.168.0.76:9000/cekresi-files/

echo -e "\n📋 Testing file upload..."
# Create a test file
echo "test content" > test-file.txt

# Test upload (this will fail without proper auth, but shows connection)
curl -X PUT \
  -H "Content-Type: text/plain" \
  --data-binary @test-file.txt \
  http://192.168.0.76:9000/cekresi-files/test-upload.txt

# Clean up
rm -f test-file.txt

echo -e "\n✅ MinIO connection test completed"

const http = require('http');

// Test API endpoints
async function testAPIEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode < 400,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: res.statusCode < 400,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Main test function
async function runAPITests() {
  console.log('🚀 Starting API endpoint tests...\n');
  console.log('⚠️  Make sure the development server is running (npm run dev)\n');

  try {
    // Test resi API
    console.log('🔍 Testing /api/resi/all endpoint...');
    try {
      const resiResult = await testAPIEndpoint('/api/resi/all?page=1&limit=5');
      console.log(`Status: ${resiResult.status}`);
      if (resiResult.success) {
        console.log('✅ /api/resi/all working');
        console.log(`📊 Found ${resiResult.data.data?.length || 0} resi records`);
      } else {
        console.log('❌ /api/resi/all failed:', resiResult.data);
      }
    } catch (error) {
      console.log('❌ /api/resi/all error:', error.message);
    }

    // Test satwa API
    console.log('\n🔍 Testing /api/satwas endpoint...');
    try {
      const satwaResult = await testAPIEndpoint('/api/satwas');
      console.log(`Status: ${satwaResult.status}`);
      if (satwaResult.success) {
        console.log('✅ /api/satwas working');
        console.log(`📊 Found ${satwaResult.data.data?.length || 0} satwa records`);
      } else {
        console.log('❌ /api/satwas failed:', satwaResult.data);
      }
    } catch (error) {
      console.log('❌ /api/satwas error:', error.message);
    }

    // Test users API
    console.log('\n🔍 Testing /api/users endpoint...');
    try {
      const usersResult = await testAPIEndpoint('/api/users');
      console.log(`Status: ${usersResult.status}`);
      if (usersResult.success) {
        console.log('✅ /api/users working');
        console.log(`📊 Found ${usersResult.data.data?.length || 0} user records`);
      } else {
        console.log('❌ /api/users failed:', usersResult.data);
      }
    } catch (error) {
      console.log('❌ /api/users error:', error.message);
    }

    // Test resi search
    console.log('\n🔍 Testing /api/resi endpoint (search)...');
    try {
      const searchResult = await testAPIEndpoint('/api/resi?kode_resi=test');
      console.log(`Status: ${searchResult.status}`);
      if (searchResult.success) {
        console.log('✅ /api/resi working');
        if (searchResult.data.data) {
          console.log(`📊 Found resi: ${searchResult.data.data.kode_resi}`);
        } else {
          console.log('📊 No resi found (expected for test)');
        }
      } else {
        console.log('❌ /api/resi failed:', searchResult.data);
      }
    } catch (error) {
      console.log('❌ /api/resi error:', error.message);
    }

    console.log('\n🎉 API tests completed!');
    console.log('💡 If all endpoints are working, your database connections are properly configured.');

  } catch (error) {
    console.error('❌ API tests failed:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

// Run the tests
runAPITests().catch(console.error);

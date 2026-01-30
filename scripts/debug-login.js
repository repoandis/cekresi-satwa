const http = require('http');

// Test login API directly
async function testLoginAPI() {
  console.log('🚀 Testing login API...\n');
  
  const loginData = {
    username: 'admin',
    password: 'admin123'
  };
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
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

    req.write(JSON.stringify(loginData));
    req.end();
  });
}

// Test if server is running
async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      resolve({
        status: res.statusCode,
        success: res.statusCode < 400
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Main test function
async function runTests() {
  try {
    // Test if server is running
    console.log('🌐 Testing if server is running on localhost:3000...');
    try {
      const serverTest = await testServerConnection();
      if (serverTest.success) {
        console.log('✅ Server is running');
      } else {
        console.log('❌ Server returned error:', serverTest.status);
      }
    } catch (error) {
      console.log('❌ Server connection failed:', error.message);
      console.log('💡 Make sure the server is running: npm run dev or pm2 start');
      return;
    }
    
    // Test login API
    console.log('\n🔐 Testing login API...');
    try {
      const loginResult = await testLoginAPI();
      console.log(`Status: ${loginResult.status}`);
      console.log('Response:', JSON.stringify(loginResult.data, null, 2));
      
      if (loginResult.success && loginResult.data.success) {
        console.log('✅ Login API working correctly');
        console.log(`👤 User: ${loginResult.data.user.username} (${loginResult.data.user.role})`);
      } else {
        console.log('❌ Login API failed');
        console.log('💡 Check database connection and user credentials');
      }
    } catch (error) {
      console.log('❌ Login API error:', error.message);
    }
    
    // Test other APIs
    console.log('\n🔍 Testing other APIs...');
    
    const apiTests = [
      { name: 'Users API', path: '/api/users' },
      { name: 'Resi API', path: '/api/resi/all' },
      { name: 'Satwa API', path: '/api/satwas' }
    ];
    
    for (const test of apiTests) {
      try {
        const result = await new Promise((resolve, reject) => {
          const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: test.path,
            method: 'GET'
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve(data);
              }
            });
          });
          req.on('error', reject);
          req.end();
        });
        
        console.log(`✅ ${test.name}: Working`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
    console.log('\n💡 If APIs are working but login fails in browser:');
    console.log('  1. Check browser console for JavaScript errors');
    console.log('  2. Check network tab for failed requests');
    console.log('  3. Clear browser cache and cookies');
    console.log('  4. Check if frontend is pointing to correct API base URL');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runTests().catch(console.error);

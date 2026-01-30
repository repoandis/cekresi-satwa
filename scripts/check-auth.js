const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Check users and authentication
async function checkAuthSetup() {
  console.log('🚀 Checking authentication setup...\n');
  
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
    
    console.log('🔍 Checking users table...');
    
    // Get all users
    const usersResult = await client.query('SELECT id, username, role, created_at FROM users ORDER BY created_at');
    
    console.log(`📋 Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ID: ${user.id}`);
    });
    
    if (usersResult.rows.length === 0) {
      console.log('\n❌ No users found in database!');
      console.log('💡 Creating default users...');
      
      // Create default admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())',
        ['admin', adminPassword, 'admin']
      );
      
      // Create default regular user
      const userPassword = await bcrypt.hash('user123', 10);
      await client.query(
        'INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())',
        ['user', userPassword, 'user']
      );
      
      console.log('✅ Created default users:');
      console.log('  - Username: admin, Password: admin123 (admin role)');
      console.log('  - Username: user, Password: user123 (user role)');
      
      // Get updated users
      const updatedUsers = await client.query('SELECT id, username, role, created_at FROM users ORDER BY created_at');
      console.log(`\n📋 Updated users list (${updatedUsers.rows.length}):`);
      updatedUsers.rows.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - ID: ${user.id}`);
      });
    } else {
      console.log('\n🔍 Testing password verification...');
      
      // Test password verification for each user
      for (const user of usersResult.rows) {
        const userWithPassword = await client.query('SELECT password FROM users WHERE username = $1', [user.username]);
        const hashedPassword = userWithPassword.rows[0].password;
        
        // Test with common passwords
        const testPasswords = ['admin123', 'user123', 'password', '123456', user.username];
        
        console.log(`\n🔐 Testing passwords for user: ${user.username}`);
        for (const testPwd of testPasswords) {
          try {
            const isValid = await bcrypt.compare(testPwd, hashedPassword);
            if (isValid) {
              console.log(`  ✅ Password "${testPwd}" is VALID`);
              break;
            }
          } catch (error) {
            // Skip if password is not bcrypt hash
          }
        }
      }
    }
    
    // Check if there are any non-bcrypt passwords (plain text)
    console.log('\n🔍 Checking password formats...');
    const passwordCheck = await client.query('SELECT username, password FROM users');
    
    let plainTextPasswords = 0;
    let bcryptPasswords = 0;
    
    for (const user of passwordCheck.rows) {
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        bcryptPasswords++;
      } else {
        plainTextPasswords++;
        console.log(`⚠️  User ${user.username} has plain text password!`);
      }
    }
    
    console.log(`\n📊 Password format summary:`);
    console.log(`  - Bcrypt passwords: ${bcryptPasswords}`);
    console.log(`  - Plain text passwords: ${plainTextPasswords}`);
    
    if (plainTextPasswords > 0) {
      console.log('\n🔧 Fixing plain text passwords...');
      for (const user of passwordCheck.rows) {
        if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2a$')) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await client.query('UPDATE users SET password = $1, updated_at = NOW() WHERE username = $2', [hashedPassword, user.username]);
          console.log(`✅ Updated password for user: ${user.username}`);
        }
      }
    }
    
    // Test login simulation
    console.log('\n🧪 Simulating login process...');
    
    const loginTest = await client.query('SELECT username, password, role FROM users LIMIT 1');
    if (loginTest.rows.length > 0) {
      const testUser = loginTest.rows[0];
      console.log(`🔐 Testing login for: ${testUser.username}`);
      
      // This simulates what the login API would do
      try {
        const isValidPassword = await bcrypt.compare('admin123', testUser.password);
        if (isValidPassword) {
          console.log(`✅ Login successful for ${testUser.username} with password "admin123"`);
        } else {
          console.log(`❌ Login failed for ${testUser.username} with password "admin123"`);
        }
      } catch (error) {
        console.log(`❌ Password verification error: ${error.message}`);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Authentication check completed!');
    console.log('\n💡 Login credentials:');
    console.log('  - Admin: username "admin", password "admin123"');
    console.log('  - User: username "user", password "user123"');
    
  } catch (error) {
    console.error('❌ Authentication check failed:');
    console.error('Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Make sure PostgreSQL server is running and accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Check if PostgreSQL is running on the specified port');
    }
  }
}

// Run the check
checkAuthSetup().catch(console.error);

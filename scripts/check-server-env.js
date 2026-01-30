const fs = require('fs');
const path = require('path');

// Check environment files and configuration
console.log('🔍 Checking server environment configuration...\n');

// Check if .env file exists and its content
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

console.log('📁 Environment files:');
console.log(`  - .env exists: ${fs.existsSync(envPath)}`);
console.log(`  - .env.local exists: ${fs.existsSync(envLocalPath)}`);

if (fs.existsSync(envPath)) {
  console.log('\n📋 .env content:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
}

if (fs.existsSync(envLocalPath)) {
  console.log('\n📋 .env.local content:');
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log(envLocalContent);
}

// Check database.ts configuration
console.log('\n📋 database.ts SSL configuration:');
const dbPath = path.join(__dirname, '..', 'lib', 'database.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  const sslMatch = dbContent.match(/ssl:\s*(.+?)[\n,]/);
  if (sslMatch) {
    console.log(`  - SSL setting: ${sslMatch[1]}`);
  }
}

// Check if there are any other database connection files
console.log('\n🔍 Checking for other database files...');
const libPath = path.join(__dirname, '..', 'lib');
if (fs.existsSync(libPath)) {
  const files = fs.readdirSync(libPath);
  files.forEach(file => {
    if (file.includes('db') || file.includes('database') || file.includes('server')) {
      console.log(`  - Found: ${file}`);
    }
  });
}

console.log('\n💡 Server deployment checklist:');
console.log('1. Make sure .env file is uploaded to server');
console.log('2. Check if there are multiple database connection files');
console.log('3. Verify the build uses the correct database.ts');
console.log('4. Clear PM2 cache: pm2 delete nextjs-app && pm2 start ecosystem.config.js');
console.log('5. Check if server has old .next build cache');

console.log('\n🔧 Commands to run on server:');
console.log('  # Clear build cache');
console.log('  rm -rf .next');
console.log('  # Rebuild');
console.log('  npm run build');
console.log('  # Clear PM2');
console.log('  pm2 delete nextjs-app');
console.log('  # Restart');
console.log('  pm2 start ecosystem.config.js');

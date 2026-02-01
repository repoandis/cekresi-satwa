const fs = require('fs');
const path = require('path');

// Verify server has the correct SSL fix
console.log('🔍 Verifying server SSL fix...\n');

// Check 1: server-db.ts SSL configuration
console.log('📋 Checking lib/server-db.ts SSL configuration:');
const serverDbPath = path.join(__dirname, '..', 'lib', 'server-db.ts');
if (fs.existsSync(serverDbPath)) {
  const serverDbContent = fs.readFileSync(serverDbPath, 'utf8');
  const sslMatch = serverDbContent.match(/ssl:\s*(.+?)[\n,]/);
  if (sslMatch) {
    const sslConfig = sslMatch[1].trim();
    console.log(`  - SSL setting: ${sslConfig}`);
    
    if (sslConfig === 'false') {
      console.log('  ✅ SSL is correctly disabled');
    } else {
      console.log('  ❌ SSL is not disabled - PROBLEM!');
    }
  } else {
    console.log('  ❌ Could not find SSL configuration');
  }
} else {
  console.log('  ❌ server-db.ts file not found');
}

// Check 2: database.ts SSL configuration
console.log('\n📋 Checking lib/database.ts SSL configuration:');
const databasePath = path.join(__dirname, '..', 'lib', 'database.ts');
if (fs.existsSync(databasePath)) {
  const databaseContent = fs.readFileSync(databasePath, 'utf8');
  const sslMatch = databaseContent.match(/ssl:\s*(.+?)[\n,]/);
  if (sslMatch) {
    const sslConfig = sslMatch[1].trim();
    console.log(`  - SSL setting: ${sslConfig}`);
    
    if (sslConfig === 'false') {
      console.log('  ✅ SSL is correctly disabled');
    } else {
      console.log('  ⚠️  SSL is not disabled (but server-db.ts is the important one)');
    }
  } else {
    console.log('  ❌ Could not find SSL configuration');
  }
} else {
  console.log('  ❌ database.ts file not found');
}

// Check 3: Environment files
console.log('\n📋 Checking environment files:');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('DB_SSL=false')) {
    console.log('  ✅ .env contains DB_SSL=false');
  } else {
    console.log('  ⚠️  .env does not contain DB_SSL=false');
  }
} else {
  console.log('  ❌ .env file not found');
}

const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envLocalContent.includes('DB_SSL=false')) {
    console.log('  ✅ .env.local contains DB_SSL=false');
  } else {
    console.log('  ⚠️  .env.local does not contain DB_SSL=false');
  }
} else {
  console.log('  ❌ .env.local file not found');
}

// Check 4: Build cache
console.log('\n📋 Checking build cache:');
const nextPath = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextPath)) {
  console.log('  ⚠️  .next directory exists (should be cleared before rebuild)');
  console.log('  💡 Run: rm -rf .next');
} else {
  console.log('  ✅ .next directory does not exist (good for fresh build)');
}

// Check 5: Git status
console.log('\n📋 Checking Git status:');
try {
  const { execSync } = require('child_process');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('  ⚠️  There are uncommitted changes:');
    console.log(gitStatus.split('\n').filter(line => line.trim()).map(line => `    ${line}`).join('\n'));
  } else {
    console.log('  ✅ Working tree is clean');
  }
  
  const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' });
  console.log(`  📍 Current branch: ${gitBranch.trim()}`);
  
  const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' });
  console.log(`  📍 Current commit: ${gitCommit.trim()}`);
  
} catch (error) {
  console.log('  ❌ Could not check Git status');
}

// Summary
console.log('\n🎯 Verification Summary:');
console.log('📋 Required for safe deployment:');
console.log('  ✅ lib/server-db.ts: ssl: false');
console.log('  ✅ Clear .next build cache');
console.log('  ✅ Rebuild with npm run build');
console.log('  ✅ Restart PM2');

console.log('\n💡 Next steps if verification passes:');
console.log('  1. rm -rf .next');
console.log('  2. npm run build');
console.log('  3. pm2 delete nextjs-app');
console.log('  4. pm2 start ecosystem.config.js');
console.log('  5. pm2 logs nextjs-app');

console.log('\n🔍 Expected result after deployment:');
console.log('  - No SSL connection errors');
console.log('  - Login functionality working');
console.log('  - Database connection stable');

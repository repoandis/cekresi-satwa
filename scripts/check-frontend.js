const fs = require('fs');
const path = require('path');

// Check frontend login implementation
console.log('🔍 Checking frontend login implementation...\n');

// Check login form component
const appPagePath = path.join(__dirname, '..', 'app', 'page.tsx');
if (fs.existsSync(appPagePath)) {
  console.log('📋 Main page (app/page.tsx):');
  const pageContent = fs.readFileSync(appPagePath, 'utf8');
  
  // Look for login-related code
  const loginMatch = pageContent.match(/login|Login|LOGIN/g);
  if (loginMatch) {
    console.log(`  - Found login references: ${loginMatch.length} times`);
  }
  
  // Look for API calls
  const apiMatch = pageContent.match(/\/api\/auth\/login/g);
  if (apiMatch) {
    console.log(`  - Found API login endpoint: ${apiMatch.length} times`);
  }
  
  // Look for fetch calls
  const fetchMatch = pageContent.match(/fetch\s*\(/g);
  if (fetchMatch) {
    console.log(`  - Found fetch calls: ${fetchMatch.length} times`);
  }
}

// Check components directory
const componentsPath = path.join(__dirname, '..', 'components');
if (fs.existsSync(componentsPath)) {
  console.log('\n📁 Components directory:');
  const components = fs.readdirSync(componentsPath);
  
  components.forEach(component => {
    if (component.includes('auth') || component.includes('login') || component.includes('form')) {
      console.log(`  - Found: ${component}`);
      
      const componentPath = path.join(componentsPath, component);
      if (fs.statSync(componentPath).isDirectory()) {
        const files = fs.readdirSync(componentPath);
        files.forEach(file => {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const filePath = path.join(componentPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (content.includes('login') || content.includes('Login')) {
              console.log(`    - ${file} contains login code`);
            }
          }
        });
      }
    }
  });
}

// Check for environment variables in frontend
console.log('\n🔍 Checking frontend environment usage:');
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  console.log('  - next.config.js exists');
}

// Check if there are any hardcoded URLs
console.log('\n🔍 Checking for hardcoded URLs:');
const searchDirs = ['app', 'components', 'lib'];

searchDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    const searchInDir = (currentPath, depth = 0) => {
      if (depth > 3) return; // Limit depth
      
      const items = fs.readdirSync(currentPath);
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          searchInDir(itemPath, depth + 1);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js')) {
          const content = fs.readFileSync(itemPath, 'utf8');
          
          // Look for localhost URLs
          const localhostMatches = content.match(/localhost:\d+/g);
          if (localhostMatches) {
            console.log(`  - Found localhost URLs in ${path.relative(path.join(__dirname, '..'), itemPath)}: ${localhostMatches.join(', ')}`);
          }
          
          // Look for API base URLs
          const apiMatches = content.match(/http[s]?:\/\/[^\/]+\/api\//g);
          if (apiMatches) {
            console.log(`  - Found API URLs in ${path.relative(path.join(__dirname, '..'), itemPath)}: ${apiMatches.join(', ')}`);
          }
        }
      });
    };
    
    searchInDir(dirPath);
  }
});

console.log('\n💡 Debugging checklist:');
console.log('1. Check browser console for JavaScript errors');
console.log('2. Check network tab for failed API requests');
console.log('3. Verify API endpoint is accessible');
console.log('4. Check if frontend is using correct base URL');
console.log('5. Test login API directly with curl or Postman');

console.log('\n🔧 Test commands:');
console.log('  # Test login API directly');
console.log('  curl -X POST http://localhost:3000/api/auth/login \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{"username":"admin","password":"admin123"}\'');
console.log('');
console.log('  # Check if server is running');
console.log('  curl http://localhost:3000/');

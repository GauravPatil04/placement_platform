const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📝 Please create a .env file based on .env.example');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8');

// Check for required variables
const requiredVars = ['DATABASE_URL', 'DIRECT_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!envContent.includes(varName + '=')) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('\n📝 Please add these to your .env file');
  console.log('💡 Check .env.example for the format\n');
  
  if (missingVars.includes('DIRECT_URL')) {
    console.log('ℹ️  For Supabase users:');
    console.log('   DATABASE_URL should use port 6543 with ?pgbouncer=true');
    console.log('   DIRECT_URL should use port 5432 without ?pgbouncer=true');
  }
  
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// Check if Prisma Client is generated
try {
  require('@prisma/client');
  console.log('✅ Prisma Client is generated');
} catch (e) {
  console.log('⚠️  Prisma Client not generated');
  console.log('   Run: npx prisma generate');
}

console.log('\n🎉 Environment configuration looks good!');
console.log('\n📚 Next steps:');
console.log('   1. npx prisma migrate dev --name init');
console.log('   2. npx prisma db seed');
console.log('   3. npm run dev');

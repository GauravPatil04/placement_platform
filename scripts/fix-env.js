#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing DATABASE_URL for Prisma 7...\n');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf-8');
let updated = false;

// Fix DATABASE_URL - change port 6543 to 5432 and remove pgbouncer
const originalUrl = envContent;

envContent = envContent.replace(
    /DATABASE_URL="([^"]*):6543([^"]*)(\?pgbouncer=true)?"/g,
    (match, prefix, suffix) => {
        updated = true;
        // Remove pgbouncer parameter and change port
        const cleanSuffix = suffix.replace(/\?pgbouncer=true/g, '');
        return `DATABASE_URL="${prefix}:5432${cleanSuffix}"`;
    }
);

// Fix DIRECT_URL similarly
envContent = envContent.replace(
    /DIRECT_URL="([^"]*):6543([^"]*)(\?pgbouncer=true)?"/g,
    (match, prefix, suffix) => {
        updated = true;
        const cleanSuffix = suffix.replace(/\?pgbouncer=true/g, '');
        return `DIRECT_URL="${prefix}:5432${cleanSuffix}"`;
    }
);

if (updated) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fixed DATABASE_URL and DIRECT_URL!');
    console.log('   Changed port 6543 → 5432');
    console.log('   Removed ?pgbouncer=true\n');
    console.log('🎯 Next steps:');
    console.log('   1. Restart dev server: Ctrl+C then npm run dev');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npx prisma db seed\n');
} else {
    console.log('✅ DATABASE_URL is already configured correctly!');
    console.log('   Using port 5432 (direct connection)\n');
}

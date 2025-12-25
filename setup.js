#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} complete!`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed!`);
        return false;
    }
}

async function main() {
    console.log('🚀 Aivalytics Skill Builder - Quick Setup\n');
    console.log('This script will help you set up the project.\n');

    // Check if .env file exists
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');

    if (!fs.existsSync(envPath)) {
        console.log('⚠️  No .env file found!\n');
        console.log('You need to create a .env file with your database credentials.\n');

        const shouldCopy = await question('Would you like to copy .env.example to .env? (y/n): ');

        if (shouldCopy.toLowerCase() === 'y') {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ Created .env file from template');
            console.log('\n⚠️  IMPORTANT: Edit .env file and add your actual credentials:');
            console.log('   - DATABASE_URL');
            console.log('   - DIRECT_URL (for Supabase)');
            console.log('   - NEXTAUTH_SECRET (run: openssl rand -base64 32)');
            console.log('   - GEMINI_API_KEY (optional)\n');

            const ready = await question('Have you updated the .env file? (y/n): ');
            if (ready.toLowerCase() !== 'y') {
                console.log('\n👋 Please update .env and run this script again.');
                rl.close();
                return;
            }
        } else {
            console.log('\n👋 Please create a .env file manually and run this script again.');
            rl.close();
            return;
        }
    } else {
        console.log('✅ .env file found\n');
    }

    // Step 1: Install dependencies
    console.log('📦 Step 1: Dependencies');
    const install = await question('Install npm packages? (y/n): ');
    if (install.toLowerCase() === 'y') {
        exec('npm install', 'Installing dependencies');
    }

    // Step 2: Generate Prisma Client
    console.log('\n📦 Step 2: Prisma Client');
    const generate = await question('Generate Prisma Client? (y/n): ');
    if (generate.toLowerCase() === 'y') {
        exec('npx prisma generate', 'Generating Prisma Client');
    }

    // Step 3: Run migrations
    console.log('\n📦 Step 3: Database Migration');
    console.log('This will create all database tables.');
    const migrate = await question('Run database migrations? (y/n): ');
    if (migrate.toLowerCase() === 'y') {
        const success = exec('npx prisma migrate dev --name init', 'Running migrations');
        if (!success) {
            console.log('\n⚠️  Migration failed. Common issues:');
            console.log('   - Check DATABASE_URL and DIRECT_URL in .env');
            console.log('   - For Supabase: DIRECT_URL should use port 5432, not 6543');
            console.log('   - Ensure database is accessible\n');
        }
    }

    // Step 4: Seed database
    console.log('\n📦 Step 4: Seed Database');
    console.log('This will add sample users and tests.');
    const seed = await question('Seed database with sample data? (y/n): ');
    if (seed.toLowerCase() === 'y') {
        const success = exec('npx prisma db seed', 'Seeding database');
        if (success) {
            console.log('\n🎉 Sample data created:');
            console.log('   Admin: admin@example.com / admin123');
            console.log('   User: user@example.com / user123');
            console.log('   3 sample tests with questions\n');
        }
    }

    // Done!
    console.log('\n✨ Setup Complete!\n');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Login with the credentials above\n');
    console.log('📚 For more info, check:');
    console.log('   - PROJECT_STATUS.md');
    console.log('   - SETUP.md');
    console.log('   - README.md\n');

    rl.close();
}

main().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});

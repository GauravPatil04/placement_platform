#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
    console.log('🔍 Testing database connection...\n');
    
    const urls = [
        { name: 'DATABASE_URL (Pooler)', url: process.env.DATABASE_URL },
        { name: 'DIRECT_URL (Direct)', url: process.env.DIRECT_URL }
    ];
    
    for (const { name, url } of urls) {
        if (!url) {
            console.log(`❌ ${name}: Not set\n`);
            continue;
        }
        
        console.log(`Testing ${name}...`);
        console.log(`URL: ${url.replace(/:[^:@]+@/, ':****@')}\n`); // Hide password
        
        const pool = new Pool({ connectionString: url });
        
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
            console.log(`✅ ${name}: Connection successful!`);
            console.log(`   Database: ${result.rows[0].db_name}`);
            console.log(`   Server time: ${result.rows[0].current_time}\n`);
            client.release();
            await pool.end();
        } catch (error) {
            console.log(`❌ ${name}: Connection failed`);
            console.log(`   Error: ${error.message}\n`);
            await pool.end();
        }
    }
}

testConnection().catch(console.error);


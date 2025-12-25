import { PrismaClient } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Checking database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    console.log('🔍 Checking for User table...');
    try {
      const count = await prisma.user.count();
      console.log(`✅ User table exists. Current user count: ${count}`);
    } catch (e: any) {
        if (e.code === 'P2021') {
            console.log('❌ User table does not exist.');
        } else {
            console.error('❌ Error checking User table:', e);
        }
        process.exit(1);
    }

  } catch (e) {
    console.error('❌ Failed to connect to database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

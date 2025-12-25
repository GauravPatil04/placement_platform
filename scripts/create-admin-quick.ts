import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createQuickAdmin() {
    // Get credentials from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Admin User';

    if (!email || !password) {
        console.error('❌ Usage: ts-node scripts/create-admin-quick.ts <email> <password> [name]');
        console.error('Example: ts-node scripts/create-admin-quick.ts admin@company.com SecurePass123 "John Doe"');
        process.exit(1);
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Update existing user to admin
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { role: 'admin' }
            });
            console.log(`✅ User ${updatedUser.email} has been promoted to admin!`);
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new admin user
            const admin = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: 'admin',
                    bio: 'Administrator',
                }
            });

            console.log('\n✅ Admin account created successfully!');
            console.log('📧 Email:', admin.email);
            console.log('👤 Name:', admin.name);
            console.log('🔑 Role:', admin.role);
            console.log('\n🔐 Login at: http://localhost:3000/login');
        }

    } catch (error) {
        console.error('❌ Error creating admin account:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createQuickAdmin();

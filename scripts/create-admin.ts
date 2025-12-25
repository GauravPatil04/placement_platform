import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdmin() {
    console.log('🔐 Admin Account Creation Tool\n');

    try {
        // Get admin details from user
        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password: ');
        const bio = await question('Enter admin bio (optional): ');

        // Validate inputs
        if (!name || !email || !password) {
            console.error('❌ Name, email, and password are required!');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log(`\n⚠️  User with email ${email} already exists.`);
            const updateRole = await question('Do you want to promote this user to admin? (yes/no): ');

            if (updateRole.toLowerCase() === 'yes' || updateRole.toLowerCase() === 'y') {
                const updatedUser = await prisma.user.update({
                    where: { email },
                    data: { role: 'admin' }
                });
                console.log(`✅ User ${updatedUser.email} has been promoted to admin!`);
            } else {
                console.log('❌ Operation cancelled.');
            }
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
                    bio: bio || 'Administrator',
                }
            });

            console.log('\n✅ Admin account created successfully!');
            console.log('📧 Email:', admin.email);
            console.log('👤 Name:', admin.name);
            console.log('🔑 Role:', admin.role);
        }

    } catch (error) {
        console.error('❌ Error creating admin account:', error);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

createAdmin();

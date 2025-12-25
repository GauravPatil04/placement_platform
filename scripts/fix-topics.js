// Simple script to check and fix test topics
// Run with: node scripts/fix-topics.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking placement tests...\n');

    const tests = await prisma.test.findMany({
        where: { type: 'company' },
        select: {
            id: true,
            title: true,
            company: true,
            topic: true,
        },
    });

    console.log(`Found ${tests.length} company tests:\n`);

    for (const test of tests) {
        console.log(`📋 ${test.title}`);
        console.log(`   Company: ${test.company || 'N/A'}`);
        console.log(`   Topic: ${test.topic || 'NOT SET ❌'}`);

        if (!test.topic && test.title) {
            const titleLower = test.title.toLowerCase();
            let topic = null;

            if (titleLower.includes('foundation')) topic = 'Foundation';
            else if (titleLower.includes('advanced')) topic = 'Advanced';
            else if (titleLower.includes('coding')) topic = 'Coding';
            else if (titleLower.includes('aptitude')) topic = 'Aptitude';
            else if (titleLower.includes('essay')) topic = 'Essay';

            if (topic) {
                console.log(`   ✅ Setting topic to: ${topic}`);
                await prisma.test.update({
                    where: { id: test.id },
                    data: { topic },
                });
            }
        }
        console.log('');
    }

    console.log('\n📊 Final dropdown display:');
    const updated = await prisma.test.findMany({
        where: { type: 'company' },
        select: { title: true, company: true, topic: true },
    });

    for (const test of updated) {
        const display = test.company
            ? `${test.company}${test.topic ? ` - ${test.topic}` : ` - ${test.title}`}`
            : test.title;
        console.log(`   ${display}`);
    }

    console.log('\n✅ Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

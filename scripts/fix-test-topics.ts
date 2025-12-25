// Script to check and update placement test topics
// Run this with: npx tsx scripts/fix-test-topics.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTestTopics() {
    console.log('🔍 Checking placement tests...\n');

    // Get all company tests
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
        console.log(`📋 Test: ${test.title}`);
        console.log(`   Company: ${test.company || 'N/A'}`);
        console.log(`   Topic: ${test.topic || 'NOT SET ❌'}`);
        console.log('');

        // Auto-fix: Extract topic from title if not set
        if (!test.topic && test.title) {
            const titleLower = test.title.toLowerCase();
            let suggestedTopic = null;

            // Try to extract topic from title
            if (titleLower.includes('foundation')) {
                suggestedTopic = 'Foundation';
            } else if (titleLower.includes('advanced')) {
                suggestedTopic = 'Advanced';
            } else if (titleLower.includes('coding')) {
                suggestedTopic = 'Coding';
            } else if (titleLower.includes('aptitude')) {
                suggestedTopic = 'Aptitude';
            } else if (titleLower.includes('essay')) {
                suggestedTopic = 'Essay';
            }

            if (suggestedTopic) {
                console.log(`   ✅ Auto-fixing: Setting topic to "${suggestedTopic}"`);
                await prisma.test.update({
                    where: { id: test.id },
                    data: { topic: suggestedTopic },
                });
                console.log(`   ✅ Updated!\n`);
            } else {
                console.log(`   ⚠️  Could not auto-detect topic. Please set manually.\n`);
            }
        }
    }

    // Show final state
    console.log('\n📊 Final state of tests:');
    const updatedTests = await prisma.test.findMany({
        where: { type: 'company' },
        select: {
            title: true,
            company: true,
            topic: true,
        },
    });

    for (const test of updatedTests) {
        const display = test.company
            ? `${test.company}${test.topic ? ` - ${test.topic}` : ` - ${test.title}`}`
            : test.title;
        console.log(`   ${display}`);
    }

    console.log('\n✅ Done!');
}

fixTestTopics()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

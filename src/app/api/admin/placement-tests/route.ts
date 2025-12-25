import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/placement-tests
 * Get or create placement tests for TCS and Wipro
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Define placement tests structure
        const placementTests = [
            {
                title: 'TCS - Foundation',
                description: 'Foundation test covering Numerical, Verbal, and Reasoning abilities',
                type: 'company',
                company: 'TCS',
                topic: 'Foundation',
                duration: 60,
                difficulty: 'Medium',
            },
            {
                title: 'TCS - Advanced',
                description: 'Advanced test covering Quantitative and Logical Reasoning',
                type: 'company',
                company: 'TCS',
                topic: 'Advanced',
                duration: 45,
                difficulty: 'Hard',
            },
            {
                title: 'TCS - Coding',
                description: 'Coding assessment with programming problems',
                type: 'company',
                company: 'TCS',
                topic: 'Coding',
                duration: 90,
                difficulty: 'Hard',
            },
            {
                title: 'Wipro - Aptitude',
                description: 'Aptitude test covering Quantitative, Logical, and Verbal abilities',
                type: 'company',
                company: 'Wipro',
                topic: 'Aptitude',
                duration: 60,
                difficulty: 'Medium',
            },
            {
                title: 'Wipro - Essay',
                description: 'Essay writing assessment',
                type: 'company',
                company: 'Wipro',
                topic: 'Essay',
                duration: 30,
                difficulty: 'Medium',
            },
            {
                title: 'Wipro - Coding',
                description: 'Coding assessment with programming problems',
                type: 'company',
                company: 'Wipro',
                topic: 'Coding',
                duration: 60,
                difficulty: 'Hard',
            },
        ];

        // Check and create tests if they don't exist
        const createdTests = [];
        for (const testData of placementTests) {
            // Check if test already exists
            let test = await prisma.test.findFirst({
                where: {
                    type: 'company',
                    company: testData.company,
                    topic: testData.topic,
                },
            });

            // Create if doesn't exist
            if (!test) {
                test = await prisma.test.create({
                    data: testData,
                });
                createdTests.push(test);
            }
        }

        // Fetch all placement tests
        const tests = await prisma.test.findMany({
            where: {
                type: 'company',
                company: {
                    in: ['TCS', 'Wipro'],
                },
            },
            orderBy: [
                { company: 'asc' },
                { topic: 'asc' },
            ],
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });

        return NextResponse.json({
            tests,
            created: createdTests.length,
            message: createdTests.length > 0
                ? `Created ${createdTests.length} new placement tests`
                : 'All placement tests already exist',
        });
    } catch (error) {
        console.error('Error fetching placement tests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch placement tests' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDetailedFieldAnalysis } from '@/lib/gemini';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const resultId = searchParams.get('id');

        if (resultId) {
            // Get specific result
            const result = await prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    test: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!result) {
                return NextResponse.json(
                    { error: 'Result not found' },
                    { status: 404 }
                );
            }

            // Check if user owns this result or is admin
            if (result.userId !== session.user.id && session.user.role !== 'admin') {
                return NextResponse.json(
                    { error: 'Forbidden' },
                    { status: 403 }
                );
            }

            return NextResponse.json({ result });
        } else {
            // Get all results for the user
            const results = await prisma.result.findMany({
                where: {
                    userId: session.user.id,
                },
                include: {
                    test: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return NextResponse.json({ results });
        }
    } catch (error) {
        console.error('Results fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { testTitle, testType, company, score, total, answers, solutions, essayText, duration } = body;

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Create or find test
        let test = await prisma.test.findFirst({
            where: {
                title: testTitle,
                type: testType,
                company: company,
            },
        });

        if (!test) {
            // Create a placeholder test for placement tests
            test = await prisma.test.create({
                data: {
                    title: testTitle,
                    description: `${company} placement test`,
                    duration: duration || 60,
                    difficulty: 'Medium',
                    type: testType,
                    company: company,
                    topic: company,
                },
            });
        }

        // Calculate percentage
        const percentage = Math.round((score / total) * 100);

        // Generate AI summary using field analysis
        let aiSummary = null;
        try {
            // For regular tests, we have less detailed data, so we provide a simpler analysis
            console.log('Generating AI summary for test:', testTitle, 'Score:', percentage);
            aiSummary = await generateDetailedFieldAnalysis(
                {
                    score: percentage,
                    totalQuestions: total,
                    correct: score,
                    wrong: total - score,
                    categoryBreakdown: {
                        [testTitle]: { correct: score, total: total, percentage: percentage }
                    },
                    wrongQuestions: [], // Regular tests don't track individual wrong questions
                },
                testTitle
            );
            console.log('AI summary generated successfully, length:', aiSummary?.length || 0);
        } catch (aiError) {
            console.error('Error generating AI summary:', aiError);
            // Fallback to basic summary
            aiSummary = `
TEST ANALYSIS REPORT
${testTitle}
${'='.repeat(50)}

OVERALL PERFORMANCE
Score: ${percentage}% (${score}/${total})
Correct Answers: ${score}
Wrong Answers: ${total - score}

RECOMMENDATION
${percentage >= 80 
    ? 'Excellent performance! You have a strong grasp of the concepts. Continue practicing to maintain and improve further.'
    : percentage >= 60 
    ? 'Good performance! You have a solid foundation. Focus on areas where you made mistakes and practice similar questions.'
    : 'Your performance indicates need for more focused study. Review fundamental concepts and practice consistently.'
}

NEXT STEPS
1. Review questions you got wrong and understand the concepts
2. Practice similar questions to build confidence
3. Take another test in 3-4 days to measure improvement
4. Focus on consistent daily practice rather than cramming
            `.trim();
        }

        console.log('Final aiSummary being saved:', aiSummary?.substring(0, 100) || 'null');

        // Create result
        const result = await prisma.result.create({
            data: {
                userId: user.id,
                testId: test.id,
                score,
                total,
                aiFeedback: aiSummary,
            },
        });

        return NextResponse.json({
            success: true,
            resultId: result.id,
            score,
            total,
            percentage,
            aiSummary,
        });
    } catch (error) {
        console.error('Result submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

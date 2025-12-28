import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateComprehensiveSummary } from '@/lib/gemini';

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

        // Generate AI summary
        let aiSummary = null;
        try {
            const stats = {
                score: percentage,
                accuracy: percentage,
                totalQuestions: total,
                topics: {
                    [company]: { correct: score, total: total }
                }
            };
            
            const comprehensiveSummary = await generateComprehensiveSummary(stats, testTitle);
            
            // Format the comprehensive summary as a readable text
            aiSummary = `
📊 COMPREHENSIVE TEST ANALYSIS
═════════════════════════════════

🎯 Performance Overview:
${comprehensiveSummary.performanceOverview}

✅ Your Strengths:
${comprehensiveSummary.strengthsAnalysis}

📈 Areas for Improvement:
${comprehensiveSummary.weaknessAnalysis}

📚 Study Recommendations:
${comprehensiveSummary.studyRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

🗓️ 7-Day Action Plan:
${comprehensiveSummary.actionPlan}

💪 Motivational Message:
${comprehensiveSummary.motivationalMessage}
            `.trim();
        } catch (aiError) {
            console.error('Error generating AI summary:', aiError);
            aiSummary = "AI summary generation is temporarily unavailable. Please review your performance manually.";
        }

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

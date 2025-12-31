import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageName: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, stageName } = await params;
        const body = await request.json();
        const { answers, score, total, timeSpent, essayText, code, language } = body;


        // Fetch application
        const application = await prisma.placementApplication.findUnique({
            where: { id },
            include: {
                assessmentStages: true,
                user: true,
            },
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Verify application belongs to user or user is admin
        if (application.user.email !== session.user.email && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if stage already completed
        const existingStage = application.assessmentStages.find(
            (stage) => stage.stageName === stageName
        );

        if (existingStage && existingStage.submittedAt) {
            return NextResponse.json(
                { error: 'Stage already completed' },
                { status: 400 }
            );
        }

        // Fetch questions with correct answers to calculate actual score
        const test = await findTestForStage(application.company, stageName);
        const questions = test ? await prisma.question.findMany({
            where: { testId: test.id },
            include: {
                options: true,
            },
        }) : [];

        // Calculate actual score and category breakdown
        const scoreData = calculateDetailedScore(answers, questions);
        const actualScore = scoreData.totalCorrect;
        const actualTotal = scoreData.totalQuestions;
        const percentage = actualTotal > 0 ? (actualScore / actualTotal) * 100 : 0;

        // Determine if passed based on company and stage
        const isPassed = calculatePassStatus(application.company, stageName, percentage, actualScore);

        // Create or update assessment stage
        const assessmentStage = await prisma.assessmentStage.upsert({
            where: {
                id: existingStage?.id || 'new',
            },
            create: {
                applicationId: id,
                stageName,
                score: actualScore,
                total: actualTotal,
                percentage,
                isPassed,
                timeSpent,
                submittedAt: new Date(),
                feedback: JSON.stringify({
                    categoryBreakdown: scoreData.categoryBreakdown,
                    wrongQuestions: scoreData.wrongQuestions,
                }), // Store both category breakdown and wrong questions
            },
            update: {
                score: actualScore,
                total: actualTotal,
                percentage,
                isPassed,
                timeSpent,
                submittedAt: new Date(),
                feedback: JSON.stringify({
                    categoryBreakdown: scoreData.categoryBreakdown,
                    wrongQuestions: scoreData.wrongQuestions,
                }),
            },
        });

        // Store essay or code if provided
        if (essayText && stageName === 'essay') {
            // Store essay in a separate field or table if needed
            await prisma.assessmentStage.update({
                where: { id: assessmentStage.id },
                data: {
                    // You might want to add an essay field to the schema
                    // For now, we'll store it in a JSON field if available
                },
            });
        }

        // Update application status and determine next stage
        const nextStage = determineNextStage(application.company, stageName, isPassed);
        const newStatus = isPassed ? nextStage : 'rejected';

        await prisma.placementApplication.update({
            where: { id },
            data: {
                status: newStatus,
                currentStage: isPassed ? nextStage : stageName,
                finalDecision: isPassed ? undefined : 'rejected',
            },
        });

        // If all stages completed, assign track
        if (isPassed && isLastStage(application.company, nextStage)) {
            const track = await assignTrack(application.company, application.assessmentStages);
            await prisma.placementApplication.update({
                where: { id },
                data: {
                    finalTrack: track,
                    finalDecision: 'selected',
                    status: 'completed',
                },
            });

            return NextResponse.json({
                success: true,
                isPassed,
                nextStage: 'completed',
                track,
                message: `Congratulations! You have been selected for ${track} track.`,
            });
        }

        return NextResponse.json({
            success: true,
            isPassed,
            nextStage: isPassed ? nextStage : null,
            percentage,
            score: actualScore,
            total: actualTotal,
            categoryBreakdown: scoreData.categoryBreakdown,
        });
    } catch (error) {
        console.error('Error submitting stage:', error);
        return NextResponse.json(
            { error: 'Failed to submit stage assessment' },
            { status: 500 }
        );
    }
}

function calculatePassStatus(
    company: string,
    stageName: string,
    percentage: number,
    score: number
): boolean {
    if (company === 'TCS') {
        if (stageName === 'foundation') return percentage >= 60;
        if (stageName === 'advanced') return percentage >= 65;
        if (stageName === 'coding') return score >= 2; // At least 2 out of 3 problems
    } else if (company === 'Wipro') {
        if (stageName === 'aptitude') return percentage >= 65;
        if (stageName === 'essay') return percentage >= 70; // Based on AI scoring
        if (stageName === 'coding') return score >= 1; // At least 1 out of 2 problems
    }
    return false;
}

function determineNextStage(
    company: string,
    currentStage: string,
    isPassed: boolean
): string {
    if (!isPassed) return currentStage;

    if (company === 'TCS') {
        const stages = ['foundation', 'advanced', 'coding', 'interview', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        return stages[currentIndex + 1] || 'completed';
    } else if (company === 'Wipro') {
        const stages = ['aptitude', 'essay', 'coding', 'voice', 'interview', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        return stages[currentIndex + 1] || 'completed';
    }

    return 'completed';
}

function isLastStage(company: string, stage: string): boolean {
    if (company === 'TCS') {
        return stage === 'interview' || stage === 'completed';
    } else if (company === 'Wipro') {
        return stage === 'interview' || stage === 'completed';
    }
    return false;
}

async function assignTrack(
    company: string,
    stages: any[]
): Promise<string> {
    if (company === 'TCS') {
        // Digital track: Coding score >= 2.5/3 (83%+)
        // Ninja track: Coding score >= 2/3 (67%+)
        const codingStage = stages.find((s) => s.stageName === 'coding');
        if (codingStage) {
            const codingPercentage = codingStage.percentage || 0;
            if (codingPercentage >= 83) return 'Digital';
            if (codingPercentage >= 67) return 'Ninja';
        }
        return 'Ninja';
    } else if (company === 'Wipro') {
        // Turbo track: Overall average >= 80%
        // Elite track: Overall average >= 70%
        const totalPercentage = stages.reduce((sum, s) => sum + (s.percentage || 0), 0);
        const avgPercentage = totalPercentage / stages.length;

        if (avgPercentage >= 80) return 'Turbo';
        if (avgPercentage >= 70) return 'Elite';
        return 'Elite';
    }

    return 'Standard';
}

interface ScoreData {
    totalCorrect: number;
    totalQuestions: number;
    categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
    wrongQuestions: Array<{
        id: string;
        text: string;
        category: string;
        userAnswer: string;
        correctAnswer: string;
    }>;
}

function calculateDetailedScore(
    answers: Record<string, string>,
    questions: any[]
): ScoreData {
    const categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }> = {};
    const wrongQuestions: ScoreData['wrongQuestions'] = [];
    let totalCorrect = 0;

    for (const question of questions) {
        const category = question.category || 'General';
        const userAnswer = answers[question.id];
        const correctOption = question.options.find((opt: any) => opt.isCorrect);
        const isCorrect = correctOption && userAnswer === correctOption.text;

        if (isCorrect) {
            totalCorrect++;
        } else {
            // Track wrong questions with full details
            wrongQuestions.push({
                id: question.id,
                text: question.text,
                category,
                userAnswer: userAnswer || 'Not answered',
                correctAnswer: correctOption?.text || 'Unknown',
            });
        }

        // Track category stats
        if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = { correct: 0, total: 0, percentage: 0 };
        }
        categoryBreakdown[category].total++;
        if (isCorrect) {
            categoryBreakdown[category].correct++;
        }
    }

    // Calculate percentages for each category
    for (const category in categoryBreakdown) {
        const data = categoryBreakdown[category];
        data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    }

    return {
        totalCorrect,
        totalQuestions: questions.length,
        categoryBreakdown,
        wrongQuestions,
    };
}

async function findTestForStage(company: string, stageName: string) {
    const testMapping: Record<string, { company: string; topic?: string }> = {
        foundation: { company: 'TCS', topic: 'Foundation' },
        advanced: { company: 'TCS', topic: 'Advanced' },
        coding: { company: 'TCS', topic: 'Coding' },
        aptitude: { company: 'Wipro', topic: 'Aptitude' },
        essay: { company: 'Wipro', topic: 'Essay' },
    };

    const key = stageName.toLowerCase();
    const mapping = testMapping[key];

    if (!mapping) {
        return null;
    }

    const test = await prisma.test.findFirst({
        where: {
            type: 'company',
            company: mapping.company,
            OR: [
                { topic: mapping.topic },
                { title: { contains: mapping.topic, mode: 'insensitive' } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });

    return test;
}

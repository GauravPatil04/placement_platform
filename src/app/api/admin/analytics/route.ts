import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get top performers (users with highest average scores)
        const topPerformers = await prisma.user.findMany({
            where: {
                role: 'user',
                results: {
                    some: {}
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                results: {
                    select: {
                        score: true,
                        total: true
                    }
                }
            }
        });

        // Calculate average scores for each user
        const topPerformersWithStats = topPerformers
            .map(user => {
                const totalTests = user.results.length;
                const avgScore = totalTests > 0
                    ? Math.round(
                        user.results.reduce((sum: number, result) => {
                            const percentage = (result.score / result.total) * 100;
                            return sum + percentage;
                        }, 0) / totalTests
                    )
                    : 0;

                return {
                    id: user.id,
                    name: user.name || user.email,
                    tests: totalTests,
                    avgScore
                };
            })
            .filter(user => user.tests > 0)
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 10); // Top 10 performers

        // Get topic performance (for aptitude tests)
        const topicTests = await prisma.test.findMany({
            where: {
                type: 'topic'
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                results: {
                    select: {
                        score: true,
                        total: true
                    }
                }
            }
        });

        const topicPerformance = topicTests
            .map(test => {
                const totalAttempts = test.results.length;
                const avgScore = totalAttempts > 0
                    ? Math.round(
                        test.results.reduce((sum: number, result) => {
                            const percentage = (result.score / result.total) * 100;
                            return sum + percentage;
                        }, 0) / totalAttempts
                    )
                    : 0;

                return {
                    topic: test.title,
                    avgScore,
                    difficulty: test.difficulty || 'Medium',
                    attempts: totalAttempts
                };
            })
            .filter(topic => topic.attempts > 0)
            .sort((a, b) => b.attempts - a.attempts);

        // Get company performance (for company tests)
        const companyTests = await prisma.test.findMany({
            where: {
                type: 'company'
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                results: {
                    select: {
                        score: true,
                        total: true
                    }
                }
            }
        });

        const companyPerformance = companyTests
            .map(test => {
                const totalAttempts = test.results.length;
                const avgScore = totalAttempts > 0
                    ? Math.round(
                        test.results.reduce((sum: number, result) => {
                            const percentage = (result.score / result.total) * 100;
                            return sum + percentage;
                        }, 0) / totalAttempts
                    )
                    : 0;

                return {
                    company: test.title,
                    avgScore,
                    difficulty: test.difficulty || 'Medium',
                    attempts: totalAttempts
                };
            })
            .filter(company => company.attempts > 0)
            .sort((a, b) => b.attempts - a.attempts);

        return NextResponse.json({
            topPerformers: topPerformersWithStats,
            topicPerformance,
            companyPerformance
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}

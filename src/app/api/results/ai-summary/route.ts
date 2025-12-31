import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDetailedFieldAnalysis } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { score, totalQuestions, correct, wrong, testTitle, categoryBreakdown, wrongQuestions } = body;

        console.log('AI Summary request received:', {
            score,
            totalQuestions,
            correct,
            wrong,
            testTitle,
            categoryBreakdownKeys: Object.keys(categoryBreakdown),
            wrongQuestionsCount: wrongQuestions?.length || 0,
        });

        // Generate detailed field-wise analysis based on wrong questions
        const summary = await generateDetailedFieldAnalysis(
            {
                score,
                totalQuestions,
                correct,
                wrong,
                categoryBreakdown,
                wrongQuestions,
            },
            testTitle
        );

        console.log('AI Summary generated successfully, length:', summary.length);

        return NextResponse.json({
            success: true,
            summary,
        });
    } catch (error) {
        console.error('AI summary generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI summary', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

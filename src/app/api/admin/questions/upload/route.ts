import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // Check authorization
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const testId = formData.get('testId') as string;

        if (!file || !testId) {
            return NextResponse.json({ error: 'File and Test ID are required' }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Expected format: question,option1,option2,option3,option4,correctOption(1-4)

        let successCount = 0;
        let errorCount = 0;

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim());
            if (values.length < 6) {
                errorCount++;
                continue;
            }

            const [questionText, opt1, opt2, opt3, opt4, correctIndexStr] = values;
            const correctIndex = parseInt(correctIndexStr);

            if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
                errorCount++;
                continue;
            }

            try {
                await prisma.question.create({
                    data: {
                        testId,
                        text: questionText,
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: opt1, isCorrect: correctIndex === 1 },
                                { text: opt2, isCorrect: correctIndex === 2 },
                                { text: opt3, isCorrect: correctIndex === 3 },
                                { text: opt4, isCorrect: correctIndex === 4 },
                            ],
                        },
                    },
                });
                successCount++;
            } catch (e) {
                console.error('Error creating question:', e);
                errorCount++;
            }
        }

        return NextResponse.json({
            message: `Processed ${successCount} questions successfully. ${errorCount} errors.`,
            successCount,
            errorCount
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

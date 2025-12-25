import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch test and its questions
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;

        // Fetch test with questions and options
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            test: {
                id: test.id,
                title: test.title,
                company: test.company,
                description: test.description,
            },
            questions: test.questions || [],
        });
    } catch (error) {
        console.error('Error fetching test questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Add a question to a test
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const { text, options } = await req.json();

        if (!text || !options || !Array.isArray(options) || options.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify test exists
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found' },
                { status: 404 }
            );
        }

        // Create question with options
        const question = await prisma.question.create({
            data: {
                testId,
                text,
                type: 'multiple-choice',
                options: {
                    create: options.map((opt: { text: string; isCorrect: boolean }) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect || false,
                    })),
                },
            },
            include: {
                options: true,
            },
        });

        return NextResponse.json(
            { message: 'Question added successfully', question },
            { status: 201 }
        );
    } catch (error) {
        console.error('Question creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a question from a test
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get('questionId');

        if (!questionId) {
            return NextResponse.json(
                { error: 'Question ID required' },
                { status: 400 }
            );
        }

        // Verify question belongs to this test
        const question = await prisma.question.findFirst({
            where: {
                id: questionId,
                testId: testId,
            },
        });

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found in this test' },
                { status: 404 }
            );
        }

        // Delete question (options will be deleted automatically due to cascade)
        await prisma.question.delete({
            where: { id: questionId },
        });

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Question deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

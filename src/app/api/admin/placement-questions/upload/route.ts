import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CSVRow {
    text: string;
    type: string;
    category: string;
    difficulty: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    correctOption?: string;
    testCases?: string;
    sampleInput?: string;
    sampleOutput?: string;
    constraints?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const testId = formData.get('testId') as string;

        if (!file || !testId) {
            return NextResponse.json(
                { error: 'File and testId are required' },
                { status: 400 }
            );
        }

        // Verify test exists and is a company test
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test || test.type !== 'company') {
            return NextResponse.json(
                { error: 'Invalid test. Must be a company/placement test.' },
                { status: 400 }
            );
        }

        // Read CSV file
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json(
                { error: 'CSV file is empty or invalid' },
                { status: 400 }
            );
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Validate required headers
        const requiredHeaders = ['text', 'type', 'category'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json(
                { error: `Missing required headers: ${missingHeaders.join(', ')}` },
                { status: 400 }
            );
        }

        const questionsCreated: any[] = [];
        const errors: string[] = [];

        // Get the current max order for this test to maintain sequence
        const maxOrderQuestion = await prisma.question.findFirst({
            where: { testId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        let currentOrder = (maxOrderQuestion?.order ?? -1) + 1;

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = parseCSVLine(lines[i]);

                if (values.length === 0) continue;

                const row: any = {};
                headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || '';
                });

                // Validate required fields
                if (!row.text || !row.type || !row.category) {
                    errors.push(`Row ${i + 1}: Missing required fields (text, type, category)`);
                    continue;
                }

                // Create question based on type
                if (row.type === 'multiple-choice') {
                    // Validate MCQ fields
                    if (!row.option1 || !row.option2 || !row.option3 || !row.option4 || !row.correctoption) {
                        errors.push(`Row ${i + 1}: MCQ must have 4 options and correctOption`);
                        continue;
                    }

                    const correctIndex = parseInt(row.correctoption);
                    if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
                        errors.push(`Row ${i + 1}: correctOption must be 1, 2, 3, or 4`);
                        continue;
                    }

                    const question = await prisma.question.create({
                        data: {
                            testId,
                            text: row.text,
                            type: 'multiple-choice',
                            category: row.category,
                            difficulty: row.difficulty || null,
                            order: currentOrder,
                            options: {
                                create: [
                                    { text: row.option1, isCorrect: correctIndex === 1 },
                                    { text: row.option2, isCorrect: correctIndex === 2 },
                                    { text: row.option3, isCorrect: correctIndex === 3 },
                                    { text: row.option4, isCorrect: correctIndex === 4 },
                                ],
                            },
                        },
                        include: { options: true },
                    });

                    questionsCreated.push(question);
                    currentOrder++;
                } else if (row.type === 'coding') {
                    // Create coding question
                    const metadata: any = {};

                    if (row.testcases) metadata.testCases = row.testcases;
                    if (row.sampleinput) metadata.sampleInput = row.sampleinput;
                    if (row.sampleoutput) metadata.sampleOutput = row.sampleoutput;
                    if (row.constraints) metadata.constraints = row.constraints;

                    const question = await prisma.question.create({
                        data: {
                            testId,
                            text: row.text,
                            type: 'coding',
                            category: row.category,
                            difficulty: row.difficulty || null,
                            order: currentOrder,
                            metadata: Object.keys(metadata).length > 0 ? metadata : null,
                        },
                    });

                    questionsCreated.push(question);
                    currentOrder++;
                } else if (row.type === 'essay') {
                    // Create essay question
                    const question = await prisma.question.create({
                        data: {
                            testId,
                            text: row.text,
                            type: 'essay',
                            category: row.category,
                            difficulty: row.difficulty || null,
                            order: currentOrder,
                        },
                    });

                    questionsCreated.push(question);
                    currentOrder++;
                } else {
                    errors.push(`Row ${i + 1}: Invalid question type '${row.type}'. Must be 'multiple-choice', 'coding', or 'essay'`);
                }
            } catch (error: any) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        return NextResponse.json({
            message: `Successfully uploaded ${questionsCreated.length} questions`,
            created: questionsCreated.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        return NextResponse.json(
            { error: 'Failed to upload questions' },
            { status: 500 }
        );
    }
}

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result.map(v => v.trim().replace(/^"|"$/g, ''));
}

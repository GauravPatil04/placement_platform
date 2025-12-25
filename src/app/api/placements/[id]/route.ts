import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Await params in Next.js 15+
        const { id } = await params;

        const application = await prisma.placementApplication.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        tenthPercentage: true,
                        twelfthPercentage: true,
                        graduationCGPA: true,
                        backlogs: true,
                        gapYears: true,
                        gapDuringGrad: true,
                    },
                },
                eligibilityCheck: true,
                assessmentStages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        test: {
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                            },
                        },
                    },
                },
                voiceAssessment: true,
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Ensure user can only access their own application
        if (application.userId !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(application);
    } catch (error) {
        const { id } = await params;
        console.error("Error fetching application:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            applicationId: id
        });
        return NextResponse.json(
            {
                error: "Failed to fetch application",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

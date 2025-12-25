import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { company } = await request.json();

        if (!company || !["TCS", "Wipro"].includes(company)) {
            return NextResponse.json({ error: "Invalid company" }, { status: 400 });
        }

        // Check if user already has an active application for this company
        const existingApplication = await prisma.placementApplication.findFirst({
            where: {
                userId: session.user.id,
                company,
                status: {
                    notIn: ["rejected", "withdrawn", "completed"],
                },
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: "You already have an active application for this company" },
                { status: 400 }
            );
        }

        // Create new application
        const application = await prisma.placementApplication.create({
            data: {
                userId: session.user.id,
                company,
                status: "eligibility_check",
                currentStage: "eligibility",
            },
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("Error creating application:", error);
        return NextResponse.json(
            { error: "Failed to create application" },
            { status: 500 }
        );
    }
}

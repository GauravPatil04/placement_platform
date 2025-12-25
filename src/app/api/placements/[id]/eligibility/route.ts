import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface EligibilityData {
    tenthPercentage: number;
    twelfthPercentage: number;
    graduationCGPA: number;
    backlogs: number;
    gapYears: number;
    gapDuringGrad: boolean;
}

function checkEligibility(company: string, data: EligibilityData): { isEligible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Convert CGPA to percentage (assuming CGPA * 9.5 = percentage)
    const gradPercentage = data.graduationCGPA * 9.5;

    // Common criteria for both companies
    if (data.tenthPercentage < 60) {
        reasons.push("10th percentage is below 60%");
    }
    if (data.twelfthPercentage < 60) {
        reasons.push("12th percentage is below 60%");
    }
    if (gradPercentage < 60) {
        reasons.push("Graduation percentage is below 60% (CGPA < 6.0)");
    }
    if (data.backlogs > 1) {
        reasons.push("More than 1 active backlog");
    }

    // Company-specific criteria
    if (company === "TCS") {
        if (data.gapYears > 2) {
            reasons.push("Gap in education exceeds 24 months");
        }
    } else if (company === "Wipro") {
        if (data.gapYears > 3) {
            reasons.push("Gap before graduation exceeds 3 years");
        }
        if (data.gapDuringGrad) {
            reasons.push("Gap during graduation is not allowed");
        }
    }

    return {
        isEligible: reasons.length === 0,
        reasons,
    };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const application = await prisma.placementApplication.findUnique({
            where: { id },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Ensure user can only access their own application (or admin can access any)
        if (application.userId !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (application.status !== "eligibility_check") {
            return NextResponse.json(
                { error: "Eligibility check already completed" },
                { status: 400 }
            );
        }

        const data: EligibilityData = await request.json();

        // Validate data
        if (
            typeof data.tenthPercentage !== "number" ||
            typeof data.twelfthPercentage !== "number" ||
            typeof data.graduationCGPA !== "number" ||
            typeof data.backlogs !== "number" ||
            typeof data.gapYears !== "number" ||
            typeof data.gapDuringGrad !== "boolean"
        ) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Check eligibility
        const eligibilityResult = checkEligibility(application.company, data);

        // Update user's academic details
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                tenthPercentage: data.tenthPercentage,
                twelfthPercentage: data.twelfthPercentage,
                graduationCGPA: data.graduationCGPA,
                backlogs: data.backlogs,
                gapYears: data.gapYears,
                gapDuringGrad: data.gapDuringGrad,
            },
        });

        // Create eligibility check record
        await prisma.eligibilityCheck.create({
            data: {
                applicationId: id,
                tenthPercentage: data.tenthPercentage,
                twelfthPercentage: data.twelfthPercentage,
                graduationCGPA: data.graduationCGPA,
                backlogs: data.backlogs,
                gapYears: data.gapYears,
                gapDuringGrad: data.gapDuringGrad,
                isEligible: eligibilityResult.isEligible,
                rejectionReasons: eligibilityResult.reasons.join("; "),
            },
        });

        // Update application status
        const newStatus = eligibilityResult.isEligible
            ? (application.company === "TCS" ? "foundation" : "aptitude")
            : "rejected";

        const updatedApplication = await prisma.placementApplication.update({
            where: { id },
            data: {
                status: newStatus,
                eligibilityStatus: eligibilityResult.isEligible ? "eligible" : "rejected",
                currentStage: eligibilityResult.isEligible
                    ? (application.company === "TCS" ? "foundation" : "aptitude")
                    : null,
                finalDecision: eligibilityResult.isEligible ? undefined : "rejected",
            },
        });

        return NextResponse.json({
            application: updatedApplication,
            eligibility: eligibilityResult,
        });
    } catch (error) {
        console.error("Error processing eligibility check:", error);
        return NextResponse.json(
            { error: "Failed to process eligibility check" },
            { status: 500 }
        );
    }
}

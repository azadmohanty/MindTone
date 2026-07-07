import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const assessments = await prisma.assessment.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: "desc" },
    });

    // Calculate aggregate metrics
    const totalUsers = users.length;
    const totalAssessments = assessments.length;
    
    let avgPhq = 0;
    let avgGad = 0;
    if (totalAssessments > 0) {
      const sumPhq = assessments.reduce((acc: number, a: any) => acc + a.phq9Score, 0);
      const sumGad = assessments.reduce((acc: number, a: any) => acc + a.anxiety7Score, 0);
      avgPhq = parseFloat((sumPhq / totalAssessments).toFixed(1));
      avgGad = parseFloat((sumGad / totalAssessments).toFixed(1));
    }

    // Joint fusion outcomes distribution
    const decisions: Record<string, number> = {};
    const disorders: Record<string, number> = {};
    assessments.forEach((a: any) => {
      decisions[a.decision] = (decisions[a.decision] || 0) + 1;
      disorders[a.finalDisorder] = (disorders[a.finalDisorder] || 0) + 1;
    });

    return NextResponse.json({
      users,
      assessments,
      stats: {
        totalUsers,
        totalAssessments,
        avgPhq,
        avgGad,
        decisions,
        disorders
      }
    });
  } catch (error: any) {
    console.error("Admin Data API Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}

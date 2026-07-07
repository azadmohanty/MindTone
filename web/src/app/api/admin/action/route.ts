import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { action, id, role } = await request.json();

    if (action === "delete_assessment") {
      // Find the assessment first to get the audio filename
      const assessment = await prisma.assessment.findUnique({
        where: { id }
      });
      
      if (!assessment) {
        return NextResponse.json({ error: "Assessment record not found" }, { status: 404 });
      }

      // Purge the audio file from disk if it exists
      const audioFilename = `audio_${assessment.id}.webm`;
      const audioFilePath = path.join(process.cwd(), "public", "uploads", "audio", audioFilename);
      if (fs.existsSync(audioFilePath)) {
        try {
          fs.unlinkSync(audioFilePath);
        } catch (e) {
          console.warn("Failed to delete audio file:", e);
        }
      }

      // Purge matching PDF reports from outputs/reports if named customly
      if (assessment.pdfReportName && assessment.pdfReportName !== "Mental_Health_Report_Fallback.pdf" && assessment.pdfReportName !== "Mental_Health_Report.pdf") {
        const candidates = [
          path.join(process.cwd(), "..", "outputs", "reports", assessment.pdfReportName),
          path.join(process.cwd(), "outputs", "reports", assessment.pdfReportName)
        ];
        candidates.forEach(p => {
          if (fs.existsSync(p)) {
            try {
              fs.unlinkSync(p);
            } catch (e) {
              console.warn("Failed to delete PDF file:", e);
            }
          }
        });
      }

      // Delete from Prisma DB
      await prisma.assessment.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === "change_role") {
      // Prevent deleting or changing the admin's own role
      if (id === session.id) {
        return NextResponse.json({ error: "You cannot change your own admin role" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id },
        data: { role }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Action API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to perform admin action" }, { status: 500 });
  }
}

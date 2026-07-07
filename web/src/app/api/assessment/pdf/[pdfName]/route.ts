import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

interface RouteProps {
  params: Promise<{ pdfName: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { pdfName } = await params;

    if (!pdfName || pdfName.includes("..") || pdfName.includes("/")) {
      return NextResponse.json({ error: "Invalid report filename" }, { status: 400 });
    }

    // Locate the PDF file in the Python output reports directory, supporting multiple working directory contexts
    const candidates = [
      path.join(process.cwd(), "..", "outputs", "reports", pdfName),
      path.join(process.cwd(), "outputs", "reports", pdfName),
      path.join(process.cwd(), "web", "public", "uploads", "reports", pdfName),
      path.join(process.cwd(), "public", "uploads", "reports", pdfName)
    ];

    let finalPdfPath = "";
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        finalPdfPath = p;
        break;
      }
    }

    if (!finalPdfPath) {
      // 1. Try to recompile the PDF dynamically from the database record
      const { searchParams } = new URL(request.url);
      const assessmentId = searchParams.get("id");

      let assessment = null;
      if (assessmentId) {
        assessment = await prisma.assessment.findUnique({
          where: { id: assessmentId }
        });
      } else {
        // Search by pdfName if ID wasn't directly supplied
        assessment = await prisma.assessment.findFirst({
          where: { pdfReportName: pdfName },
          orderBy: { date: 'desc' }
        });
      }

      if (assessment) {
        try {
          const allTabular = JSON.parse(assessment.allTabularPredictions || "{}");
          const riskFlags = JSON.parse(assessment.riskFlags || "{}");
          
          // Reconstruct Top 3 list from stored tabular scores
          const sortedDisorders = Object.entries(allTabular)
            .map(([disorder, risk]) => ({ disorder, risk: parseFloat(risk as string || "0") }))
            .sort((a, b) => b.risk - a.risk)
            .slice(0, 3);
          
          const top3List = sortedDisorders.map((d, index) => ({
            rank: index + 1,
            disorder: d.disorder,
            risk: d.risk
          }));

          const compileRes = await fetch("http://127.0.0.1:8000/predict/recompile_pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              "Final Disorder": assessment.finalDisorder || "Normal",
              "Decision": assessment.decision || "Standard Clinical Protocol",
              "Audio Prediction": assessment.audioDisorder || "Normal",
              "Audio Confidence": assessment.audioConfidence || 0.0,
              "Top 3 Disorders": top3List.length > 0 ? top3List : [{ rank: 1, disorder: assessment.finalDisorder || "Normal", risk: 100.0 }],
              "Risk Flags": riskFlags
            })
          });

          if (compileRes.ok) {
            const compileData = await compileRes.json();
            const newPdfName = compileData.pdf_report_name;
            
            if (newPdfName) {
              const newCandidates = [
                path.join(process.cwd(), "..", "outputs", "reports", newPdfName),
                path.join(process.cwd(), "outputs", "reports", newPdfName)
              ];
              for (const p of newCandidates) {
                if (fs.existsSync(p)) {
                  finalPdfPath = p;
                  break;
                }
              }
              
              // Cache/save the new pdf filename to DB for subsequent direct loads
              if (finalPdfPath && assessmentId) {
                await prisma.assessment.update({
                  where: { id: assessmentId },
                  data: { pdfReportName: newPdfName }
                });
              }
            }
          }
        } catch (compileErr) {
          console.error("PDF Dynamic Recompilation failed:", compileErr);
        }
      }
    }

    if (!finalPdfPath) {
      // Fallback: If the requested PDF is not found, check if the generic Mental_Health_Report.pdf exists
      const genericPdfName = "Mental_Health_Report.pdf";
      const genericCandidates = [
        path.join(process.cwd(), "..", "outputs", "reports", genericPdfName),
        path.join(process.cwd(), "outputs", "reports", genericPdfName),
        path.join(process.cwd(), "web", "public", "uploads", "reports", genericPdfName),
        path.join(process.cwd(), "public", "uploads", "reports", genericPdfName)
      ];
      for (const p of genericCandidates) {
        if (fs.existsSync(p)) {
          finalPdfPath = p;
          break;
        }
      }
    }

    if (!finalPdfPath) {
      return NextResponse.json({ error: "PDF Report file not found on disk." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(finalPdfPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfName}"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Download API Error:", error);
    return NextResponse.json({ error: "Failed to read PDF report." }, { status: 500 });
  }
}

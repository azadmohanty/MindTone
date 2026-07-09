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

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    // Locate the PDF file in the Python output reports directory, supporting multiple working directory contexts
    const candidates = [
      path.join(process.cwd(), "..", "outputs", "reports", pdfName),
      path.join(process.cwd(), "outputs", "reports", pdfName),
      path.join(process.cwd(), "web", "public", "uploads", "reports", pdfName),
      path.join(process.cwd(), "public", "uploads", "reports", pdfName)
    ];

    let finalPdfPath = "";
    if (!force) {
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          finalPdfPath = p;
          break;
        }
      }
    }

    if (!finalPdfPath) {
      // 1. Try to recompile the PDF dynamically from the database record
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

          const backendUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
          const compileRes = await fetch(`${backendUrl}/predict/recompile_pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              "Final Disorder": assessment.finalDisorder || "Normal",
              "Decision": assessment.decision || "Standard Clinical Protocol",
              "Audio Prediction": assessment.audioDisorder || "Normal",
              "Audio Confidence": assessment.audioConfidence || 0.0,
              "Top 3 Disorders": top3List.length > 0 ? top3List : [{ rank: 1, disorder: assessment.finalDisorder || "Normal", risk: 100.0 }],
              "Risk Flags": riskFlags,
              pitch: assessment.pitch || 0.0,
              pitchVariability: assessment.pitchVariability || 0.0,
              speechRate: assessment.speechRate || 0.0,
              pauseDuration: assessment.pauseDuration || 0.0,
              jitter: assessment.jitter || 0.0,
              shimmer: assessment.shimmer || 0.0,
              hnr: assessment.hnr || 0.0,
              feelingOfLoneliness: assessment.feelingOfLoneliness || "No",
              feelingUnderstood: assessment.feelingUnderstood || "Yes",
              familyDynamics: assessment.familyDynamics || "Stable",
              maritalAndFamilyConflict: assessment.maritalAndFamilyConflict || "None",
              emotionalSupport: assessment.emotionalSupport || "Available",
              socialInteraction: assessment.socialInteraction || "High",
              socialFear: assessment.socialFear || "Low",
              sleepPattern: assessment.sleepPattern || "Normal",
              overthinking: assessment.overthinking || "No"
            })
          });

          if (compileRes.ok) {
            const compileData = await compileRes.json();
            const newPdfName = compileData.pdf_report_name;
            
            if (newPdfName) {
              // Cache/save the new pdf filename to DB for subsequent direct loads
              if (assessmentId) {
                await prisma.assessment.update({
                  where: { id: assessmentId },
                  data: { pdfReportName: newPdfName }
                });
              }

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

              // If running on serverless (Vercel) where the file isn't local, fetch from Render directly
              if (!finalPdfPath) {
                const downloadRes = await fetch(`${backendUrl}/download_pdf/${newPdfName}`);
                if (downloadRes.ok) {
                  const arrayBuffer = await downloadRes.arrayBuffer();
                  const fileBuffer = Buffer.from(arrayBuffer);
                  return new NextResponse(fileBuffer, {
                    headers: {
                      "Content-Type": "application/pdf",
                      "Content-Disposition": `attachment; filename="${newPdfName}"`,
                    },
                  });
                }
              }
            }
          }
        } catch (compileErr) {
          console.error("PDF Dynamic Recompilation failed:", compileErr);
        }
      }
    }

    if (!finalPdfPath) {
      // 2. Try to download the PDF directly from the Python backend server
      try {
        const backendUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
        const downloadRes = await fetch(`${backendUrl}/download_pdf/${pdfName}`);
        if (downloadRes.ok) {
          const arrayBuffer = await downloadRes.arrayBuffer();
          const fileBuffer = Buffer.from(arrayBuffer);
          return new NextResponse(fileBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${pdfName}"`,
            },
          });
        }
      } catch (downloadErr) {
        console.error("Failed to download PDF from Python backend:", downloadErr);
      }

      // Fallback: Check if the generic Mental_Health_Report.pdf exists locally
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

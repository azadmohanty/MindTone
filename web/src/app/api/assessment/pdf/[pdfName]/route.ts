import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import fs from "fs";
import path from "path";

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

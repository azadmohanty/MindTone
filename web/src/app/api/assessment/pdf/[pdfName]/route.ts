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

    // Locate the PDF file in the Python output reports directory
    const pdfPath = path.join(process.cwd(), "..", "outputs", "reports", pdfName);

    if (!fs.existsSync(pdfPath)) {
      // Fallback check in case the path is resolved slightly differently
      const altPdfPath = path.resolve(process.cwd(), "public", "uploads", "reports", pdfName);
      if (!fs.existsSync(altPdfPath)) {
        return NextResponse.json({ error: "PDF Report file not found on disk." }, { status: 404 });
      }
      
      const fileBuffer = fs.readFileSync(altPdfPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${pdfName}"`,
        },
      });
    }

    const fileBuffer = fs.readFileSync(pdfPath);

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

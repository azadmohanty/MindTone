import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { AlertTriangle, Shield } from "lucide-react";
import ReportDetails from "@/components/ReportDetails";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let assessment = null;
  try {
    assessment = await prisma.assessment.findUnique({
      where: { id: id }
    });
  } catch (e) {
    console.error("Failed to query report:", e);
  }

  if (!assessment) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Check-in Report Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The check-in record does not exist or may have been deleted.</p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Security Access Control Check
  if (assessment.userId !== session.id && session.role !== "ADMIN") {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <Shield className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-500 font-medium">You do not have authorization to view this assessment report.</p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-indigo-650 hover:bg-indigo-505 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Audio Reflection presence check
  const audioFilename = `audio_${assessment.id}.webm`;
  const localAudioPath = path.join(process.cwd(), "public", "uploads", "audio", audioFilename);
  const hasAudio = fs.existsSync(localAudioPath);
  const audioUrl = `/uploads/audio/${audioFilename}`;

  return (
    <ReportDetails 
      assessment={assessment as any} 
      hasAudio={hasAudio} 
      audioUrl={audioUrl} 
    />
  );
}

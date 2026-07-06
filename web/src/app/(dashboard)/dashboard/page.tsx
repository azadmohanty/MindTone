import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { 
  ClipboardList, 
  History, 
  Activity, 
  Calendar,
  AlertCircle
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  let assessmentCount = 0;
  let latestAssessment = null;

  if (session) {
    try {
      assessmentCount = await prisma.assessment.count({
        where: { userId: session.id }
      });
      latestAssessment = await prisma.assessment.findFirst({
        where: { userId: session.id },
        orderBy: { date: "desc" }
      });
    } catch (e) {
      console.error("Failed to query dashboard database stats:", e);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcome Header Banner */}
      <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/20">
            Overview Panel
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight pt-2">
            Hello, {session?.name || "User"}
          </h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Access your clinically-backed questionnaire analytics, review voice analysis reports, or record a new screening today.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-slate-900/60 border border-slate-800/65 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Reports</p>
            <h3 className="text-2xl font-bold text-white mt-1">{assessmentCount}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 border border-slate-800/65 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-purple-950/60 border border-purple-500/20 text-purple-400 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Diagnosis</p>
            <h3 className="text-sm font-bold text-white mt-1.5 truncate max-w-[160px]">
              {latestAssessment ? latestAssessment.finalDisorder : "No reports yet"}
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 border border-slate-800/65 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Assessment</p>
            <h3 className="text-sm font-bold text-white mt-1.5">
              {latestAssessment ? latestAssessment.date.toDateString() : "Never"}
            </h3>
          </div>
        </div>

      </div>

      {/* 3. Focus Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: Call to Action */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-slate-800/70 p-8 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Record New Screening</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take a comprehensive mental health assessment. Our dual questionnaire and speech classification engine will evaluate clinical flags in real-time.
            </p>
          </div>
          <Link
            href="/survey"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl text-center shadow-lg shadow-indigo-600/10 transition active:scale-[0.98]"
          >
            Start Assessment
          </Link>
        </div>

        {/* Column 2: Quick History Preview */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold text-white">Recent Record Preview</h3>
          
          {latestAssessment ? (
            <div className="bg-slate-950 border border-slate-800/50 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-400 font-semibold">{latestAssessment.date.toLocaleDateString()}</span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {latestAssessment.decision}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition Assessment</p>
                <p className="text-base font-bold text-white mt-0.5">{latestAssessment.finalDisorder}</p>
              </div>
              <div className="flex gap-4 pt-1 text-xs text-slate-400">
                <p>PHQ-9 Score: <span className="text-indigo-400 font-bold">{latestAssessment.phq9Score}</span></p>
                <p>Anxiety-7 Score: <span className="text-indigo-400 font-bold">{latestAssessment.anxiety7Score}</span></p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-4">
              <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium">No diagnostic history available.</p>
            </div>
          )}

          <Link
            href="/history"
            className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
          >
            View Full Assessment History →
          </Link>
        </div>

      </div>

    </div>
  );
}

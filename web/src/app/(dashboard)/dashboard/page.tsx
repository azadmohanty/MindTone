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
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans">
      
      {/* 1. Welcome Header Banner */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm relative">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded border border-indigo-100">
            Overview Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            Hello, {session?.name || "User"}
          </h1>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed font-medium">
            Access your clinically-backed questionnaire analytics, review voice analysis reports, or record a new screening today.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Reports</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{assessmentCount}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Diagnosis</p>
            <h3 className="text-xs font-bold text-slate-900 mt-1.5 truncate max-w-[165px]">
              {latestAssessment ? latestAssessment.finalDisorder : "No reports yet"}
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Assessment</p>
            <h3 className="text-xs font-bold text-slate-900 mt-1.5">
              {latestAssessment ? latestAssessment.date.toDateString() : "Never"}
            </h3>
          </div>
        </div>

      </div>

      {/* 3. Focus Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: Call to Action */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-900">Record New Screening</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Take a comprehensive mental health assessment. Our dual questionnaire and speech classification engine will evaluate clinical flags in real-time.
            </p>
          </div>
          <Link
            href="/survey"
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition active:scale-[0.98] shadow-md shadow-indigo-600/10"
          >
            Start Assessment
          </Link>
        </div>

        {/* Column 2: Quick History Preview */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] space-y-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Record Preview</h3>
          
          {latestAssessment ? (
            <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 font-bold">{latestAssessment.date.toLocaleDateString()}</span>
                <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {latestAssessment.decision}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition Assessment</p>
                <p className="text-sm font-bold text-slate-950 mt-0.5">{latestAssessment.finalDisorder}</p>
              </div>
              <div className="flex gap-4 pt-1 text-xs text-slate-500">
                <p>PHQ-9 Score: <span className="text-indigo-600 font-bold">{latestAssessment.phq9Score}</span></p>
                <p>Anxiety-7 Score: <span className="text-indigo-600 font-bold">{latestAssessment.anxiety7Score}</span></p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
              <AlertCircle className="h-7 w-7 text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No diagnostic history available.</p>
            </div>
          )}

          <Link
            href="/history"
            className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-500 transition"
          >
            View Full Assessment History →
          </Link>
        </div>

      </div>

    </div>
  );
}

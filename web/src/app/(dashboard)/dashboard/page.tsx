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
    <div className="space-y-8 animate-fade-in text-slate-200">
      
      {/* 1. Welcome Header Banner */}
      <div className="bg-[#161a22] border border-slate-800/80 p-8 rounded-2xl relative">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-bold text-[#8fbc8f] uppercase tracking-widest bg-[#5b7a61]/10 px-3 py-1 rounded border border-[#5b7a61]/20">
            Overview Panel
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight pt-2">
            Hello, {session?.name || "User"}
          </h1>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Access your clinically-backed questionnaire analytics, review voice analysis reports, or record a new screening today.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#161a22] border border-slate-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-[#5b7a61]/10 border border-[#5b7a61]/20 text-[#8fbc8f] rounded-lg">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Reports</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{assessmentCount}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#161a22] border border-slate-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-[#5b7a61]/10 border border-[#5b7a61]/20 text-[#8fbc8f] rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latest Diagnosis</p>
            <h3 className="text-xs font-bold text-white mt-1.5 truncate max-w-[165px]">
              {latestAssessment ? latestAssessment.finalDisorder : "No reports yet"}
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#161a22] border border-slate-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-[#5b7a61]/10 border border-[#5b7a61]/20 text-[#8fbc8f] rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Assessment</p>
            <h3 className="text-xs font-bold text-white mt-1.5">
              {latestAssessment ? latestAssessment.date.toDateString() : "Never"}
            </h3>
          </div>
        </div>

      </div>

      {/* 3. Focus Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: Call to Action */}
        <div className="bg-[#161a22] border border-slate-800 p-8 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Record New Screening</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take a comprehensive mental health assessment. Our dual questionnaire and speech classification engine will evaluate clinical flags in real-time.
            </p>
          </div>
          <Link
            href="/survey"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#5b7a61] hover:bg-[#4b6651] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition active:scale-[0.98] shadow-sm"
          >
            Start Assessment
          </Link>
        </div>

        {/* Column 2: Quick History Preview */}
        <div className="bg-[#161a22] border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white">Recent Record Preview</h3>
          
          {latestAssessment ? (
            <div className="bg-[#0e1115] border border-slate-800/80 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-500 font-bold">{latestAssessment.date.toLocaleDateString()}</span>
                <span className="text-[9px] font-bold text-[#8fbc8f] bg-[#5b7a61]/10 border border-[#5b7a61]/20 px-2 py-0.5 rounded">
                  {latestAssessment.decision}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition Assessment</p>
                <p className="text-sm font-bold text-white mt-0.5">{latestAssessment.finalDisorder}</p>
              </div>
              <div className="flex gap-4 pt-1 text-xs text-slate-400">
                <p>PHQ-9 Score: <span className="text-[#8fbc8f] font-bold">{latestAssessment.phq9Score}</span></p>
                <p>Anxiety-7 Score: <span className="text-[#8fbc8f] font-bold">{latestAssessment.anxiety7Score}</span></p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800 rounded-xl p-4">
              <AlertCircle className="h-7 w-7 text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No diagnostic history available.</p>
            </div>
          )}

          <Link
            href="/history"
            className="block text-center text-xs font-bold text-[#8fbc8f] hover:text-[#a9dfa9] transition"
          >
            View Full Assessment History →
          </Link>
        </div>

      </div>

    </div>
  );
}

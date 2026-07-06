import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Calendar, 
  ChevronRight, 
  FileText,
  Mic, 
  AlertCircle
} from "lucide-react";

export default async function HistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let assessments: any[] = [];
  try {
    assessments = await prisma.assessment.findMany({
      where: { userId: session.id },
      orderBy: { date: "desc" }
    });
  } catch (e) {
    console.error("Failed to query history list:", e);
  }

  // Helper to color-code risk badges
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "Priority Clinical Screening":
        return "bg-rose-50 border border-rose-200 text-rose-700";
      case "Enhanced Supportive Care":
        return "bg-amber-50 border border-amber-200 text-amber-700";
      default:
        return "bg-emerald-50 border border-emerald-200 text-emerald-700";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 px-8 py-6 rounded-[2rem] shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded border border-indigo-100">
            Records Timeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            My Check-in History
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Review your historical wellbeing scores and vocal reflections over time.
          </p>
        </div>
      </div>

      {/* 2. Timeline List */}
      {assessments.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pl-6 space-y-6">
          {assessments.map((record) => (
            <div key={record.id} className="relative group animate-fade-in">
              
              {/* Point Indicator dot */}
              <span className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm z-10 group-hover:scale-125 transition-transform" />

              {/* Assessment Item Card */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition duration-200 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6">
                
                <div className="space-y-4">
                  {/* Date & Action Pathway status */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {record.date.toLocaleDateString()} {record.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${getDecisionBadge(record.decision)}`}>
                      {record.decision}
                    </span>
                  </div>

                  {/* Diagnosis and scores summary */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment Result</p>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{record.finalDisorder}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">PHQ-9 (Mood):</span>
                      <span className="text-slate-800 font-bold">{record.phq9Score}</span>
                    </div>
                    <span className="text-slate-250">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">GAD-7 (Anxiety):</span>
                      <span className="text-slate-800 font-bold">{record.anxiety7Score}</span>
                    </div>
                    <span className="text-slate-250">|</span>
                    <div className="flex items-center gap-1 text-[#6366f1]">
                      <Mic className="h-3.5 w-3.5" />
                      <span className="font-bold text-[10px] uppercase tracking-wider">{record.audioDisorder} voice sample</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Redirect Button */}
                <div>
                  <Link
                    href={`/dashboard/report/${record.id}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.98] w-full md:w-auto"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Report
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-12 text-center shadow-sm space-y-4 max-w-md mx-auto mt-6">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">No records found</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              You haven't recorded any mental health check-ins yet. Let's start with your first check-in to get insight into your current wellbeing.
            </p>
          </div>
          <Link
            href="/survey"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-600/10"
          >
            Start First Check-in
          </Link>
        </div>
      )}

    </div>
  );
}

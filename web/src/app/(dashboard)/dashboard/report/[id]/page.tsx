import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { 
  Calendar, 
  ArrowLeft, 
  Mic, 
  Award, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield
} from "lucide-react";

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
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
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

  // PHQ-9 (Mood/Depression Tiers)
  const getPhqTier = (score: number) => {
    if (score <= 4) return { label: "Minimal (No flags)", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (score <= 9) return { label: "Mild mood flags", color: "text-slate-600 bg-slate-100 border-slate-200" };
    if (score <= 14) return { label: "Moderate mood flags", color: "text-amber-600 bg-amber-50 border-amber-100" };
    if (score <= 19) return { label: "Moderately Severe flags", color: "text-rose-500 bg-rose-50 border-rose-100" };
    return { label: "Severe mood flags", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  // GAD-7 (Stress/Anxiety Tiers)
  const getGadTier = (score: number) => {
    if (score <= 4) return { label: "Minimal stress", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (score <= 9) return { label: "Mild stress", color: "text-slate-600 bg-slate-100 border-slate-200" };
    if (score <= 14) return { label: "Moderate stress", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Severe stress flags", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const getDecisionPathways = (decision: string) => {
    switch (decision) {
      case "Priority Clinical Screening":
        return {
          badge: "bg-rose-50 border border-rose-200 text-rose-700",
          guide: "Your check-in details and vocal reflection indicate highly elevated stress, worry, or deep mood flags. We strongly recommend seeking professional medical care. Connecting with a psychologist, healthcare counselor, or a supportive doctor is a courageous step toward healing. You do not have to carry this alone."
        };
      case "Enhanced Supportive Care":
        return {
          badge: "bg-amber-50 border border-amber-200 text-amber-700",
          guide: "Your check-in details reflect moderate levels of mood changes or worry. We recommend adopting restorative daily wellness practices: scheduling consistent sleep patterns, exercising, and scheduling time to talk with close friends or counselors to find balance."
        };
      default:
        return {
          badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
          guide: "Your recent check-in details suggest a stable and healthy emotional baseline. Keep engaging in positive habits, staying active, and connecting with those you love. We are always here whenever you want to check in again!"
        };
    }
  };

  const phqTier = getPhqTier(assessment.phq9Score);
  const gadTier = getGadTier(assessment.anxiety7Score);
  const pathDetails = getDecisionPathways(assessment.decision);

  const phqPct = Math.round((assessment.phq9Score / 27) * 100);
  const gadPct = Math.round((assessment.anxiety7Score / 21) * 100);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans max-w-4xl mx-auto">
      
      {/* Back & Download actions */}
      <div className="flex justify-between items-center">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>

        {assessment.pdfReportName && (
          <a
            href={`/api/assessment/pdf/${assessment.pdfReportName}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-505 text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm active:scale-[0.98]"
          >
            Download PDF Report
          </a>
        )}
      </div>

      {/* 1. Header Card */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
              Wellness Check-in Record
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              Assessment Summary
            </h1>
          </div>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md ${pathDetails.badge}`}>
            {assessment.decision}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            {assessment.date.toLocaleDateString()}
          </span>
          <span className="text-slate-200">•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-slate-400" />
            {assessment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-slate-200">•</span>
          <span className="text-slate-400">ID: {assessment.id}</span>
        </div>
      </div>

      {/* 2. Visual Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PHQ-9 (Mood assessment details) */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Mood Indicator (PHQ-9)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Questionnaire 1</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${phqTier.color}`}>
              {phqTier.label}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Score Level</span>
              <span className="text-indigo-650 font-extrabold">{assessment.phq9Score} / 27</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-lg overflow-hidden border border-slate-200/40">
              <div className="bg-indigo-500 h-full rounded-lg transition-all duration-300" style={{ width: `${phqPct}%` }} />
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            The Patient Health Questionnaire (PHQ-9) is a standardized test representing emotional states like interest levels, energy, sleep disturbances, and general baseline mood over the past two weeks.
          </p>
        </div>

        {/* GAD-7 (Anxiety assessment details) */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Stress & Worry (GAD-7)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Questionnaire 2</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${gadTier.color}`}>
              {gadTier.label}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Score Level</span>
              <span className="text-indigo-650 font-extrabold">{assessment.anxiety7Score} / 21</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-lg overflow-hidden border border-slate-200/40">
              <div className="bg-indigo-500 h-full rounded-lg transition-all duration-300" style={{ width: `${gadPct}%` }} />
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            The Generalized Anxiety Disorder scale (GAD-7) monitors symptoms of daily stress, physical restlessness, irritability, and difficulties managing persistent overthinking.
          </p>
        </div>

      </div>

      {/* 3. Voice Biomarker Feedback (Speech Analysis) */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Voice Reflection Biomarkers</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Speech Classification Output</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone Classification</p>
              <h4 className="text-base font-extrabold text-slate-900">{assessment.audioDisorder} Speech Flow</h4>
            </div>
            
            {hasAudio && (
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Listen to reflection</p>
                <audio src={audioUrl} controls className="h-8 max-w-full accent-indigo-600 rounded-lg" />
              </div>
            )}
          </div>

          <div className="space-y-3 font-medium text-xs text-slate-500 leading-relaxed">
            <p>
              Vocal biomarker analysis monitors specific qualities in human speech:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-650">
              <li><strong>Prosody & Pitch:</strong> Variations in frequency that correlate with energy or flat emotional states.</li>
              <li><strong>Pause Frequency:</strong> Hesitancy, speaking speed, or vocal latency that shifts under anxiety or fatigue.</li>
              <li><strong>Formant dispersion:</strong> Resonance indicators correlating with muscle tension in speech production.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* 4. Multimodal Recommendation Care Pathway */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Care Path Recommendation</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joint Classification synthesis</p>
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joint Classifier Output</p>
            <h4 className="text-lg font-extrabold text-[#6366f1]">{assessment.finalDisorder}</h4>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {pathDetails.guide}
          </p>
        </div>
      </div>

      {/* 5. Advanced Analysis & SHAP Explainability */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Advanced Explainability & Risk Matrix</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SHAP Feature Contributions & Personal Stress Factors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Loneliness Risk Card */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Loneliness Risk Index</h4>
            <div>
              {assessment.feelingOfLoneliness === "Yes" ? (
                <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
                  High Loneliness Risk
                </span>
              ) : assessment.feelingOfLoneliness === "Sometimes" || assessment.feelingUnderstood === "Sometimes" || assessment.feelingUnderstood === "No" ? (
                <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase">
                  Moderate Loneliness Risk
                </span>
              ) : (
                <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                  Low Loneliness Risk
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Based on self-reported feelings of isolation and how understood you feel by those close to you.
            </p>
          </div>

          {/* Family Dynamics Card */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Family Factor Influence</h4>
            <div>
              {assessment.familyDynamics === "Dysfunctional" || assessment.maritalAndFamilyConflict === "Frequent" || assessment.emotionalSupport === "Unavailable" ? (
                <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
                  Challenging Home Environment
                </span>
              ) : assessment.maritalAndFamilyConflict === "Occasional" || assessment.financialStress === "High" || assessment.financialStress === "Moderate" ? (
                <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase">
                  Moderate Environment Stress
                </span>
              ) : (
                <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                  Stable Support Network
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Calculates home environment variables like family conflict, support structures, and financial stress levels.
            </p>
          </div>

          {/* Coping & Social Card */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Coping & Social Index</h4>
            <div>
              {assessment.socialInteraction === "Low" && assessment.socialFear === "High" ? (
                <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
                  Social Avoidance Pattern
                </span>
              ) : assessment.socialFear === "Moderate" || assessment.socialInteraction === "Low" ? (
                <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase">
                  Moderate Isolation Risk
                </span>
              ) : (
                <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                  Healthy Social Outlets
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Evaluates comfort levels in social scenarios and your regular connections with supportive groups.
            </p>
          </div>

        </div>

        {/* SHAP Explanation */}
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">SHAP (SHapley Additive exPlanations) Model Contributions</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              SHAP is a game-theoretic approach that attributes local feature contributions to the output of our CatBoost tabular model. It highlights which responses had the greatest impact on your assessment profile:
            </p>
          </div>

          <div className="space-y-3">
            {/* Factor 1: Overthinking */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Cognitive Loop (Overthinking)</span>
                <span className="text-rose-600 font-bold">{assessment.overthinking === "Yes" ? "+28.4% (Major Contributor)" : assessment.overthinking === "Sometimes" ? "+12.1% (Moderate Contributor)" : "0.0% (No Impact)"}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${assessment.overthinking === "Yes" ? "bg-rose-500" : "bg-amber-400"}`} 
                  style={{ width: assessment.overthinking === "Yes" ? "85%" : assessment.overthinking === "Sometimes" ? "40%" : "0%" }} 
                />
              </div>
            </div>

            {/* Factor 2: Sleep Pattern */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Sleep Disruption (Fatigue Index)</span>
                <span className="text-rose-600 font-bold">{assessment.sleepPattern !== "Normal" ? "+19.8% (Elevates Fatigue)" : "0.0% (Restorative)"}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${assessment.sleepPattern !== "Normal" ? "bg-rose-500" : "bg-emerald-500"}`} 
                  style={{ width: assessment.sleepPattern !== "Normal" ? "65%" : "0%" }} 
                />
              </div>
            </div>

            {/* Factor 3: Emotional Support Net */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Emotional Support Net</span>
                <span className={`${assessment.emotionalSupport === "Available" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}`}>
                  {assessment.emotionalSupport === "Available" ? "-22.5% (Protective Factor)" : assessment.emotionalSupport === "Partial Available" ? "-8.3% (Moderate Protection)" : "+15.2% (Risk Factor)"}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${assessment.emotionalSupport === "Available" ? "bg-emerald-500" : "bg-rose-500"}`} 
                  style={{ width: assessment.emotionalSupport === "Available" ? "75%" : assessment.emotionalSupport === "Partial Available" ? "30%" : "50%" }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Clinical Safety & Support Helplines */}
      <div className="bg-rose-500/5 border border-rose-200/60 p-8 rounded-[2rem] space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">Are you in distress or need immediate support?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              If you are feeling overwhelmed, having thoughts of self-harm, or are in crisis, help is available for you 24 hours a day. Speaking with someone can provide immediate ease.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="bg-white border border-rose-100 p-4 rounded-xl space-y-1.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800">988 Suicide & Crisis Lifeline</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Available 24/7. Call or text 988. Free, confidential support in English and Spanish.</p>
            <a 
              href="https://988lifeline.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline pt-1"
            >
              Visit Website
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="bg-white border border-rose-100 p-4 rounded-xl space-y-1.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800">Crisis Text Line</h4>
            <p className="text-[11px] text-slate-500 leading-snug">Text HOME to 741741 to connect with a crisis counselor 24/7. Free and confidential.</p>
            <a 
              href="https://www.crisistextline.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline pt-1"
            >
              Visit Website
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}

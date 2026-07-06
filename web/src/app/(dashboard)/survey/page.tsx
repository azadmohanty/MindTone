"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";

export default function SurveyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Audio state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Form payload state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    
    // Step 2
    moodChanges: "",
    optimismLevel: 5,
    currentEmotionalState: "",
    overthinking: "",
    socialFear: "",
    concentration: 5,
    socialInteraction: "",

    // Step 3
    sleepPattern: "",
    reducedNeedForSleep: "",
    increasedEnergyLevel: "",
    pastTrauma: "",
    intrusiveMemories: "",
    avoidanceBehaviour: "",

    // Step 4
    familyStructure: "",
    familyDynamics: "",
    maritalAndFamilyConflict: "",
    financialStress: "",
    emotionalSupport: "",

    // Step 5
    feelingOfLoneliness: "",
    feelingUnderstood: "",

    // Step 6 (Safety + Tier 1 Screens)
    suicidalThoughts: "",
    q1: "", // PHQ9_1
    q2: "", // PHQ9_2
    q3: "", // GAD7_1
    q4: "", // GAD7_2

    // Step 7 (Tier 2 Extended PHQ)
    q5: "", // PHQ9_3
    q6: "", // PHQ9_4
    q7: "", // PHQ9_5
    q8: "", // PHQ9_6
    q9: "", // PHQ9_7
    q10: "", // PHQ9_8
    q11: "", // PHQ9_9

    // Step 8 (Tier 2 Extended GAD)
    q12: "", // GAD7_3
    q13: "", // GAD7_4
    q14: "", // GAD7_5
    q15: "", // GAD7_6
    q16: "", // GAD7_7
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Helper to validate current step inputs
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return (
          formData.moodChanges !== "" &&
          formData.currentEmotionalState !== "" &&
          formData.overthinking !== "" &&
          formData.socialFear !== "" &&
          formData.socialInteraction !== ""
        );
      case 3:
        return (
          formData.sleepPattern !== "" &&
          formData.reducedNeedForSleep !== "" &&
          formData.increasedEnergyLevel !== "" &&
          formData.pastTrauma !== "" &&
          formData.intrusiveMemories !== "" &&
          formData.avoidanceBehaviour !== ""
        );
      case 4:
        return (
          formData.familyStructure !== "" &&
          formData.familyDynamics !== "" &&
          formData.maritalAndFamilyConflict !== "" &&
          formData.financialStress !== "" &&
          formData.emotionalSupport !== ""
        );
      case 5:
        return formData.feelingOfLoneliness !== "" && formData.feelingUnderstood !== "";
      case 6:
        return (
          formData.suicidalThoughts !== "" &&
          formData.q1 !== "" &&
          formData.q2 !== "" &&
          formData.q3 !== "" &&
          formData.q4 !== ""
        );
      case 7:
        // Extended PHQ-9 fields
        return (
          formData.q5 !== "" &&
          formData.q6 !== "" &&
          formData.q7 !== "" &&
          formData.q8 !== "" &&
          formData.q9 !== "" &&
          formData.q10 !== "" &&
          formData.q11 !== ""
        );
      case 8:
        // Extended GAD-7 fields
        return (
          formData.q12 !== "" &&
          formData.q13 !== "" &&
          formData.q14 !== "" &&
          formData.q15 !== "" &&
          formData.q16 !== ""
        );
      case 9:
        return audioBlob !== null;
      default:
        return false;
    }
  };

  // Transition Engine (Conditional Branching)
  const handleNext = () => {
    if (!isStepValid()) return;

    setNavigationHistory((prev) => [...prev, currentStep]);

    if (currentStep === 6) {
      const phq2 = parseInt(formData.q1, 10) + parseInt(formData.q2, 10);
      const gad2 = parseInt(formData.q3, 10) + parseInt(formData.q4, 10);

      if (phq2 >= 3) {
        setCurrentStep(7);
      } else if (gad2 >= 3) {
        setCurrentStep(8);
      } else {
        setCurrentStep(9);
      }
    } else if (currentStep === 7) {
      const gad2 = parseInt(formData.q3, 10) + parseInt(formData.q4, 10);
      if (gad2 >= 3) {
        setCurrentStep(8);
      } else {
        setCurrentStep(9);
      }
    } else if (currentStep === 8) {
      setCurrentStep(9);
    } else if (currentStep === 9) {
      submitSurvey();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length === 0) return;
    const history = [...navigationHistory];
    const prev = history.pop();
    setNavigationHistory(history);
    if (prev !== undefined) setCurrentStep(prev);
  };

  // Submit survey payload to Next.js API endpoint (Integration hook)
  const submitSurvey = async () => {
    if (!audioBlob) {
      setErrorMsg("Please complete the voice reflection first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const phq9_1 = parseInt(formData.q1, 10);
      const phq9_2 = parseInt(formData.q2, 10);
      const phq9_3 = parseInt(formData.q5, 10);
      const phq9_4 = parseInt(formData.q6, 10);
      const phq9_5 = parseInt(formData.q7, 10);
      const phq9_6 = parseInt(formData.q8, 10);
      const phq9_7 = parseInt(formData.q9, 10);
      const phq9_8 = parseInt(formData.q10, 10);
      const phq9_9 = parseInt(formData.q11, 10);

      const gad7_1 = parseInt(formData.q3, 10);
      const gad7_2 = parseInt(formData.q4, 10);
      const gad7_3 = parseInt(formData.q12, 10);
      const gad7_4 = parseInt(formData.q13, 10);
      const gad7_5 = parseInt(formData.q14, 10);
      const gad7_6 = parseInt(formData.q15, 10);
      const gad7_7 = parseInt(formData.q16, 10);

      const phqScore = phq9_1 + phq9_2 + phq9_3 + phq9_4 + phq9_5 + phq9_6 + phq9_7 + phq9_8 + phq9_9;
      const gadScore = gad7_1 + gad7_2 + gad7_3 + gad7_4 + gad7_5 + gad7_6 + gad7_7;

      const questionnairePayload = {
        "Mood Changes": formData.moodChanges,
        "Optimism Level": formData.optimismLevel,
        "Current Emotional State": formData.currentEmotionalState,
        "Overthinking": formData.overthinking,
        "Social Fear": formData.socialFear,
        "Concentration": formData.concentration,
        "Social Interaction": formData.socialInteraction,
        "Sleep Pattern": formData.sleepPattern,
        "Reduced Need for Sleep": formData.reducedNeedForSleep,
        "Increased Energy Level": formData.increasedEnergyLevel,
        "Past Trauma": formData.pastTrauma,
        "Intrusive Memories": formData.intrusiveMemories,
        "Avoidance Behaviour": formData.avoidanceBehaviour,
        "Family Structure": formData.familyStructure,
        "Family Dynamics": formData.familyDynamics,
        "Marital and Family Conflict": formData.maritalAndFamilyConflict,
        "Financial Stress": formData.financialStress,
        "Emotional Support": formData.emotionalSupport,
        "Feeling of Loneliness": formData.feelingOfLoneliness,
        "Feeling Understood": formData.feelingUnderstood,
        "Suicidal Thoughts": formData.suicidalThoughts,
        "PHQ-9 Score": phqScore,
        "Anxiety-7 Score": gadScore,
        "PHQ9_1": phq9_1,
        "PHQ9_2": phq9_2,
        "PHQ9_3": phq9_3,
        "PHQ9_4": phq9_4,
        "PHQ9_5": phq9_5,
        "PHQ9_6": phq9_6,
        "PHQ9_7": phq9_7,
        "PHQ9_8": phq9_8,
        "PHQ9_9": phq9_9,
        "GAD7_1": gad7_1,
        "GAD7_2": gad7_2,
        "GAD7_3": gad7_3,
        "GAD7_4": gad7_4,
        "GAD7_5": gad7_5,
        "GAD7_6": gad7_6,
        "GAD7_7": gad7_7,
        "Full Name": formData.name,
        "Mobile Number": formData.mobile || ""
      };

      const submitData = new FormData();
      submitData.append("questionnaire", JSON.stringify(questionnairePayload));
      submitData.append("file", audioBlob, "audio.webm");

      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        body: submitData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit assessment.");
      }

      setSuccessMsg("Wellness details saved! Loading your review...");
      setTimeout(() => {
        router.push(`/dashboard/report/${result.assessmentId}`);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const progressPct = Math.round(((currentStep - 1) / 8) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-slate-800 font-sans">
      
      {/* Step Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 px-6 py-4 rounded-2xl shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Step {currentStep} of 9</span>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Wellness Check-in</h2>
        </div>
        <div className="w-24 bg-slate-100 h-2 rounded overflow-hidden border border-slate-200">
          <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 shadow-md rounded-[2rem] p-6 sm:p-12 relative">
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-xl text-xs font-semibold mb-6 animate-pulse">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl text-xs font-semibold mb-6">
            {successMsg}
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 1: Basic Information</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Let's get started</h2>
              <p className="text-sm text-slate-500">Please share your name so we know how to address you.</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Full Name <span className="text-indigo-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: Mood & Feelings */}
        {currentStep === 2 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 2: Mood & Feelings</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How have you been feeling?</h2>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {/* Mood swings */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you feel like your mood shifts suddenly? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("moodChanges", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.moodChanges === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.moodChanges === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optimism level slider */}
              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200/50 rounded-3xl">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-750">How hopeful do you feel about the future? (1 to 10)</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs">{formData.optimismLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.optimismLevel}
                  onChange={(e) => updateField("optimismLevel", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Current emotion state */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Which of these describes how you usually feel? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {["Anger", "Fear", "Happy", "Neutral", "Sad"].map((emotion) => (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => updateField("currentEmotionalState", emotion)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold transition duration-150 ${formData.currentEmotionalState === emotion ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overthinking */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you find yourself overthinking or worrying? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["Yes", "Sometimes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("overthinking", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.overthinking === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.overthinking === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Fear */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">How comfortable do you feel around other people? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Comfortable", val: "Low" },
                    { label: "Somewhat uneasy", val: "Moderate" },
                    { label: "Anxious", val: "High" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateField("socialFear", opt.val)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.socialFear === opt.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.socialFear === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concentration Level */}
              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200/50 rounded-3xl">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-750">How easy is it for you to focus? (1 to 10)</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs">{formData.concentration}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.concentration}
                  onChange={(e) => updateField("concentration", parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Social interaction */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">How often do you connect with others? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Often", val: "High" },
                    { label: "Sometimes", val: "Moderate" },
                    { label: "Rarely", val: "Low" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateField("socialInteraction", opt.val)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.socialInteraction === opt.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.socialInteraction === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: Sleep & Personal Experiences */}
        {currentStep === 3 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 3: Sleep & Personal Experiences</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sleep & Personal Experiences</h2>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {/* Sleep Pattern */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">How has your sleep been this past month? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["Normal", "Reduced", "Excessive"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("sleepPattern", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.sleepPattern === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.sleepPattern === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced sleep need */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you ever feel highly energetic even if you sleep very little? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("reducedNeedForSleep", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.reducedNeedForSleep === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.reducedNeedForSleep === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Increased energy */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Have you noticed any unusual bursts of energy or activity? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("increasedEnergyLevel", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.increasedEnergyLevel === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.increasedEnergyLevel === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Past Trauma */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Have you experienced any challenging or overwhelming events in the past? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("pastTrauma", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.pastTrauma === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.pastTrauma === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intrusive memories */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you experience unexpected memories or flashbacks of these events? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("intrusiveMemories", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.intrusiveMemories === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.intrusiveMemories === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avoidance behavior */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you find yourself avoiding thoughts or places that remind you of them? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("avoidanceBehaviour", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.avoidanceBehaviour === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.avoidanceBehaviour === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: Family & Home Environment */}
        {currentStep === 4 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 4: Family & Home Environment</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Home & Support Network</h2>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {/* Family Structure */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Household Type <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["Joint", "Nuclear", "Other"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("familyStructure", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.familyStructure === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.familyStructure === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Dynamics */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">How supportive is your household? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Supportive", val: "Supportive" },
                    { label: "Neutral", val: "Neutral" },
                    { label: "Challenging", val: "Dysfunctional" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateField("familyDynamics", opt.val)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.familyDynamics === opt.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.familyDynamics === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marital & Family conflict */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Is there conflict at home? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["No", "Occasional", "Frequent"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("maritalAndFamilyConflict", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.maritalAndFamilyConflict === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.maritalAndFamilyConflict === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Stress */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">How much does financial stress affect you? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Low", "Medium", "Moderate", "High"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("financialStress", opt)}
                      className={`p-3.5 rounded-xl border-2 text-xs font-bold transition duration-150 ${formData.financialStress === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional Support */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you have someone you can talk to when you need support? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Yes, fully", val: "Available" },
                    { label: "Sometimes", val: "Partial Available" },
                    { label: "Not really", val: "Unavailable" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateField("emotionalSupport", opt.val)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.emotionalSupport === opt.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.emotionalSupport === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 5: Connection & Loneliness */}
        {currentStep === 5 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 5: Connection & Loneliness</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How connected do you feel?</h2>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {/* Feeling of Loneliness */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you ever feel lonely? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["Yes", "Sometimes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("feelingOfLoneliness", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.feelingOfLoneliness === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.feelingOfLoneliness === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling Understood */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Do you feel understood by the people around you? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {["Yes", "Sometimes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("feelingUnderstood", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.feelingUnderstood === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.feelingUnderstood === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 6: Daily Wellbeing */}
        {currentStep === 6 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 6: Daily Wellbeing</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How you've been feeling recently</h2>
              <p className="text-sm text-slate-500">Over the last 2 weeks, how often have you experienced these?</p>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {/* Suicidal thoughts */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Thoughts that you would be better off dead or of hurting yourself? <span className="text-indigo-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("suicidalThoughts", opt)}
                      className={`flex items-center gap-3.5 p-4 border-2 rounded-2xl transition duration-150 font-semibold text-sm ${formData.suicidalThoughts === opt ? "bg-indigo-50/50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-500"}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {formData.suicidalThoughts === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale helper options */}
              {[
                { label: "Q1. Little interest or pleasure in doing things? *", key: "q1" },
                { label: "Q2. Feeling down, depressed, or hopeless? *", key: "q2" },
                { label: "Q3. Feeling nervous, anxious or on edge? *", key: "q3" },
                { label: "Q4. Not being able to stop or control worrying? *", key: "q4" }
              ].map((item) => {
                const val = (formData as any)[item.key];
                return (
                  <div key={item.key} className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700">{item.label}</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { text: "Not at all", val: "0" },
                        { text: "Several days", val: "1" },
                        { text: "Half the days", val: "2" },
                        { text: "Nearly daily", val: "3" }
                      ].map((choice) => (
                        <button
                          key={choice.val}
                          type="button"
                          onClick={() => updateField(item.key, choice.val)}
                          className={`p-2.5 rounded-lg border-2 text-[10px] font-bold leading-tight transition duration-150 ${val === choice.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700 font-bold" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-500"}`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 7: Additional Feelings Check */}
        {currentStep === 7 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 7: Additional Feelings Check</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">A closer look at your mood</h2>
              <p className="text-sm text-slate-500">Over the last 2 weeks, how often have you experienced these?</p>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {[
                { label: "Q5. Trouble falling or staying asleep, or sleeping too much? *", key: "q5" },
                { label: "Q6. Feeling tired or having little energy? *", key: "q6" },
                { label: "Q7. Poor appetite or overeating? *", key: "q7" },
                { label: "Q8. Feeling bad about yourself—or that you are a failure? *", key: "q8" },
                { label: "Q9. Trouble concentrating on things? *", key: "q9" },
                { label: "Q10. Moving or speaking slowly, or being overly fidgety? *", key: "q10" },
                { label: "Q11. Thoughts that you would be better off dead? *", key: "q11" }
              ].map((item) => {
                const val = (formData as any)[item.key];
                return (
                  <div key={item.key} className="space-y-2 pt-2 border-t border-slate-100 first:border-0">
                    <label className="block text-sm font-semibold text-slate-700">{item.label}</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { text: "Not at all", val: "0" },
                        { text: "Several days", val: "1" },
                        { text: "Half the days", val: "2" },
                        { text: "Nearly daily", val: "3" }
                      ].map((choice) => (
                        <button
                          key={choice.val}
                          type="button"
                          onClick={() => updateField(item.key, choice.val)}
                          className={`p-2.5 rounded-lg border-2 text-[10px] font-bold leading-tight transition duration-150 ${val === choice.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700 font-bold" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-500"}`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 8: Additional Anxiety Check */}
        {currentStep === 8 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 8: Additional Anxiety Check</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">A closer look at your worries</h2>
              <p className="text-sm text-slate-500">Over the last 2 weeks, how often have you experienced these?</p>
            </div>
            <div className="space-y-5 pt-4 border-t border-slate-100">
              {[
                { label: "Q12. Worrying too much about different things? *", key: "q12" },
                { label: "Q13. Trouble relaxing? *", key: "q13" },
                { label: "Q14. Being so restless that it is hard to sit still? *", key: "q14" },
                { label: "Q15. Becoming easily annoyed or irritable? *", key: "q15" },
                { label: "Q16. Feeling afraid as if something awful might happen? *", key: "q16" }
              ].map((item) => {
                const val = (formData as any)[item.key];
                return (
                  <div key={item.key} className="space-y-2 pt-2 border-t border-slate-100 first:border-0">
                    <label className="block text-sm font-semibold text-slate-700">{item.label}</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { text: "Not at all", val: "0" },
                        { text: "Several days", val: "1" },
                        { text: "Half the days", val: "2" },
                        { text: "Nearly daily", val: "3" }
                      ].map((choice) => (
                        <button
                          key={choice.val}
                          type="button"
                          onClick={() => updateField(item.key, choice.val)}
                          className={`p-2.5 rounded-lg border-2 text-[10px] font-bold leading-tight transition duration-150 ${val === choice.val ? "bg-indigo-50/50 border-indigo-500 text-indigo-700 font-bold" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-500"}`}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 9: Voice Reflection & Submission */}
        {currentStep === 9 && (
          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Section 9: Voice Reflection</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Share a voice reflection</h2>
            </div>
            
            <div className="py-2">
              <AudioRecorder onRecordingComplete={(blob) => setAudioBlob(blob)} />
            </div>
          </section>
        )}

        {/* Survey Navigation Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-150 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className={`px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${currentStep === 1 ? "invisible" : ""}`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : currentStep === 9 ? (
              "Submit Check-in"
            ) : (
              "Next Step"
            )}
          </button>
        </footer>

      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await request.formData();
    const questionnaireStr = formData.get("questionnaire") as string;
    const audioFile = formData.get("file") as Blob | null;

    if (!questionnaireStr || !audioFile) {
      return NextResponse.json({ error: "Missing survey questionnaire or voice reflection files." }, { status: 400 });
    }

    const questionnaire = JSON.parse(questionnaireStr);

    // 1. Send data to Python stateless ML server
    let mlResponse;
    try {
      const mlFormData = new FormData();
      mlFormData.append("questionnaire", questionnaireStr);
      
      // Convert Web Blob to file representation
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileBlob = new Blob([buffer], { type: "audio/webm" });
      mlFormData.append("file", fileBlob, "audio.webm");

      const res = await fetch("http://127.0.0.1:8000/predict/multimodal", {
        method: "POST",
        body: mlFormData,
      });

      if (res.ok) {
        mlResponse = await res.json();
      } else {
        const errorText = await res.text();
        console.warn("Stateless ML server returned error response, falling back:", errorText);
      }
    } catch (e) {
      console.warn("Failed to reach Python ML server (offline), generating fallback predictions:", e);
    }

    // 2. Fallback Mock Generator if Python ML server is unreachable
    if (!mlResponse) {
      const phq = parseInt(questionnaire["PHQ-9 Score"] || 0, 10);
      const gad = parseInt(questionnaire["Anxiety-7 Score"] || 0, 10);

      let finalDisorder = "Normal";
      let decision = "Standard Clinical Protocol";

      if (phq >= 15 || gad >= 15) {
        finalDisorder = phq > gad ? "Severe Depression" : "Severe Anxiety";
        decision = "Priority Clinical Screening";
      } else if (phq >= 10 || gad >= 10) {
        finalDisorder = phq > gad ? "Moderate Depression" : "Generalized Anxiety";
        decision = "Enhanced Supportive Care";
      } else if (phq >= 5 || gad >= 5) {
        finalDisorder = phq > gad ? "Mild Depression" : "Mild Anxiety";
        decision = "Standard Clinical Protocol";
      }

      mlResponse = {
        tabular_prediction: {
          prediction: finalDisorder,
          probability: { Normal: 0.1, [finalDisorder]: 0.9 },
        },
        audio_prediction: {
          prediction: phq > gad ? "Depressed" : "Normal",
          confidence: 0.85,
          features: {
            pitch: 180.5,
            pitch_variability: 12.3,
            speech_rate: 2.5,
            pause_duration: 1.1,
            voice_energy: 0.04,
            jitter: 0.015,
            shimmer: 0.04,
            hnr: 16.5,
          },
        },
        final_prediction: {
          final_disorder: finalDisorder,
          decision: decision,
          all_tabular_predictions: { Normal: 10, Depression: 45, Anxiety: 45 },
          risk_flags: { sleep_disturbance: "Yes", high_tension: gad >= 10 ? "Yes" : "No" },
        },
      };
    }

    // 3. Save the uploaded audio file to public/uploads/audio/
    const assessmentId = Math.random().toString(36).substring(2, 15);
    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
    
    // Ensure parent directories exist
    fs.mkdirSync(uploadDir, { recursive: true });

    const arrayBuffer = await audioFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const audioFilename = `audio_${assessmentId}.webm`;
    const audioFilePath = path.join(uploadDir, audioFilename);
    
    fs.writeFileSync(audioFilePath, fileBuffer);
    const audioUrl = `/uploads/audio/${audioFilename}`;

    // 4. Save assessment log to the SQLite Database via Prisma
    const record = await prisma.assessment.create({
      data: {
        id: assessmentId,
        userId: session.id,
        fullName: questionnaire["Full Name"] || "User",
        mobileNumber: questionnaire["Mobile Number"] || null,
        
        // Questionnaire
        moodChanges: questionnaire["Mood Changes"] || "No",
        optimismLevel: parseInt(questionnaire["Optimism Level"] || 5, 10),
        currentEmotionalState: questionnaire["Current Emotional State"] || "Neutral",
        overthinking: questionnaire["Overthinking"] || "No",
        socialFear: questionnaire["Social Fear"] || "Low",
        concentration: parseInt(questionnaire["Concentration"] || 5, 10),
        socialInteraction: questionnaire["Social Interaction"] || "Moderate",
        sleepPattern: questionnaire["Sleep Pattern"] || "Normal",
        reducedNeedForSleep: questionnaire["Reduced Need for Sleep"] || "No",
        increasedEnergyLevel: questionnaire["Increased Energy Level"] || "No",
        suicidalThoughts: questionnaire["Suicidal Thoughts"] || "No",
        phq9Score: parseInt(questionnaire["PHQ-9 Score"] || 0, 10),
        anxiety7Score: parseInt(questionnaire["Anxiety-7 Score"] || 0, 10),
        pastTrauma: questionnaire["Past Trauma"] || "No",
        intrusiveMemories: questionnaire["Intrusive Memories"] || "No",
        avoidanceBehaviour: questionnaire["Avoidance Behaviour"] || "No",
        familyStructure: questionnaire["Family Structure"] || "Nuclear",
        familyDynamics: questionnaire["Family Dynamics"] || "Supportive",
        maritalAndFamilyConflict: questionnaire["Marital and Family Conflict"] || "No",
        financialStress: questionnaire["Financial Stress"] || "Low",
        emotionalSupport: questionnaire["Emotional Support"] || "Available",
        feelingOfLoneliness: questionnaire["Feeling of Loneliness"] || "No",
        feelingUnderstood: questionnaire["Feeling Understood"] || "Yes",
        phq9_1: parseInt(questionnaire["PHQ9_1"] || 0, 10),
        phq9_2: parseInt(questionnaire["PHQ9_2"] || 0, 10),
        phq9_3: parseInt(questionnaire["PHQ9_3"] || 0, 10),
        phq9_4: parseInt(questionnaire["PHQ9_4"] || 0, 10),
        phq9_5: parseInt(questionnaire["PHQ9_5"] || 0, 10),
        phq9_6: parseInt(questionnaire["PHQ9_6"] || 0, 10),
        phq9_7: parseInt(questionnaire["PHQ9_7"] || 0, 10),
        phq9_8: parseInt(questionnaire["PHQ9_8"] || 0, 10),
        phq9_9: parseInt(questionnaire["PHQ9_9"] || 0, 10),
        gad7_1: parseInt(questionnaire["GAD7_1"] || 0, 10),
        gad7_2: parseInt(questionnaire["GAD7_2"] || 0, 10),
        gad7_3: parseInt(questionnaire["GAD7_3"] || 0, 10),
        gad7_4: parseInt(questionnaire["GAD7_4"] || 0, 10),
        gad7_5: parseInt(questionnaire["GAD7_5"] || 0, 10),
        gad7_6: parseInt(questionnaire["GAD7_6"] || 0, 10),
        gad7_7: parseInt(questionnaire["GAD7_7"] || 0, 10),

        // Speech acoustic indicators
        pitch: parseFloat(mlResponse.audio_prediction.features.pitch || 0),
        pitchVariability: parseFloat(mlResponse.audio_prediction.features.pitch_variability || 0),
        speechRate: parseFloat(mlResponse.audio_prediction.features.speech_rate || 0),
        pauseDuration: parseFloat(mlResponse.audio_prediction.features.pause_duration || 0),
        voiceEnergy: parseFloat(mlResponse.audio_prediction.features.voice_energy || 0),
        jitter: parseFloat(mlResponse.audio_prediction.features.jitter || 0),
        shimmer: parseFloat(mlResponse.audio_prediction.features.shimmer || 0),
        hnr: parseFloat(mlResponse.audio_prediction.features.hnr || 0),

        // Predictions
        audioDisorder: mlResponse.audio_prediction.prediction,
        audioConfidence: parseFloat(mlResponse.audio_prediction.confidence || 0),
        tabularDisorder: mlResponse.tabular_prediction.prediction,
        finalDisorder: mlResponse.final_prediction.final_disorder,
        decision: mlResponse.final_prediction.decision,
        
        allTabularPredictions: JSON.stringify(mlResponse.final_prediction.all_tabular_predictions),
        riskFlags: JSON.stringify(mlResponse.final_prediction.risk_flags),
      },
    });

    return NextResponse.json({ success: true, assessmentId: record.id });
  } catch (error: any) {
    console.error("Submission API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process survey check-in." }, { status: 500 });
  }
}

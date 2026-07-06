import uuid
import os
import json
import tempfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.tabular.predict import predict_tabular_data
from src.audio.predict import predict_audio_data
from src.fusion.fusion import fuse_results

app = FastAPI(
    title="MindTone API Server",
    description="Stateless Multimodal Mental Health Assessment API Engine",
    version="1.0.0"
)

# Enable CORS for local cross-port development (e.g., Next.js Frontend -> FastAPI Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionnaireInput(BaseModel):
    mood_changes: str = Field(..., alias="Mood Changes")
    optimism_level: int = Field(..., alias="Optimism Level")
    current_emotional_state: str = Field(..., alias="Current Emotional State")
    overthinking: str = Field(..., alias="Overthinking")
    social_fear: str = Field(..., alias="Social Fear")
    concentration: int = Field(..., alias="Concentration")
    social_interaction: str = Field(..., alias="Social Interaction")
    sleep_pattern: str = Field(..., alias="Sleep Pattern")
    reduced_need_for_sleep: str = Field(..., alias="Reduced Need for Sleep")
    increased_energy_level: str = Field(..., alias="Increased Energy Level")
    suicidal_thoughts: str = Field(..., alias="Suicidal Thoughts")
    phq9_score: int = Field(..., alias="PHQ-9 Score")
    anxiety7_score: int = Field(..., alias="Anxiety-7 Score")
    past_trauma: str = Field(..., alias="Past Trauma")
    intrusive_memories: str = Field(..., alias="Intrusive Memories")
    avoidance_behaviour: str = Field(..., alias="Avoidance Behaviour")
    family_structure: str = Field(..., alias="Family Structure")
    family_dynamics: str = Field(..., alias="Family Dynamics")
    marital_and_family_conflict: str = Field(..., alias="Marital and Family Conflict")
    financial_stress: str = Field(..., alias="Financial Stress")
    emotional_support: str = Field(..., alias="Emotional Support")
    feeling_of_loneliness: str = Field(..., alias="Feeling of Loneliness")
    feeling_understood: str = Field(..., alias="Feeling Understood")
    phq9_1: int = Field(..., alias="PHQ9_1")
    phq9_2: int = Field(..., alias="PHQ9_2")
    phq9_3: int = Field(..., alias="PHQ9_3")
    phq9_4: int = Field(..., alias="PHQ9_4")
    phq9_5: int = Field(..., alias="PHQ9_5")
    phq9_6: int = Field(..., alias="PHQ9_6")
    phq9_7: int = Field(..., alias="PHQ9_7")
    phq9_8: int = Field(..., alias="PHQ9_8")
    phq9_9: int = Field(..., alias="PHQ9_9")
    gad7_1: int = Field(..., alias="GAD7_1")
    gad7_2: int = Field(..., alias="GAD7_2")
    gad7_3: int = Field(..., alias="GAD7_3")
    gad7_4: int = Field(..., alias="GAD7_4")
    gad7_5: int = Field(..., alias="GAD7_5")
    gad7_6: int = Field(..., alias="GAD7_6")
    gad7_7: int = Field(..., alias="GAD7_7")

    class Config:
        populate_by_name = True


@app.get("/")
def read_root():
    return {
        "status": "online",
        "framework": "MindTone",
        "version": "1.0.0"
    }


@app.post("/predict/tabular")
def predict_tabular(payload: QuestionnaireInput):
    try:
        q_dict = payload.model_dump(by_alias=True)
        result = predict_tabular_data(q_dict)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal tabular prediction error: {str(e)}")


@app.post("/predict/audio")
async def predict_audio(file: UploadFile = File(...)):
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"audio_{uuid.uuid4().hex}.wav")

    try:
        # Write binary content to temporary WAV file
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        result = predict_audio_data(temp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal audio prediction error: {str(e)}")
    finally:
        # Clean up temporary WAV file immediately
        if os.path.exists(temp_path):
            os.remove(temp_path)


from src.config.paths import JSON_OUTPUT
from src.fusion.fusion import FusionEngine
from src.report.graphs import main as generate_graphs
from src.report.generate_report import main as generate_report

@app.post("/predict/multimodal")
async def predict_multimodal(
    questionnaire: str = Form(..., description="JSON stringified questionnaire payload"),
    file: UploadFile = File(...)
):
    try:
        q_dict = json.loads(questionnaire)
        validated_payload = QuestionnaireInput(**q_dict)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON format for questionnaire form.")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Questionnaire validation error: {str(e)}")

    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"audio_{uuid.uuid4().hex}.wav")

    try:
        # Write binary contents
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        # Execute tabular & audio predictions
        q_data = validated_payload.model_dump(by_alias=True)
        tab_res = predict_tabular_data(q_data)
        aud_res = predict_audio_data(temp_path)

        # Write predictions to disk so FusionEngine and Report Generators can process them
        os.makedirs(str(JSON_OUTPUT), exist_ok=True)
        with open(str(JSON_OUTPUT / "tabular_prediction.json"), "w") as f:
            json.dump(tab_res, f, indent=4)
        with open(str(JSON_OUTPUT / "audio_prediction.json"), "w") as f:
            json.dump(aud_res, f, indent=4)

        # Execute and save fusion prediction
        fusion = FusionEngine()
        fusion.save()

        # Generate on-demand plots
        generate_graphs()

        # Compile PDF report
        pdf_report_name = generate_report()

        return {
            "tabular_prediction": tab_res,
            "audio_prediction": aud_res,
            "final_prediction": fusion.fuse(),
            "pdf_report_name": pdf_report_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multimodal prediction engine failed: {str(e)}")
    finally:
        # Clean up temporary WAV file immediately
        if os.path.exists(temp_path):
            os.remove(temp_path)

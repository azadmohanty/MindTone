from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

DATASET_DIR = ROOT / "dataset"
INPUT_DIR = ROOT / "input"
MODEL_DIR = ROOT / "models"
OUTPUT_DIR = ROOT / "outputs"

TABULAR_DATASET = DATASET_DIR / "tabular" / "train_dataset.csv"

QUESTIONNAIRE_INPUT = INPUT_DIR / "questionnaire.csv"
AUDIO_INPUT = INPUT_DIR / "audio.wav"
VIDEO_INPUT = INPUT_DIR / "video.mp4"

TABULAR_MODEL_DIR = MODEL_DIR / "tabular"
AUDIO_MODEL_DIR = MODEL_DIR / "audio"
VIDEO_MODEL_DIR = MODEL_DIR / "video"
FUSION_MODEL_DIR = MODEL_DIR / "fusion"

JSON_OUTPUT = OUTPUT_DIR / "json"
GRAPH_OUTPUT = OUTPUT_DIR / "graphs"
REPORT_OUTPUT = OUTPUT_DIR / "reports"
LOG_OUTPUT = OUTPUT_DIR / "logs"

# Tabular Models
TABULAR_ENCODER = TABULAR_MODEL_DIR / "encoder.pkl"
CATEGORICAL_COLUMNS = TABULAR_MODEL_DIR / "categorical_columns.pkl"
FEATURE_NAMES = TABULAR_MODEL_DIR / "feature_names.pkl"

# Audio Models
AUDIO_MODEL = AUDIO_MODEL_DIR / "audio_model.pkl"
AUDIO_SCALER = AUDIO_MODEL_DIR / "audio_scaler.pkl"

# Video Models
VIDEO_MODEL = VIDEO_MODEL_DIR / "video_model.pkl"
VIDEO_SCALER = VIDEO_MODEL_DIR / "video_scaler.pkl"

# Fusion Model
FUSION_MODEL = FUSION_MODEL_DIR / "fusion_model.pkl"
import joblib
import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import LabelEncoder

from src.config.paths import (
    AUDIO_MODEL_DIR,
    AUDIO_SCALER
)

SCALER_PATH = AUDIO_SCALER
LABEL_ENCODER_PATH = AUDIO_MODEL_DIR / "label_encoder.pkl"
FEATURE_PATH = AUDIO_MODEL_DIR / "feature_names.pkl"

TARGET_COLUMN = "Disorder"


def preprocess_training(df):

    X = df.drop(columns=[TARGET_COLUMN]).copy()

    y = df[TARGET_COLUMN].copy()

    feature_names = X.columns.tolist()

    scaler = StandardScaler()

    X = pd.DataFrame(
        scaler.fit_transform(X),
        columns=feature_names
    )

    label_encoder = LabelEncoder()

    y = label_encoder.fit_transform(y)

    joblib.dump(
        scaler,
        SCALER_PATH
    )

    joblib.dump(
        label_encoder,
        LABEL_ENCODER_PATH
    )

    joblib.dump(
        feature_names,
        FEATURE_PATH
    )

    return X, y


def preprocess_prediction(df):

    scaler = joblib.load(
        SCALER_PATH
    )

    feature_names = joblib.load(
        FEATURE_PATH
    )

    X = df[feature_names].copy()

    X = pd.DataFrame(
        scaler.transform(X),
        columns=feature_names
    )

    return X
import joblib
import pandas as pd

from src.config.paths import (
    AUDIO_MODEL,
    AUDIO_SCALER,
    AUDIO_MODEL_DIR
)

LABEL_ENCODER = AUDIO_MODEL_DIR / "label_encoder.pkl"
FEATURE_NAMES = AUDIO_MODEL_DIR / "feature_names.pkl"


class AudioModelManager:

    def __init__(self):

        self.model = joblib.load(AUDIO_MODEL)

        self.scaler = joblib.load(AUDIO_SCALER)

        self.label_encoder = joblib.load(LABEL_ENCODER)

        self.feature_names = joblib.load(FEATURE_NAMES)

    def predict(self, feature_df):

        X = feature_df[self.feature_names].copy()

        X = self.scaler.transform(X)

        prediction = self.model.predict(X)

        probability = self.model.predict_proba(X)

        disorder = self.label_encoder.inverse_transform(
            prediction.astype(int).flatten()
        )[0]

        confidence = probability.max() * 100

        return {

            "Predicted Disorder": disorder,

            "Confidence": round(
                float(confidence),
                2
            )

        }
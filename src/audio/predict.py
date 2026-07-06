import json

from src.audio.extract_features import AudioFeatureExtractor
from src.audio.model_manager import AudioModelManager

from src.config.paths import (
    AUDIO_INPUT,
    JSON_OUTPUT
)


def predict_audio_data(audio_file_path: str) -> dict:

    extractor = AudioFeatureExtractor(
        audio_file_path
    )

    features = extractor.extract()

    manager = AudioModelManager()

    prediction = manager.predict(
        features
    )

    return {

        "Audio Features": {

            "Pitch": float(features.iloc[0]["Pitch"]),

            "Pitch Variability": float(features.iloc[0]["Pitch Variability"]),

            "Speech Rate": float(features.iloc[0]["Speech Rate"]),

            "Pause Duration": float(features.iloc[0]["Pause Duration"]),

            "Voice Energy": float(features.iloc[0]["Voice Energy"]),

            "Jitter": float(features.iloc[0]["Jitter"]),

            "Shimmer": float(features.iloc[0]["Shimmer"]),

            "HNR": float(features.iloc[0]["HNR"])

        },

        "Prediction": prediction

    }


def main():

    output = predict_audio_data(
        AUDIO_INPUT
    )

    with open(
        JSON_OUTPUT / "audio_prediction.json",
        "w"
    ) as file:

        json.dump(
            output,
            file,
            indent=4
        )

    print("\n========== AUDIO RESULT ==========\n")

    print(
        f"Predicted Disorder : {output['Prediction']['Predicted Disorder']}"
    )

    print(
        f"Confidence : {output['Prediction']['Confidence']}%"
    )

    print("\nPrediction Saved Successfully")


if __name__ == "__main__":

    main()
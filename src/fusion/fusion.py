import json

from src.config.paths import (
    JSON_OUTPUT
)


def fuse_results(tabular_prediction: dict, audio_prediction: dict) -> dict:

    engine = FusionEngine(
        tabular_prediction=tabular_prediction,
        audio_prediction=audio_prediction
    )

    return engine.fuse()


class FusionEngine:

    def __init__(self, tabular_prediction: dict = None, audio_prediction: dict = None):

        if tabular_prediction is not None:

            self.tabular = tabular_prediction

        else:

            with open(
                JSON_OUTPUT / "tabular_prediction.json",
                "r"
            ) as file:

                self.tabular = json.load(file)

        if audio_prediction is not None:

            self.audio = audio_prediction

        else:

            with open(
                JSON_OUTPUT / "audio_prediction.json",
                "r"
            ) as file:

                self.audio = json.load(file)

    def fuse(self):

        top3 = self.tabular["top3_disorders"]

        audio_disorder = self.audio["Prediction"]["Predicted Disorder"]

        audio_confidence = self.audio["Prediction"]["Confidence"]

        top3_names = [

            disorder["disorder"]

            for disorder in top3

        ]

        if audio_disorder in top3_names:

            final_disorder = audio_disorder

            verification = "Verified by Audio"

        else:

            final_disorder = top3[0]["disorder"]

            verification = "Tabular Dominant"

        return {

            "Final Disorder": final_disorder,

            "Audio Prediction": audio_disorder,

            "Audio Confidence": audio_confidence,

            "Decision": verification,

            "Top 3 Disorders": top3,

            "Risk Flags": self.tabular["risk_flags"]

        }

    def save(self):

        result = self.fuse()

        with open(

            JSON_OUTPUT / "final_prediction.json",

            "w"

        ) as file:

            json.dump(

                result,

                file,

                indent=4

            )

        return result


if __name__ == "__main__":

    engine = FusionEngine()

    result = engine.save()

    print()

    print("========== FINAL RESULT ==========")

    print()

    print(

        "Final Disorder :",

        result["Final Disorder"]

    )

    print()

    print(

        "Decision :",

        result["Decision"]

    )

    print()

    print("Fusion Completed")
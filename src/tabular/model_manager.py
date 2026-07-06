import joblib

from src.config.paths import TABULAR_MODEL_DIR

from src.config.targets import (
    TARGET_COLUMNS,
    DISPLAY_NAMES
)


class TabularModelManager:

    def __init__(self):

        self.models = {}

        self.load_models()

    def load_models(self):

        for target in TARGET_COLUMNS:

            filename = (
                target
                .replace("%", "")
                .replace("(", "")
                .replace(")", "")
                .replace("/", "_")
                .replace(" ", "_")
                + ".pkl"
            )

            self.models[target] = joblib.load(
                TABULAR_MODEL_DIR / filename
            )

    def predict(self, X):

        predictions = {}

        for target in TARGET_COLUMNS:

            risk = self.models[target].predict(X)[0]

            risk = max(
                0,
                min(
                    100,
                    float(risk)
                )
            )

            predictions[
                DISPLAY_NAMES[target]
            ] = round(
                risk,
                2
            )

        return predictions

    def top_k(
        self,
        predictions,
        k=3
    ):

        return sorted(
            predictions.items(),
            key=lambda x: x[1],
            reverse=True
        )[:k]
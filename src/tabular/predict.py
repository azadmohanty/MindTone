import json
import pandas as pd

from src.config.paths import (
    QUESTIONNAIRE_INPUT,
    JSON_OUTPUT
)

from src.tabular.preprocess import preprocess_prediction
from src.tabular.model_manager import TabularModelManager
from src.tabular.risk_engine import RiskEngine


def predict_tabular_data(questionnaire_dict: dict) -> dict:

    questionnaire = pd.DataFrame([questionnaire_dict])

    # Dynamically generate risk flags and append them to the input dataframe
    # since they are required categorical inputs by the preprocessor and CatBoost models.
    risks = RiskEngine(
        questionnaire
    ).generate()

    for flag, val in risks.items():
        questionnaire[flag] = val

    X = preprocess_prediction(
        questionnaire
    )

    manager = TabularModelManager()

    predictions = manager.predict(X)

    # Ensure bounds [0, 100] and 2 decimal rounding
    predictions = {
        k: round(max(0.0, min(100.0, float(v))), 2)
        for k, v in predictions.items()
    }

    top3 = manager.top_k(
        predictions
    )

    return {

        "all_disorders": predictions,

        "top3_disorders": [
            {
                "rank": i + 1,
                "disorder": disorder,
                "risk": risk
            }
            for i, (disorder, risk)
            in enumerate(top3)
        ],

        "risk_flags": risks

    }


def main():

    questionnaire = pd.read_csv(
        QUESTIONNAIRE_INPUT
    )

    questionnaire_dict = questionnaire.iloc[0].to_dict()

    output = predict_tabular_data(
        questionnaire_dict
    )

    with open(
        JSON_OUTPUT / "tabular_prediction.json",
        "w"
    ) as f:

        json.dump(
            output,
            f,
            indent=4
        )

    print("\n========== TOP 3 ==========\n")

    for item in output["top3_disorders"]:

        print(
            f"{item['rank']}. {item['disorder']} : {item['risk']:.2f}%"
        )

    print("\n========== RISK FLAGS ==========\n")

    for key, value in output["risk_flags"].items():

        if value == "Yes":

            print(key)

    print("\nPrediction Completed")


if __name__ == "__main__":

    main()
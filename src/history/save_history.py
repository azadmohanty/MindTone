import json
from datetime import datetime

import pandas as pd

from src.config.paths import (
    ROOT,
    QUESTIONNAIRE_INPUT,
    JSON_OUTPUT
)

# ----------------------------------------------------
# History File
# ----------------------------------------------------

HISTORY_FILE = ROOT / "history" / "assessment_history.csv"

HISTORY_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


class HistoryManager:

    def __init__(self):

        self.date = datetime.now().strftime("%d-%m-%Y %H:%M")

    def save(self, report_name=None):

        # --------------------------------------------------
        # Read Questionnaire
        # --------------------------------------------------

        questionnaire = pd.read_csv(
            QUESTIONNAIRE_INPUT,
            encoding="utf-8"
        )

        questionnaire.columns = questionnaire.columns.str.strip()

        row = questionnaire.iloc[0].to_dict()

        row = {
            "Assessment Date": self.date,
            **row
        }

        # --------------------------------------------------
        # Read Tabular Prediction
        # --------------------------------------------------

        with open(
            JSON_OUTPUT / "tabular_prediction.json",
            "r",
            encoding="utf-8"
        ) as file:

            tabular = json.load(file)

        predictions = tabular["all_disorders"]

        # Fill existing disorder columns

        row["Major Depressive Disorder (Depression Risk) %"] = round(
            float(predictions["Depression"]), 2
        )

        row["Generalized Anxiety Disorder (GAD) %"] = round(
            float(predictions["GAD"]), 2
        )

        row["Post-Traumatic Stress Disorder (PTSD) %"] = round(
            float(predictions["PTSD"]), 2
        )

        row["Persistent Depressive Disorder (Dysthymia) %"] = round(
            float(predictions["Dysthymia"]), 2
        )

        row["Anxiety-Depression Comorbidity %"] = round(
            float(predictions["Comorbidity"]), 2
        )

        row["Bipolar I Risk Pattern %"] = round(
            float(predictions["Bipolar I"]), 2
        )

        row["Bipolar II Risk Pattern %"] = round(
            float(predictions["Bipolar II"]), 2
        )

        row["Normal Mental Health Status %"] = round(
            float(predictions["Normal"]), 2
        )

        # --------------------------------------------------
        # Risk Flags
        # --------------------------------------------------

        for risk, value in tabular["risk_flags"].items():

            row[risk] = value

        # --------------------------------------------------
        # Read Audio Prediction
        # --------------------------------------------------

        with open(
            JSON_OUTPUT / "audio_prediction.json",
            "r",
            encoding="utf-8"
        ) as file:

            audio = json.load(file)

        features = audio["Audio Features"]

        row["Pitch"] = round(float(features["Pitch"]), 2)
        row["Pitch Variability"] = round(float(features["Pitch Variability"]), 2)
        row["Speech Rate"] = round(float(features["Speech Rate"]), 2)
        row["Pause Duration"] = round(float(features["Pause Duration"]), 2)
        row["Voice Energy"] = round(float(features["Voice Energy"]), 2)
        row["Jitter"] = round(float(features["Jitter"]), 4)
        row["Shimmer"] = round(float(features["Shimmer"]), 4)
        row["HNR"] = round(float(features["HNR"]), 2)

        row["Audio Disorder"] = audio["Prediction"]["Predicted Disorder"]
        row["Audio Confidence"] = round(
            float(audio["Prediction"]["Confidence"]),
            2
        )

        # --------------------------------------------------
        # Read Final Prediction
        # --------------------------------------------------

        with open(
            JSON_OUTPUT / "final_prediction.json",
            "r",
            encoding="utf-8"
        ) as file:

            final = json.load(file)

        row["Fusion Decision"] = final["Decision"]
        row["Final Disorder"] = final["Final Disorder"]
        row["Report Name"] = report_name
        # --------------------------------------------------
        # Save History
        # --------------------------------------------------

        history = pd.DataFrame([row])

        if HISTORY_FILE.exists():

            history.to_csv(
                HISTORY_FILE,
                mode="a",
                header=False,
                index=False,
                encoding="utf-8-sig"
            )

        else:

            history.to_csv(
                HISTORY_FILE,
                index=False,
                encoding="utf-8-sig"
            )

        print("\n===================================")
        print("Assessment Saved Successfully")
        print("===================================")
        print(f"History File : {HISTORY_FILE}")


if __name__ == "__main__":

    HistoryManager().save()
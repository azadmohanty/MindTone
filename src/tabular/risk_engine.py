import pandas as pd


class RiskEngine:

    def __init__(self, questionnaire):

        self.data = questionnaire.iloc[0]

    def suicide_risk(self):

        if (
            self.data["Suicidal Thoughts"] == "Yes"
            and self.data["PHQ-9 Score"] >= 20
            and self.data["Optimism Level"] <= 2
        ):
            return "Yes"

        return "No"

    def psychological_distress(self):

        if (
            self.data["PHQ-9 Score"] >= 10
            and self.data["Anxiety-7 Score"] >= 10
            and self.data["Current Emotional State"] in [
                "Sad",
                "Fear",
                "Anger"
            ]
        ):
            return "Yes"

        return "No"

    def family_risk(self):

        if (
            self.data["Family Dynamics"] == "Dysfunctional"
            and self.data["Marital and Family Conflict"] == "Frequent"
            and self.data["Emotional Support"] == "Unavailable"
        ):
            return "Yes"

        return "No"

    def loneliness_risk(self):

        if (
            self.data["Social Interaction"] == "Low"
            and self.data["Feeling of Loneliness"] == "Yes"
            and self.data["Feeling Understood"] == "No"
        ):
            return "Yes"

        return "No"

    def generate(self):

        return {

            "Suicide Risk":
            self.suicide_risk(),

            "Psychological Distress":
            self.psychological_distress(),

            "Family-Related Mental Health Risk":
            self.family_risk(),

            "Loneliness Risk":
            self.loneliness_risk()

        }
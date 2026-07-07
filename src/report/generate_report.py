import json
from datetime import datetime

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image
)

from src.config.paths import (
    JSON_OUTPUT,
    GRAPH_OUTPUT,
    REPORT_OUTPUT
)


def recommendation(disorder):

    recommendations = {

        "Major Depressive Disorder (Depression Risk)":
        "Professional psychological consultation is recommended.",

        "Generalized Anxiety Disorder (GAD)":
        "Practice stress management and seek counselling if needed.",

        "Post-Traumatic Stress Disorder (PTSD)":
        "Trauma-focused therapy is recommended.",

        "Persistent Depressive Disorder (Dysthymia)":
        "Long-term counselling is recommended.",

        "Anxiety-Depression Comorbidity":
        "Consult a psychiatrist for comprehensive evaluation.",

        "Bipolar I Risk Pattern":
        "Immediate psychiatric consultation is advised.",

        "Bipolar II Risk Pattern":
        "Psychiatric evaluation is recommended.",

        "Normal Mental Health Status":
        "Maintain a healthy lifestyle."

    }

    return recommendations.get(
        disorder,
        "Consult a mental health professional."
    )


def main(data=None):

    if data is None:
        with open(str(JSON_OUTPUT / "final_prediction.json"), "r") as file:
            data = json.load(file)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    report_name = f"Mental_Health_Report_{timestamp}.pdf"

    pdf = SimpleDocTemplate(
        str(REPORT_OUTPUT / report_name)
    )

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>Mental Health Assessment Report</b>",
            styles["Title"]
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            f"<b>Date :</b> {datetime.now().strftime('%d-%m-%Y %H:%M')}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1,10))

    story.append(
        Paragraph(
            f"<b>Final Disorder :</b> {data['Final Disorder']}",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Decision :</b> {data['Decision']}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Audio Prediction :</b> {data['Audio Prediction']}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Audio Confidence :</b> {data['Audio Confidence']} %",
            styles["Normal"]
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            "<b>Top 3 Disorders</b>",
            styles["Heading2"]
        )
    )

    for disorder in data["Top 3 Disorders"]:

        story.append(

            Paragraph(

                f"{disorder['rank']}. {disorder['disorder']} : {disorder['risk']:.2f}%",

                styles["Normal"]

            )

        )

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            "<b>Risk Flags</b>",
            styles["Heading2"]
        )
    )

    found = False

    for key, value in data["Risk Flags"].items():

        if value == "Yes":

            found = True

            story.append(

                Paragraph(

                    "• " + key,

                    styles["Normal"]

                )

            )

    if not found:

        story.append(

            Paragraph(

                "No significant risk detected.",

                styles["Normal"]

            )

        )

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            "<b>Recommendation</b>",
            styles["Heading2"]
        )
    )

    story.append(

        Paragraph(

            recommendation(

                data["Final Disorder"]

            ),

            styles["Normal"]

        )

    )

    story.append(Spacer(1,20))

    story.append(

        Image(

            str(GRAPH_OUTPUT / "top3_disorders.png"),

            width=420,

            height=250

        )

    )

    story.append(Spacer(1,20))

    story.append(

        Image(

            str(GRAPH_OUTPUT / "risk_flags.png"),

            width=420,

            height=250

        )

    )

    pdf.build(story)

    print("Report Generated Successfully")

    return report_name


if __name__ == "__main__":

    main()
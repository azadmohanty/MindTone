import json
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from src.config.paths import (
    JSON_OUTPUT,
    GRAPH_OUTPUT
)


def disorder_graph(data):

    disorders = []
    confidence = []

    for item in data["Top 3 Disorders"]:

        disorders.append(item["disorder"])

        confidence.append(item["risk"])

    plt.figure(figsize=(8,5))

    bars = plt.bar(
        disorders,
        confidence
    )

    plt.title("Top 3 Disorder Probability")

    plt.ylabel("Probability (%)")

    plt.xlabel("Disorder")

    for bar in bars:

        y = bar.get_height()

        plt.text(
            bar.get_x()+bar.get_width()/2,
            y+1,
            f"{y:.1f}",
            ha="center"
        )

    plt.tight_layout()

    os.makedirs(str(GRAPH_OUTPUT), exist_ok=True)
    plt.savefig(
        GRAPH_OUTPUT/"top3_disorders.png"
    )

    plt.close()


def risk_graph(data):

    labels = []
    values = []

    for key, value in data["Risk Flags"].items():

        labels.append(key)

        values.append(
            1 if value=="Yes" else 0
        )

    plt.figure(figsize=(8,4))

    bars = plt.bar(
        labels,
        values
    )

    plt.title("Risk Flags")

    plt.yticks(
        [0,1],
        ["No","Yes"]
    )

    plt.xticks(rotation=20)

    os.makedirs(str(GRAPH_OUTPUT), exist_ok=True)
    plt.savefig(
        GRAPH_OUTPUT/"risk_flags.png"
    )

    plt.close()


def main():

    with open(
        JSON_OUTPUT/"final_prediction.json"
    ) as f:

        data = json.load(f)

    disorder_graph(data)

    risk_graph(data)

    print()

    print("Graphs Generated Successfully")


if __name__=="__main__":

    main()
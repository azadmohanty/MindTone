import joblib
import pandas as pd

from catboost import CatBoostClassifier

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from src.audio.preprocess import preprocess_training
from src.config.paths import (
    AUDIO_MODEL,
    LOG_OUTPUT
)


DATASET = "dataset/audio/train_audio_dataset_numeric.csv"


def main():

    df = pd.read_csv(
    DATASET,
    encoding="utf-8-sig"
    )

    X, y = preprocess_training(
        df
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    model = CatBoostClassifier(

        iterations=500,

        depth=6,

        learning_rate=0.05,

        loss_function="MultiClass",

        verbose=False,

        random_seed=42

    )

    model.fit(

        X_train,

        y_train

    )

    prediction = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        prediction
    )

    print("\n==============================")

    print("AUDIO MODEL PERFORMANCE")

    print("==============================")

    print(f"\nAccuracy : {accuracy*100:.2f}%\n")

    print(

        classification_report(

            y_test,

            prediction

        )

    )

    print(

        confusion_matrix(

            y_test,

            prediction

        )

    )

    joblib.dump(

        model,

        AUDIO_MODEL

    )

    print("\nModel Saved Successfully")

    print("\nTraining Completed")


if __name__ == "__main__":

    main()
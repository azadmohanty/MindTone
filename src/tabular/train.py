import joblib
import pandas as pd

from catboost import CatBoostRegressor
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error
)

from src.config.paths import (
    TABULAR_DATASET,
    TABULAR_MODEL_DIR,
    LOG_OUTPUT
)

from src.config.targets import TARGET_COLUMNS

from src.config.settings import (
    CATBOOST_PARAMS,
    TEST_SIZE,
    RANDOM_STATE
)

from src.tabular.preprocess import preprocess_training

from sklearn.model_selection import train_test_split


df = pd.read_csv(
    TABULAR_DATASET
)

X, y = preprocess_training(df)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE
)

metrics = {}

for target in TARGET_COLUMNS:

    print(f"Training {target}")

    model = CatBoostRegressor(
        **CATBOOST_PARAMS
    )

    model.fit(
        X_train,
        y_train[target]
    )

    prediction = model.predict(
        X_test
    )

    metrics[target] = {

        "R2": float(
            r2_score(
                y_test[target],
                prediction
            )
        ),

        "MAE": float(
            mean_absolute_error(
                y_test[target],
                prediction
            )
        ),

        "RMSE": float(
            mean_squared_error(
                y_test[target],
                prediction
            ) ** 0.5
        )

    }

    filename = (
        target
        .replace("%", "")
        .replace("(", "")
        .replace(")", "")
        .replace("/", "_")
        .replace(" ", "_")
        + ".pkl"
    )

    joblib.dump(
        model,
        TABULAR_MODEL_DIR / filename
    )

metrics_df = pd.DataFrame(metrics).T

metrics_df.to_csv(
    LOG_OUTPUT / "tabular_metrics.csv"
)

print("\nTraining Completed Successfully")
import joblib
import pandas as pd

from sklearn.preprocessing import OrdinalEncoder

from src.config.targets import TARGET_COLUMNS

from src.config.paths import (
    TABULAR_ENCODER,
    CATEGORICAL_COLUMNS,
    FEATURE_NAMES
)


def split_features_target(df):

    X = df.drop(columns=TARGET_COLUMNS)

    y = df[TARGET_COLUMNS]

    return X, y


def fit_preprocessor(X):

    X = X.copy()

    categorical_columns = X.select_dtypes(
        include=["object", "string"]
    ).columns.tolist()

    feature_names = X.columns.tolist()

    encoder = OrdinalEncoder(
        handle_unknown="use_encoded_value",
        unknown_value=-1
    )

    X[categorical_columns] = encoder.fit_transform(
        X[categorical_columns].astype(str)
    )

    joblib.dump(
        encoder,
        TABULAR_ENCODER
    )

    joblib.dump(
        categorical_columns,
        CATEGORICAL_COLUMNS
    )

    joblib.dump(
        feature_names,
        FEATURE_NAMES
    )

    return X


def transform_preprocessor(X):

    X = X.copy()

    encoder = joblib.load(
        TABULAR_ENCODER
    )

    categorical_columns = joblib.load(
        CATEGORICAL_COLUMNS
    )

    feature_names = joblib.load(
        FEATURE_NAMES
    )

    # Validate categories against trained encoder
    for i, col in enumerate(categorical_columns):
        if col in X.columns:
            valid_categories = set(encoder.categories_[i])
            for idx, val in X[col].items():
                val_str = str(val)
                if val_str not in valid_categories:
                    raise ValueError(
                        f"Invalid value '{val}' for column '{col}'. "
                        f"Must be one of: {sorted(list(valid_categories))}"
                    )

    X[categorical_columns] = encoder.transform(
        X[categorical_columns].astype(str)
    )

    X = X[feature_names]

    return X


def preprocess_training(df):

    X, y = split_features_target(df)

    X = fit_preprocessor(X)

    return X, y


def preprocess_prediction(df):

    X = transform_preprocessor(df)

    return X
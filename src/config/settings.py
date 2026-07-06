RANDOM_STATE = 42

TEST_SIZE = 0.20

CATBOOST_PARAMS = {
    "iterations": 1000,
    "depth": 8,
    "learning_rate": 0.03,
    "loss_function": "RMSE",
    "verbose": False,
    "random_seed": RANDOM_STATE
}

TOP_K = 3

SHAP_SAMPLE_SIZE = 500
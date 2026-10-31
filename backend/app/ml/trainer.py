"""
ml/trainer.py — XGBoost model training with chronological train/test split
"""
import os
import json
import joblib
import numpy as np
from datetime import datetime
from typing import Tuple

import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.ml.feature_engineering import build_feature_dataframe, FEATURE_COLUMNS
from app.core.config import get_settings

settings = get_settings()


def _wape(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Weighted Absolute Percentage Error — more robust than MAPE for retail."""
    denom = np.sum(np.abs(actual))
    if denom == 0:
        return 0.0
    return float(np.sum(np.abs(actual - predicted)) / denom * 100)


def train_model(
    records: list[dict],
    target: str = "transactions",
    test_size: float = 0.2,
    model_version: str = "v1",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
) -> dict:
    """
    Train an XGBoost regressor on historical retail data.

    Args:
        records: List of history record dicts from DB.
        target:  Column to predict — 'transactions', 'footfall', or 'sales'.
        test_size: Fraction of data to reserve for chronological testing.
        model_version: Version tag saved with the model file.
        store_id / department_id: Used for namespacing the saved model file.

    Returns:
        dict with model metrics and saved path.
    """
    if len(records) < 10:
        raise ValueError("Need at least 10 historical records to train a model.")

    # Build features + target
    X_df = build_feature_dataframe(records)
    y = np.array([float(r[target]) for r in records])

    # Chronological split (NO shuffling — prevents data leakage)
    split_idx = int(len(records) * (1 - test_size))
    X_train = X_df.iloc[:split_idx]
    X_test = X_df.iloc[split_idx:]
    y_train = y[:split_idx]
    y_test = y[split_idx:]

    # XGBoost regressor
    model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
        n_jobs=-1,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # Evaluate
    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, None)          # No negative predictions

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    wape = _wape(y_test, y_pred)

    # Persist model to disk
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    safe_store = store_id.replace("/", "_").replace("\\", "_")
    safe_dept = department_id.replace("/", "_").replace("\\", "_")
    model_filename = f"{safe_store}_{safe_dept}_{target}_{model_version}.json"
    model_path = os.path.join(settings.MODEL_DIR, model_filename)
    model.save_model(model_path)

    return {
        "model_version": model_version,
        "model_path": model_path,
        "target": target,
        "training_rows": split_idx,
        "test_rows": len(y_test),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "wape": round(wape, 4),
    }


def load_model(
    store_id: str,
    department_id: str,
    target: str = "transactions",
    model_version: str = "v1",
) -> xgb.XGBRegressor:
    """Load a previously saved XGBoost model from disk."""
    safe_store = store_id.replace("/", "_").replace("\\", "_")
    safe_dept = department_id.replace("/", "_").replace("\\", "_")
    model_filename = f"{safe_store}_{safe_dept}_{target}_{model_version}.json"
    model_path = os.path.join(settings.MODEL_DIR, model_filename)

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"No trained model found at {model_path}. "
            "Please call /forecast/train first."
        )

    model = xgb.XGBRegressor()
    model.load_model(model_path)
    return model


def model_exists(
    store_id: str,
    department_id: str,
    target: str = "transactions",
    model_version: str = "v1",
) -> bool:
    """Check if a saved model file exists."""
    safe_store = store_id.replace("/", "_").replace("\\", "_")
    safe_dept = department_id.replace("/", "_").replace("\\", "_")
    model_filename = f"{safe_store}_{safe_dept}_{target}_{model_version}.json"
    model_path = os.path.join(settings.MODEL_DIR, model_filename)
    return os.path.exists(model_path)

"""
ml/predictor.py — Load model and run demand inference on future intervals
"""
import numpy as np
from typing import List
from app.ml.trainer import load_model
from app.ml.feature_engineering import build_feature_dataframe


def predict_demand(
    intervals: List[dict],
    store_id: str,
    department_id: str,
    target: str = "transactions",
    model_version: str = "v1",
) -> List[dict]:
    """
    Predict retail demand for a list of future 15-minute intervals.

    Args:
        intervals: List of dicts with keys: interval_start, is_holiday, promotion, temperature
        store_id / department_id: Used to look up the correct trained model.
        target: 'transactions' | 'footfall' | 'sales'
        model_version: Model version to load.

    Returns:
        List of dicts: interval_start + predicted value keyed by target name.
    """
    model = load_model(store_id, department_id, target, model_version)
    X_df = build_feature_dataframe(intervals)

    raw_preds = model.predict(X_df)
    raw_preds = np.clip(raw_preds, 0, None)          # Enforce non-negative predictions

    results = []
    for i, interval in enumerate(intervals):
        results.append({
            "interval_start": str(interval["interval_start"]),
            f"predicted_{target}": round(float(raw_preds[i]), 2),
            "is_holiday": interval.get("is_holiday", False),
            "promotion": interval.get("promotion", False),
            "temperature": interval.get("temperature", 25.0),
        })

    return results

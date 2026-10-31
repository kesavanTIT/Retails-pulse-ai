"""
ml/feature_engineering.py — Extract XGBoost training features from 15-min interval timestamps
"""
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Union


FEATURE_COLUMNS = [
    "hour", "minute", "day_of_week", "day_of_month", "month",
    "week_of_year", "is_weekend", "is_morning_rush", "is_evening_rush",
    "hour_sin", "hour_cos", "dow_sin", "dow_cos",
    "is_holiday", "promotion", "temperature",
]


def extract_features(
    interval_start: Union[datetime, str],
    is_holiday: bool = False,
    promotion: bool = False,
    temperature: float = 25.0,
) -> dict:
    """Extract features from a single 15-minute interval timestamp."""
    dt = pd.Timestamp(interval_start)
    if dt.tzinfo is not None:
        dt = dt.tz_convert("UTC").tz_localize(None)

    hour = dt.hour
    minute = dt.minute
    day_of_week = dt.dayofweek          # 0=Monday, 6=Sunday
    day_of_month = dt.day
    month = dt.month
    week_of_year = dt.isocalendar().week

    # Cyclical encoding to capture periodicity (avoids 23→0 hour jump)
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    dow_sin = np.sin(2 * np.pi * day_of_week / 7)
    dow_cos = np.cos(2 * np.pi * day_of_week / 7)

    is_weekend = 1 if day_of_week >= 5 else 0
    is_morning_rush = 1 if 8 <= hour <= 10 else 0
    is_evening_rush = 1 if 17 <= hour <= 20 else 0

    return {
        "hour": hour,
        "minute": minute,
        "day_of_week": day_of_week,
        "day_of_month": day_of_month,
        "month": month,
        "week_of_year": int(week_of_year),
        "is_weekend": is_weekend,
        "is_morning_rush": is_morning_rush,
        "is_evening_rush": is_evening_rush,
        "hour_sin": hour_sin,
        "hour_cos": hour_cos,
        "dow_sin": dow_sin,
        "dow_cos": dow_cos,
        "is_holiday": int(is_holiday),
        "promotion": int(promotion),
        "temperature": temperature if temperature is not None else 25.0,
    }


def build_feature_dataframe(records: list[dict]) -> pd.DataFrame:
    """
    Build a feature DataFrame from a list of history record dicts.
    Each record must have: interval_start, is_holiday, promotion, temperature.
    """
    rows = []
    for rec in records:
        feats = extract_features(
            interval_start=rec["interval_start"],
            is_holiday=rec.get("is_holiday", False),
            promotion=rec.get("promotion", False),
            temperature=rec.get("temperature", 25.0),
        )
        rows.append(feats)

    df = pd.DataFrame(rows, columns=FEATURE_COLUMNS)
    return df

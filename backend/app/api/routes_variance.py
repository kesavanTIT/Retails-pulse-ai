"""
api/routes_variance.py — /variance endpoint: forecast accuracy metrics
"""
import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import VarianceRecord
from app.models.schemas import VarianceRequest, VarianceResponse

router = APIRouter(prefix="/variance", tags=["Variance & Accuracy"])


@router.post("/", response_model=VarianceResponse)
def calculate_variance(payload: VarianceRequest, db: Session = Depends(get_db)):
    """
    Calculate forecast accuracy metrics by comparing actual vs forecast values.

    Returns:
    - MAE  (Mean Absolute Error)
    - RMSE (Root Mean Squared Error)
    - WAPE (Weighted Absolute Percentage Error — industry standard for retail)
    - Bias (positive = over-forecasting, negative = under-forecasting)
    """
    details = []
    actuals = []
    forecasts = []

    for item in payload.items:
        actual = item.actual_value
        forecast = item.forecast_value
        abs_err = abs(actual - forecast)
        pct_err = (abs_err / actual * 100) if actual != 0 else 0.0
        bias = forecast - actual

        actuals.append(actual)
        forecasts.append(forecast)

        # Persist each variance row
        v = VarianceRecord(
            tenant_id=payload.tenant_id,
            store_id=payload.store_id,
            department_id=payload.department_id,
            interval_start=item.interval_start,
            actual_value=actual,
            forecast_value=forecast,
            absolute_error=abs_err,
            percentage_error=pct_err,
            bias=bias,
            metric_type=item.metric_type,
        )
        db.add(v)

        details.append({
            "interval_start": str(item.interval_start),
            "actual": actual,
            "forecast": forecast,
            "absolute_error": round(abs_err, 4),
            "percentage_error": round(pct_err, 2),
            "bias": round(bias, 4),
            "metric_type": item.metric_type,
        })

    db.commit()

    a = np.array(actuals)
    f = np.array(forecasts)
    mae = float(np.mean(np.abs(a - f)))
    rmse = float(np.sqrt(np.mean((a - f) ** 2)))
    wape = float(np.sum(np.abs(a - f)) / np.sum(np.abs(a)) * 100) if np.sum(np.abs(a)) > 0 else 0.0
    bias = float(np.mean(f - a))

    return VarianceResponse(
        total_items=len(details),
        overall_mae=round(mae, 4),
        overall_rmse=round(rmse, 4),
        overall_wape=round(wape, 2),
        overall_bias=round(bias, 4),
        details=details,
    )


@router.get("/summary")
def variance_summary(
    tenant_id: str = "demo",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    db: Session = Depends(get_db),
):
    """Return aggregated variance stats from the DB."""
    records = (
        db.query(VarianceRecord)
        .filter(
            VarianceRecord.tenant_id == tenant_id,
            VarianceRecord.store_id == store_id,
            VarianceRecord.department_id == department_id,
        )
        .all()
    )
    if not records:
        return {"message": "No variance records found."}

    errors = [r.absolute_error for r in records]
    biases = [r.bias for r in records]
    return {
        "total_records": len(records),
        "avg_mae": round(float(np.mean(errors)), 4),
        "avg_bias": round(float(np.mean(biases)), 4),
        "store_id": store_id,
        "department_id": department_id,
    }

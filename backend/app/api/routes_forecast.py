"""
api/routes_forecast.py — /forecast/train and /forecast/predict endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import HistoryRecord, ForecastResult, ModelMetadata
from app.models.schemas import TrainRequest, TrainResponse, PredictRequest, PredictResponse
from app.ml.trainer import train_model, model_exists
from app.ml.predictor import predict_demand
from datetime import datetime

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("/train", response_model=TrainResponse)
def train(payload: TrainRequest, db: Session = Depends(get_db)):
    """
    Train an XGBoost model on stored historical data.
    Uses chronological split — no data leakage.
    """
    # Fetch all history records for this store/dept
    records = (
        db.query(HistoryRecord)
        .filter(
            HistoryRecord.tenant_id == payload.tenant_id,
            HistoryRecord.store_id == payload.store_id,
            HistoryRecord.department_id == payload.department_id,
        )
        .order_by(HistoryRecord.interval_start)
        .all()
    )

    if len(records) < 10:
        raise HTTPException(
            status_code=422,
            detail=f"Need at least 10 history records. Found {len(records)}. "
                   "Use POST /history/bulk or /scripts/seed first.",
        )

    # Convert ORM rows → plain dicts for the ML layer
    rec_dicts = [
        {
            "interval_start": r.interval_start,
            "transactions": r.transactions,
            "footfall": r.footfall,
            "sales": r.sales,
            "is_holiday": r.is_holiday,
            "promotion": r.promotion,
            "temperature": r.temperature,
        }
        for r in records
    ]

    result = train_model(
        records=rec_dicts,
        target=payload.target,
        test_size=payload.test_size,
        store_id=payload.store_id,
        department_id=payload.department_id,
    )

    # Persist model metadata to DB
    meta = ModelMetadata(
        version=result["model_version"],
        tenant_id=payload.tenant_id,
        store_id=payload.store_id,
        department_id=payload.department_id,
        target=payload.target,
        training_rows=result["training_rows"],
        mae=result["mae"],
        rmse=result["rmse"],
        wape=result["wape"],
        model_path=result["model_path"],
    )
    db.add(meta)
    db.commit()

    return TrainResponse(
        model_version=result["model_version"],
        training_rows=result["training_rows"],
        test_rows=result["test_rows"],
        mae=result["mae"],
        rmse=result["rmse"],
        wape=result["wape"],
        target=payload.target,
        message=f"Model trained successfully on {result['training_rows']} rows. "
                f"MAE={result['mae']}, WAPE={result['wape']}%",
    )


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest, db: Session = Depends(get_db)):
    """
    Predict demand for a list of future 15-minute intervals.
    The model for this store/dept must be trained first.
    """
    if not model_exists(payload.store_id, payload.department_id, payload.target):
        raise HTTPException(
            status_code=404,
            detail=f"No trained model found for store={payload.store_id}, "
                   f"dept={payload.department_id}, target={payload.target}. "
                   "Call POST /forecast/train first.",
        )

    predictions = predict_demand(
        intervals=payload.intervals,
        store_id=payload.store_id,
        department_id=payload.department_id,
        target=payload.target,
    )

    # Persist predictions to DB
    for pred in predictions:
        fr = ForecastResult(
            tenant_id=payload.tenant_id,
            store_id=payload.store_id,
            department_id=payload.department_id,
            interval_start=pred["interval_start"],
            predicted_transactions=pred.get("predicted_transactions"),
            predicted_footfall=pred.get("predicted_footfall"),
            predicted_sales=pred.get("predicted_sales"),
        )
        db.add(fr)
    db.commit()

    return PredictResponse(
        predictions=predictions,
        model_version="v1",
        target=payload.target,
    )


@router.get("/status")
def model_status(
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    target: str = "transactions",
):
    """Check if a model has been trained for this store/dept/target."""
    trained = model_exists(store_id, department_id, target)
    return {
        "store_id": store_id,
        "department_id": department_id,
        "target": target,
        "model_trained": trained,
    }


@router.get("/results")
def list_forecast_results(
    tenant_id: str = "demo",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    limit: int = 96,
    db: Session = Depends(get_db),
):
    """Return the latest forecast results for dashboard charting."""
    results = (
        db.query(ForecastResult)
        .filter(
            ForecastResult.tenant_id == tenant_id,
            ForecastResult.store_id == store_id,
            ForecastResult.department_id == department_id,
        )
        .order_by(ForecastResult.interval_start.desc())
        .limit(limit)
        .all()
    )
    return results

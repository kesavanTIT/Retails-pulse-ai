"""
api/routes_staffing.py — /staffing/calculate endpoint
FTE = (Predicted Units × Min/Unit) / (Interval Minutes × Productivity Factor)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.db_models import StaffingRecord
from app.models.schemas import StaffingRequest, StaffingResponse

router = APIRouter(prefix="/staffing", tags=["Staffing & Labour"])


def _calculate_fte(
    predicted_workload: float,
    minutes_per_unit: float,
    interval_minutes: int,
    productivity_factor: float,
) -> tuple[float, float]:
    """
    Core FTE formula:
      workload_minutes = predicted_workload × minutes_per_unit
      required_fte     = workload_minutes / (interval_minutes × productivity_factor)
    """
    workload_minutes = predicted_workload * minutes_per_unit
    denominator = interval_minutes * productivity_factor
    required_fte = workload_minutes / denominator if denominator > 0 else 0.0
    return round(required_fte, 2), round(workload_minutes, 2)


def _get_status(required: float, scheduled: float | None) -> tuple[str, str]:
    if scheduled is None:
        return "unknown", "No scheduled FTE provided."
    diff = required - scheduled
    if abs(diff) <= 0.5:
        return "optimal", f"Staffing is optimal. Required={required}, Scheduled={scheduled}."
    elif diff > 0.5:
        return "understaffed", f"UNDERSTAFFED by {round(diff, 1)} FTE. Add {round(diff, 1)} staff."
    else:
        return "overstaffed", f"OVERSTAFFED by {round(abs(diff), 1)} FTE. Consider reducing shifts."


@router.post("/calculate", response_model=StaffingResponse)
def calculate_staffing(payload: StaffingRequest, db: Session = Depends(get_db)):
    """
    Calculate required FTE from predicted workload.
    Optionally compare against scheduled FTE to get a staffing status.
    """
    required_fte, workload_minutes = _calculate_fte(
        payload.predicted_workload,
        payload.minutes_per_unit,
        payload.interval_minutes,
        payload.productivity_factor,
    )

    variance_fte = None
    if payload.scheduled_fte is not None:
        variance_fte = round(required_fte - payload.scheduled_fte, 2)

    status, message = _get_status(required_fte, payload.scheduled_fte)

    # Persist to DB
    record = StaffingRecord(
        tenant_id=payload.tenant_id,
        store_id=payload.store_id,
        department_id=payload.department_id,
        interval_start=payload.interval_start,
        predicted_workload=payload.predicted_workload,
        minutes_per_unit=payload.minutes_per_unit,
        interval_minutes=payload.interval_minutes,
        productivity_factor=payload.productivity_factor,
        required_fte=required_fte,
        scheduled_fte=payload.scheduled_fte,
    )
    db.add(record)
    db.commit()

    return StaffingResponse(
        required_fte=required_fte,
        workload_minutes=workload_minutes,
        variance_fte=variance_fte,
        status=status,
        message=message,
    )


@router.get("/records")
def list_staffing_records(
    tenant_id: str = "demo",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    limit: int = 96,
    db: Session = Depends(get_db),
):
    """List recent staffing calculation records for the dashboard grid."""
    records = (
        db.query(StaffingRecord)
        .filter(
            StaffingRecord.tenant_id == tenant_id,
            StaffingRecord.store_id == store_id,
            StaffingRecord.department_id == department_id,
        )
        .order_by(StaffingRecord.interval_start.desc())
        .limit(limit)
        .all()
    )
    return records

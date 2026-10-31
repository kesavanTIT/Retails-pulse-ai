"""
api/routes_history.py — /history endpoint: ingest and list retail demand records
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.db_models import HistoryRecord
from app.models.schemas import HistoryRecordCreate, HistoryRecordOut, HistoryBulkCreate

router = APIRouter(prefix="/history", tags=["History"])


@router.post("/", response_model=HistoryRecordOut, status_code=201)
def ingest_single_record(payload: HistoryRecordCreate, db: Session = Depends(get_db)):
    """Ingest a single 15-minute interval retail demand record."""
    record = HistoryRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/bulk", status_code=201)
def ingest_bulk_records(payload: HistoryBulkCreate, db: Session = Depends(get_db)):
    """Ingest multiple records in a single call (up to 1000 rows)."""
    if len(payload.records) > 1000:
        raise HTTPException(status_code=400, detail="Max 1000 records per bulk request.")
    records = [HistoryRecord(**r.model_dump()) for r in payload.records]
    db.add_all(records)
    db.commit()
    return {"accepted": len(records), "message": f"{len(records)} records ingested successfully."}


@router.get("/", response_model=List[HistoryRecordOut])
def list_records(
    tenant_id: str = Query("demo"),
    store_id: str = Query("STORE-001"),
    department_id: str = Query("CHECKOUT"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List historical records ordered chronologically."""
    records = (
        db.query(HistoryRecord)
        .filter(
            HistoryRecord.tenant_id == tenant_id,
            HistoryRecord.store_id == store_id,
            HistoryRecord.department_id == department_id,
        )
        .order_by(HistoryRecord.interval_start)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return records


@router.get("/count")
def count_records(
    tenant_id: str = Query("demo"),
    store_id: str = Query("STORE-001"),
    department_id: str = Query("CHECKOUT"),
    db: Session = Depends(get_db),
):
    """Return total count of history records for given store/dept."""
    count = (
        db.query(HistoryRecord)
        .filter(
            HistoryRecord.tenant_id == tenant_id,
            HistoryRecord.store_id == store_id,
            HistoryRecord.department_id == department_id,
        )
        .count()
    )
    return {"count": count, "store_id": store_id, "department_id": department_id}


@router.delete("/")
def clear_history(
    tenant_id: str = Query("demo"),
    store_id: str = Query("STORE-001"),
    department_id: str = Query("CHECKOUT"),
    db: Session = Depends(get_db),
):
    """Clear all history records for the given store/dept (demo utility)."""
    deleted = (
        db.query(HistoryRecord)
        .filter(
            HistoryRecord.tenant_id == tenant_id,
            HistoryRecord.store_id == store_id,
            HistoryRecord.department_id == department_id,
        )
        .delete()
    )
    db.commit()
    return {"deleted": deleted, "message": f"Cleared {deleted} records."}

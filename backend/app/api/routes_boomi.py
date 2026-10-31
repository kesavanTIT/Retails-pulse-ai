"""
api/routes_boomi.py — /integrations/boomi/ingest webhook (X-Boomi-Secret protected)
"""
from fastapi import APIRouter, Depends, Security
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_boomi_secret
from app.models.db_models import HistoryRecord
from app.models.schemas import BoomiIngestPayload, BoomiIngestResponse

router = APIRouter(prefix="/integrations/boomi", tags=["Boomi Integration"])


@router.post("/ingest", response_model=BoomiIngestResponse)
def boomi_ingest(
    payload: BoomiIngestPayload,
    db: Session = Depends(get_db),
    _: str = Security(verify_boomi_secret),
):
    """
    Boomi webhook endpoint — receives canonical POS/UKG data batches.
    Protected by X-Boomi-Secret header.
    Correlation ID is logged for retry/reconciliation.
    """
    records = []
    for r in payload.records:
        rec_data = r.model_dump()
        rec_data["source"] = "boomi"
        records.append(HistoryRecord(**rec_data))

    db.add_all(records)
    db.commit()

    return BoomiIngestResponse(
        accepted=len(records),
        correlation_id=payload.correlation_id,
        message=f"Successfully ingested {len(records)} records via Boomi. "
                f"Correlation ID: {payload.correlation_id or 'N/A'}",
    )

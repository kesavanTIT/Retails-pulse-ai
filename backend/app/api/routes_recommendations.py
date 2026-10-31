"""
api/routes_recommendations.py — /recommendations endpoint: shift adjustment suggestions
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.db_models import RecommendationRecord
from app.models.schemas import RecommendationRequest, RecommendationOut, ApproveRequest

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

UNDERSTAFFED_THRESHOLD = 0.5   # FTE variance > 0.5 → needs more staff
OVERSTAFFED_THRESHOLD = -0.5   # FTE variance < -0.5 → overstaffed


def _build_recommendation(required: float, scheduled: float) -> tuple[str, bool]:
    """Generate a human-readable recommendation message."""
    variance = required - scheduled
    if abs(variance) <= 0.5:
        return (
            f"Staffing is optimal. Required={required} FTE, Scheduled={scheduled} FTE.",
            False,
        )
    elif variance > 0:
        return (
            f"ADD {round(variance, 1)} FTE — Currently understaffed by {round(variance, 1)} "
            f"(Required={required}, Scheduled={scheduled}). Consider calling in additional staff.",
            True,
        )
    else:
        return (
            f"REDUCE by {round(abs(variance), 1)} FTE — Overstaffed by {round(abs(variance), 1)} "
            f"(Required={required}, Scheduled={scheduled}). Review shift coverage.",
            True,
        )


@router.post("/", response_model=List[RecommendationOut], status_code=201)
def generate_recommendations(payload: RecommendationRequest, db: Session = Depends(get_db)):
    """Generate shift adjustment recommendations for each interval."""
    created = []
    for item in payload.intervals:
        required = float(item.get("required_fte", 0))
        scheduled = float(item.get("scheduled_fte", 0))
        interval_start = item.get("interval_start")

        recommendation_text, needs_approval = _build_recommendation(required, scheduled)

        rec = RecommendationRecord(
            tenant_id=payload.tenant_id,
            store_id=payload.store_id,
            department_id=payload.department_id,
            interval_start=interval_start,
            required_fte=required,
            scheduled_fte=scheduled,
            variance_fte=round(required - scheduled, 2),
            recommendation=recommendation_text,
            manager_approval_required=needs_approval,
            approved=False,
        )
        db.add(rec)
        created.append(rec)

    db.commit()
    for rec in created:
        db.refresh(rec)

    return created


@router.get("/", response_model=List[RecommendationOut])
def list_recommendations(
    tenant_id: str = "demo",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    pending_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List all recommendations. Use pending_only=true to show unapproved items."""
    q = db.query(RecommendationRecord).filter(
        RecommendationRecord.tenant_id == tenant_id,
        RecommendationRecord.store_id == store_id,
        RecommendationRecord.department_id == department_id,
    )
    if pending_only:
        q = q.filter(
            RecommendationRecord.manager_approval_required == True,
            RecommendationRecord.approved == False,
        )
    return q.order_by(RecommendationRecord.interval_start).limit(limit).all()


@router.post("/approve")
def approve_recommendation(payload: ApproveRequest, db: Session = Depends(get_db)):
    """Manager approves a shift recommendation."""
    rec = db.query(RecommendationRecord).filter(
        RecommendationRecord.id == payload.recommendation_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    rec.approved = True
    rec.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(rec)
    return {"message": "Recommendation approved.", "id": rec.id, "approved_at": rec.approved_at}

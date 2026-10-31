"""
main.py — FastAPI application entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.models import db_models                         # noqa: F401 — register all ORM models
from app.api import routes_history, routes_forecast, routes_staffing
from app.api import routes_variance, routes_recommendations, routes_boomi

settings = get_settings()

# ── Create all DB tables on startup ──────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="RetailPulse AI — Demand Forecasting API",
    version=settings.APP_VERSION,
    description=(
        "Retail demand forecasting, labour staffing optimization, "
        "and schedule recommendations powered by XGBoost. "
        "Integrates with Boomi middleware and UKG Pro WFM."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow React frontend) ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all routers ──────────────────────────────────────────────────────
app.include_router(routes_history.router)
app.include_router(routes_forecast.router)
app.include_router(routes_staffing.router)
app.include_router(routes_variance.router)
app.include_router(routes_recommendations.router)
app.include_router(routes_boomi.router)


# ── Root & Health ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Dashboard Stats ───────────────────────────────────────────────────────────
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import (
    HistoryRecord, ForecastResult, RecommendationRecord, ModelMetadata
)
from app.ml.trainer import model_exists


@app.get("/dashboard/stats", tags=["Dashboard"])
def dashboard_stats(
    tenant_id: str = "demo",
    store_id: str = "STORE-001",
    department_id: str = "CHECKOUT",
    db: Session = Depends(get_db),
):
    """Return aggregated stats for the React dashboard KPI cards."""
    history_count = db.query(HistoryRecord).filter(
        HistoryRecord.tenant_id == tenant_id,
        HistoryRecord.store_id == store_id,
        HistoryRecord.department_id == department_id,
    ).count()

    forecast_count = db.query(ForecastResult).filter(
        ForecastResult.tenant_id == tenant_id,
        ForecastResult.store_id == store_id,
        ForecastResult.department_id == department_id,
    ).count()

    total_recs = db.query(RecommendationRecord).filter(
        RecommendationRecord.tenant_id == tenant_id,
        RecommendationRecord.store_id == store_id,
        RecommendationRecord.department_id == department_id,
    ).count()

    pending_approvals = db.query(RecommendationRecord).filter(
        RecommendationRecord.tenant_id == tenant_id,
        RecommendationRecord.store_id == store_id,
        RecommendationRecord.department_id == department_id,
        RecommendationRecord.manager_approval_required == True,
        RecommendationRecord.approved == False,
    ).count()

    trained = model_exists(store_id, department_id, "transactions")

    last_meta = db.query(ModelMetadata).filter(
        ModelMetadata.store_id == store_id,
        ModelMetadata.department_id == department_id,
    ).order_by(ModelMetadata.trained_at.desc()).first()

    return {
        "total_history_rows": history_count,
        "latest_forecast_count": forecast_count,
        "total_recommendations": total_recs,
        "pending_approvals": pending_approvals,
        "model_trained": trained,
        "last_trained_at": last_meta.trained_at if last_meta else None,
        "model_mae": last_meta.mae if last_meta else None,
        "model_wape": last_meta.wape if last_meta else None,
    }

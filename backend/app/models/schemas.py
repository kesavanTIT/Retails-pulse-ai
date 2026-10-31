"""
models/schemas.py — Pydantic request/response schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ─── History ─────────────────────────────────────────────────────────────────

class HistoryRecordCreate(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    interval_start: datetime = Field(..., examples=["2026-10-01T09:00:00+05:30"])
    transactions: int = Field(..., ge=0, examples=[42])
    footfall: int = Field(..., ge=0, examples=[110])
    sales: float = Field(..., ge=0, examples=[18500.0])
    is_holiday: bool = Field(False, examples=[False])
    promotion: bool = Field(False, examples=[True])
    temperature: Optional[float] = Field(None, examples=[31.0])
    source: Optional[str] = Field("manual", examples=["manual"])


class HistoryRecordOut(HistoryRecordCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryBulkCreate(BaseModel):
    records: List[HistoryRecordCreate]


# ─── Forecast ─────────────────────────────────────────────────────────────────

class TrainRequest(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    target: str = Field("transactions", examples=["transactions"],
                        description="transactions | footfall | sales")
    test_size: float = Field(0.2, ge=0.05, le=0.5)


class TrainResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    model_version: str
    training_rows: int
    test_rows: int
    mae: float
    rmse: float
    wape: float
    target: str
    message: str


class PredictRequest(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    intervals: List[dict] = Field(
        ...,
        examples=[
            [
                {
                    "interval_start": "2026-10-31T16:00:00+05:30",
                    "is_holiday": False,
                    "promotion": True,
                    "temperature": 31.0,
                }
            ]
        ],
    )
    target: str = Field("transactions", examples=["transactions"])


class PredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    predictions: List[dict]
    model_version: str
    target: str


# ─── Staffing ────────────────────────────────────────────────────────────────

class StaffingRequest(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    predicted_workload: float = Field(..., examples=[300.0],
                                      description="Total predicted units (transactions/footfall)")
    minutes_per_unit: float = Field(..., examples=[2.0],
                                    description="Minutes of staff time per transaction/unit")
    interval_minutes: int = Field(15, examples=[15])
    productivity_factor: float = Field(1.0, ge=0.1, le=2.0, examples=[1.0])
    scheduled_fte: Optional[float] = Field(None, examples=[8.0])
    interval_start: Optional[datetime] = None


class StaffingResponse(BaseModel):
    required_fte: float
    workload_minutes: float
    variance_fte: Optional[float] = None
    status: str                             # optimal | understaffed | overstaffed
    message: str


# ─── Variance ────────────────────────────────────────────────────────────────

class VarianceItem(BaseModel):
    interval_start: datetime
    actual_value: float
    forecast_value: float
    metric_type: str = "transactions"


class VarianceRequest(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    items: List[VarianceItem]


class VarianceResponse(BaseModel):
    total_items: int
    overall_mae: float
    overall_rmse: float
    overall_wape: float
    overall_bias: float
    details: List[dict]


# ─── Recommendations ─────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    tenant_id: str = Field(..., examples=["demo"])
    store_id: str = Field(..., examples=["STORE-001"])
    department_id: str = Field(..., examples=["CHECKOUT"])
    intervals: List[dict] = Field(
        ...,
        examples=[
            [
                {
                    "interval_start": "2026-10-31T16:00:00+05:30",
                    "required_fte": 9.0,
                    "scheduled_fte": 6.0,
                }
            ]
        ],
    )


class RecommendationOut(BaseModel):
    id: int
    interval_start: datetime
    required_fte: float
    scheduled_fte: float
    variance_fte: float
    recommendation: str
    manager_approval_required: bool
    approved: bool

    model_config = {"from_attributes": True}


class ApproveRequest(BaseModel):
    recommendation_id: int


# ─── Boomi ───────────────────────────────────────────────────────────────────

class BoomiIngestPayload(BaseModel):
    records: List[HistoryRecordCreate]
    correlation_id: Optional[str] = Field(None, examples=["boomi-corr-12345"])


class BoomiIngestResponse(BaseModel):
    accepted: int
    correlation_id: Optional[str]
    message: str


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    model_config = {"protected_namespaces": ()}
    total_history_rows: int
    latest_forecast_count: int
    total_recommendations: int
    pending_approvals: int
    model_trained: bool
    last_trained_at: Optional[datetime]

"""
models/db_models.py — SQLAlchemy ORM table definitions
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, JSON
)
from app.core.database import Base


class HistoryRecord(Base):
    """Raw 15-minute interval retail demand history."""
    __tablename__ = "history_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    store_id = Column(String(64), nullable=False, index=True)
    department_id = Column(String(64), nullable=False, index=True)
    interval_start = Column(DateTime(timezone=True), nullable=False, index=True)
    transactions = Column(Integer, nullable=False)
    footfall = Column(Integer, nullable=False)
    sales = Column(Float, nullable=False)
    is_holiday = Column(Boolean, default=False)
    promotion = Column(Boolean, default=False)
    temperature = Column(Float, nullable=True)
    source = Column(String(32), default="manual")          # manual | boomi | seeder
    created_at = Column(DateTime, default=datetime.utcnow)


class ForecastResult(Base):
    """Stored XGBoost prediction results per interval."""
    __tablename__ = "forecast_results"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    store_id = Column(String(64), nullable=False, index=True)
    department_id = Column(String(64), nullable=False, index=True)
    interval_start = Column(DateTime(timezone=True), nullable=False, index=True)
    predicted_transactions = Column(Float)
    predicted_footfall = Column(Float)
    predicted_sales = Column(Float)
    model_version = Column(String(32), default="v1")
    created_at = Column(DateTime, default=datetime.utcnow)


class StaffingRecord(Base):
    """Computed FTE staffing requirements per interval."""
    __tablename__ = "staffing_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    store_id = Column(String(64), nullable=False, index=True)
    department_id = Column(String(64), nullable=False, index=True)
    interval_start = Column(DateTime(timezone=True), nullable=False, index=True)
    predicted_workload = Column(Float)
    minutes_per_unit = Column(Float)
    interval_minutes = Column(Integer, default=15)
    productivity_factor = Column(Float, default=1.0)
    required_fte = Column(Float)
    scheduled_fte = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendationRecord(Base):
    """Manager-approval shift recommendations."""
    __tablename__ = "recommendation_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    store_id = Column(String(64), nullable=False, index=True)
    department_id = Column(String(64), nullable=False, index=True)
    interval_start = Column(DateTime(timezone=True), nullable=False)
    required_fte = Column(Float)
    scheduled_fte = Column(Float)
    variance_fte = Column(Float)
    recommendation = Column(Text)
    manager_approval_required = Column(Boolean, default=True)
    approved = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class VarianceRecord(Base):
    """Forecast vs Actual variance audit log."""
    __tablename__ = "variance_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    store_id = Column(String(64), nullable=False, index=True)
    department_id = Column(String(64), nullable=False, index=True)
    interval_start = Column(DateTime(timezone=True), nullable=False)
    actual_value = Column(Float)
    forecast_value = Column(Float)
    absolute_error = Column(Float)
    percentage_error = Column(Float)
    bias = Column(Float)                                   # + over, - under
    metric_type = Column(String(32), default="transactions")
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelMetadata(Base):
    """Tracks trained model versions and their accuracy metrics."""
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(32), nullable=False)
    tenant_id = Column(String(64), nullable=False)
    store_id = Column(String(64), nullable=False)
    department_id = Column(String(64), nullable=False)
    target = Column(String(32), nullable=False)            # transactions | footfall | sales
    training_rows = Column(Integer)
    mae = Column(Float)
    rmse = Column(Float)
    wape = Column(Float)
    model_path = Column(String(256))
    trained_at = Column(DateTime, default=datetime.utcnow)

"""
tests/test_api.py — Pytest integration tests for all RetailPulse AI endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

# ── In-memory SQLite test database ───────────────────────────────────────────
TEST_DB_URL = "sqlite:///./data/test_retailpulse.db"

engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.create_all(bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ── Sample payload ────────────────────────────────────────────────────────────
SAMPLE_RECORD = {
    "tenant_id": "demo",
    "store_id": "STORE-TEST",
    "department_id": "CHECKOUT",
    "interval_start": "2026-10-01T09:00:00+00:00",
    "transactions": 42,
    "footfall": 110,
    "sales": 18500.0,
    "is_holiday": False,
    "promotion": True,
    "temperature": 31.0,
}


# ── Tests ─────────────────────────────────────────────────────────────────────
def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "RetailPulse AI" in resp.json()["app"]


def test_ingest_single_record():
    resp = client.post("/history/", json=SAMPLE_RECORD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["transactions"] == 42
    assert data["store_id"] == "STORE-TEST"


def test_ingest_bulk_records():
    records = []
    from datetime import datetime, timedelta
    base = datetime(2026, 10, 1, 9, 0, 0)
    for i in range(35):
        r = SAMPLE_RECORD.copy()
        r["interval_start"] = (base + timedelta(minutes=15 * i)).isoformat() + "+00:00"
        r["transactions"] = 30 + i
        r["footfall"] = 80 + i * 2
        r["sales"] = 10000 + i * 200
        records.append(r)
    resp = client.post("/history/bulk", json={"records": records})
    assert resp.status_code == 201
    assert resp.json()["accepted"] == 35


def test_list_history():
    resp = client.get("/history/?tenant_id=demo&store_id=STORE-TEST&department_id=CHECKOUT")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_history_count():
    resp = client.get("/history/count?tenant_id=demo&store_id=STORE-TEST&department_id=CHECKOUT")
    assert resp.status_code == 200
    assert "count" in resp.json()


def test_train_model():
    resp = client.post("/forecast/train", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "target": "transactions",
        "test_size": 0.2,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "mae" in data
    assert data["training_rows"] > 0


def test_predict():
    resp = client.post("/forecast/predict", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "target": "transactions",
        "intervals": [
            {
                "interval_start": "2026-10-31T16:00:00+00:00",
                "is_holiday": False,
                "promotion": True,
                "temperature": 31.0,
            }
        ],
    })
    assert resp.status_code == 200
    preds = resp.json()["predictions"]
    assert len(preds) == 1
    assert "predicted_transactions" in preds[0]


def test_staffing_calculate():
    resp = client.post("/staffing/calculate", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "predicted_workload": 300.0,
        "minutes_per_unit": 2.0,
        "interval_minutes": 15,
        "productivity_factor": 1.0,
        "scheduled_fte": 8.0,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "required_fte" in data
    assert data["required_fte"] == 40.0


def test_variance():
    resp = client.post("/variance/", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "items": [
            {
                "interval_start": "2026-10-01T09:00:00+00:00",
                "actual_value": 40.0,
                "forecast_value": 42.0,
                "metric_type": "transactions",
            }
        ],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_mae"] == 2.0


def test_recommendations():
    resp = client.post("/recommendations/", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "intervals": [
            {
                "interval_start": "2026-10-31T16:00:00+00:00",
                "required_fte": 9.0,
                "scheduled_fte": 6.0,
            }
        ],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert len(data) == 1
    assert data[0]["manager_approval_required"] is True


def test_approve_recommendation():
    # First create a recommendation
    create_resp = client.post("/recommendations/", json={
        "tenant_id": "demo",
        "store_id": "STORE-TEST",
        "department_id": "CHECKOUT",
        "intervals": [
            {
                "interval_start": "2026-10-31T17:00:00+00:00",
                "required_fte": 8.0,
                "scheduled_fte": 5.0,
            }
        ],
    })
    rec_id = create_resp.json()[0]["id"]

    # Now approve it
    approve_resp = client.post("/recommendations/approve", json={"recommendation_id": rec_id})
    assert approve_resp.status_code == 200
    assert approve_resp.json()["id"] == rec_id


def test_boomi_ingest_no_secret():
    resp = client.post("/integrations/boomi/ingest", json={"records": [SAMPLE_RECORD]})
    assert resp.status_code == 401


def test_boomi_ingest_with_secret():
    resp = client.post(
        "/integrations/boomi/ingest",
        json={"records": [SAMPLE_RECORD], "correlation_id": "test-123"},
        headers={"X-Boomi-Secret": "dev-boomi-secret-change-in-prod"},
    )
    assert resp.status_code == 200
    assert resp.json()["accepted"] == 1


def test_dashboard_stats():
    resp = client.get("/dashboard/stats?tenant_id=demo&store_id=STORE-TEST&department_id=CHECKOUT")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_history_rows" in data
    assert "model_trained" in data

"""
scripts/seed_demo_data.py — Generate 60+ realistic 15-minute interval retail demand rows.
Run: python scripts/seed_demo_data.py (from the backend/ folder with venv active)
"""
import sys
import os

# Make sure we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal, engine, Base
from app.models.db_models import HistoryRecord

# ── Seed Config ───────────────────────────────────────────────────────────────
TENANT_ID = "demo"
STORE_ID = "STORE-001"
DEPARTMENT_ID = "CHECKOUT"
START_DATE = datetime(2026, 10, 1, 8, 0, 0, tzinfo=timezone.utc)   # Oct 1, 08:00 UTC
NUM_DAYS = 14                                                         # 2 weeks of history
IST_OFFSET = timedelta(hours=5, minutes=30)


def base_demand(hour: int, day_of_week: int) -> tuple[int, int, float]:
    """Simulate realistic retail demand by hour and day."""
    is_weekend = day_of_week >= 5

    # Base footfall curve — morning moderate, lunch dip, evening peak
    if 8 <= hour <= 9:
        base = 60
    elif 10 <= hour <= 12:
        base = 110
    elif 13 <= hour <= 14:
        base = 80        # lunch dip
    elif 15 <= hour <= 18:
        base = 160       # evening peak
    elif 19 <= hour <= 20:
        base = 120
    else:
        base = 30

    if is_weekend:
        base = int(base * 1.35)

    footfall = max(5, base + random.randint(-15, 15))
    transactions = max(1, int(footfall * random.uniform(0.3, 0.5)))
    sales = round(transactions * random.uniform(350, 650), 2)
    return footfall, transactions, sales


def main():
    print("🌱 Creating DB tables if not present...")
    os.makedirs("./data/models", exist_ok=True)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = (
            db.query(HistoryRecord)
            .filter(
                HistoryRecord.tenant_id == TENANT_ID,
                HistoryRecord.store_id == STORE_ID,
                HistoryRecord.department_id == DEPARTMENT_ID,
            )
            .count()
        )
        if existing > 0:
            print(f"⚠️  {existing} records already exist. Skipping seed. "
                  "Delete via DELETE /history or clear the DB to re-seed.")
            return

        records = []
        current = START_DATE
        end = START_DATE + timedelta(days=NUM_DAYS)

        print(f"⏳ Generating 15-min interval records from {START_DATE.date()} "
              f"to {end.date()} ...")

        while current < end:
            hour = current.hour
            if hour < 7 or hour >= 22:          # Store is closed
                current += timedelta(minutes=15)
                continue

            is_holiday = current.date() in [
                datetime(2026, 10, 2).date(),    # Gandhi Jayanti
            ]
            promotion = current.weekday() == 4   # Friday promotions
            temperature = round(random.uniform(25, 35), 1)

            footfall, transactions, sales = base_demand(hour, current.weekday())

            # Add holiday/promo boost
            if is_holiday:
                footfall = int(footfall * 1.5)
                transactions = int(transactions * 1.5)
                sales = round(sales * 1.5, 2)
            if promotion:
                footfall = int(footfall * 1.2)
                sales = round(sales * 1.25, 2)

            records.append(HistoryRecord(
                tenant_id=TENANT_ID,
                store_id=STORE_ID,
                department_id=DEPARTMENT_ID,
                interval_start=current,
                transactions=transactions,
                footfall=footfall,
                sales=sales,
                is_holiday=is_holiday,
                promotion=promotion,
                temperature=temperature,
                source="seeder",
            ))

            current += timedelta(minutes=15)

        db.add_all(records)
        db.commit()
        print(f"✅ Seeded {len(records)} records into the database successfully!")
        print(f"   Store: {STORE_ID} | Dept: {DEPARTMENT_ID} | Period: {NUM_DAYS} days")
        print(f"\n🚀 Next steps:")
        print(f"   1. POST /forecast/train  → Train the XGBoost model")
        print(f"   2. POST /forecast/predict → Run demand predictions")
        print(f"   3. Open http://127.0.0.1:8000/docs for Swagger UI")

    finally:
        db.close()


if __name__ == "__main__":
    main()

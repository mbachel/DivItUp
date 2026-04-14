import argparse
import json
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

from sqlalchemy import DateTime, Enum
from sqlalchemy.sql.sqltypes import Numeric

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.dependencies.database import SessionLocal
from app.models import model_loader
from app.models.chore_assignments import ChoreAssignments
from app.models.chores import Chores
from app.models.expense_splits import ExpenseSplits
from app.models.expenses import Expenses
from app.models.group_members import GroupMembers
from app.models.groups import Groups
from app.models.payments import Payments
from app.models.receipt_items import ReceiptItems
from app.models.receipts import Receipts
from app.models.users import Users


DEFAULT_FIXTURE_PATH = Path(__file__).resolve().parents[1] / "test_data" / "test_seed_data.json"

TABLE_ORDER = [
    ("users", Users),
    ("groups", Groups),
    ("group_members", GroupMembers),
    ("chores", Chores),
    ("chore_assignments", ChoreAssignments),
    ("receipts", Receipts),
    ("receipt_items", ReceiptItems),
    ("expenses", Expenses),
    ("expense_splits", ExpenseSplits),
    ("payments", Payments),
]
EXPECTED_TABLE_NAMES = {table_name for table_name, _ in TABLE_ORDER}


def to_decimal(value):
    if value is None:
        return None
    return Decimal(str(value))


def to_datetime(value):
    if value is None:
        return None
    return datetime.fromisoformat(value)


def normalize_datetime(value):
    if value is None:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def parse_fixture(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def ensure_top_level_tables(fixture):
    if not isinstance(fixture, dict):
        raise ValueError("Fixture root must be an object keyed by table names.")

    actual = set(fixture.keys())
    missing = sorted(EXPECTED_TABLE_NAMES - actual)
    extra = sorted(actual - EXPECTED_TABLE_NAMES)
    if missing or extra:
        raise ValueError(
            f"Fixture tables mismatch. Missing: {missing or 'none'} | Extra: {extra or 'none'}"
        )


def validate_row_shape(table_name, model, row, row_index):
    if not isinstance(row, dict):
        raise ValueError(f"{table_name}[{row_index}] must be an object.")

    expected_columns = {column.name for column in model.__table__.columns}
    actual_columns = set(row.keys())

    missing = sorted(expected_columns - actual_columns)
    extra = sorted(actual_columns - expected_columns)
    if missing or extra:
        raise ValueError(
            f"{table_name}[{row_index}] keys mismatch. Missing: {missing or 'none'} | Extra: {extra or 'none'}"
        )


def parse_column_value(column, value):
    if value is None:
        return None

    if isinstance(column.type, Enum):
        enum_class = getattr(column.type, "enum_class", None)
        return enum_class(value) if enum_class else value

    if isinstance(column.type, DateTime):
        return normalize_datetime(to_datetime(value))

    if isinstance(column.type, Numeric):
        return to_decimal(value)

    return value


def upsert_table_rows(db, table_name, model, rows):
    if not isinstance(rows, list):
        raise ValueError(f"{table_name} must be an array of table rows.")

    columns_by_name = {column.name: column for column in model.__table__.columns}
    created = 0
    updated = 0

    for row_index, row in enumerate(rows):
        validate_row_shape(table_name, model, row, row_index)

        parsed_row = {
            column_name: parse_column_value(column, row[column_name])
            for column_name, column in columns_by_name.items()
        }

        row_id = parsed_row["id"]
        existing = db.get(model, row_id)

        if existing is None:
            db.add(model(**parsed_row))
            created += 1
            continue

        has_change = False
        for column_name, value in parsed_row.items():
            if column_name == "id":
                continue
            if getattr(existing, column_name) != value:
                setattr(existing, column_name, value)
                has_change = True

        if has_change:
            updated += 1

    db.commit()
    return created, updated


def count_all(db):
    return {
        "users": db.query(Users).count(),
        "groups": db.query(Groups).count(),
        "group_members": db.query(GroupMembers).count(),
        "chores": db.query(Chores).count(),
        "chore_assignments": db.query(ChoreAssignments).count(),
        "receipts": db.query(Receipts).count(),
        "receipt_items": db.query(ReceiptItems).count(),
        "expenses": db.query(Expenses).count(),
        "expense_splits": db.query(ExpenseSplits).count(),
        "payments": db.query(Payments).count(),
    }


def seed_database(fixture_path: Path):
    fixture = parse_fixture(fixture_path)
    ensure_top_level_tables(fixture)
    model_loader.index()

    created_counts = {table_name: 0 for table_name, _ in TABLE_ORDER}
    updated_counts = {table_name: 0 for table_name, _ in TABLE_ORDER}

    db = SessionLocal()
    try:
        for table_name, model in TABLE_ORDER:
            created, updated = upsert_table_rows(db, table_name, model, fixture[table_name])
            created_counts[table_name] = created
            updated_counts[table_name] = updated

        total_counts = count_all(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seed completed.")
    print("Created rows by table:")
    for key, value in created_counts.items():
        print(f"  {key}: {value}")

    print("Updated rows by table:")
    for key, value in updated_counts.items():
        print(f"  {key}: {value}")

    print("Current total rows by table:")
    for key, value in total_counts.items():
        print(f"  {key}: {value}")


def parse_args():
    parser = argparse.ArgumentParser(description="Seed test JSON data into DivItUp database")
    parser.add_argument(
        "--fixture",
        default=str(DEFAULT_FIXTURE_PATH),
        help="Path to test JSON fixture file",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    seed_database(Path(args.fixture))

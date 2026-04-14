import argparse
import json
import sys
from datetime import datetime
from decimal import Decimal
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.dependencies.database import SessionLocal
from app.models import model_loader
from app.models.chore_assignments import ChoreAssignments, ChoreStatus
from app.models.chores import ChoreFrequency, Chores
from app.models.expense_splits import ExpenseSplits
from app.models.expenses import Expenses, SplitType
from app.models.group_members import GroupMembers, GroupRole
from app.models.groups import Groups
from app.models.payments import Payments
from app.models.receipt_items import ReceiptItems
from app.models.receipts import ReceiptStatus, Receipts
from app.models.users import Users


DEFAULT_FIXTURE_PATH = Path(__file__).resolve().parents[1] / "test_data" / "test_seed_data.json"


def to_decimal(value):
    if value is None:
        return None
    return Decimal(str(value))


def to_datetime(value):
    if value is None:
        return None
    return datetime.fromisoformat(value)


def parse_fixture(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_or_create_user(db, payload, created_counts):
    item = db.query(Users).filter(Users.email == payload["email"]).first()
    if item:
        return item

    item = Users(
        username=payload["username"],
        email=payload["email"],
        password_hash=payload["password_hash"],
        full_name=payload["full_name"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    created_counts["users"] += 1
    return item


def get_or_create_group(db, payload, user_map, created_counts):
    item = db.query(Groups).filter(Groups.invite_code == payload["invite_code"]).first()
    if item:
        return item

    item = Groups(
        name=payload["name"],
        invite_code=payload["invite_code"],
        created_by=user_map[payload["created_by"]].id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    created_counts["groups"] += 1
    return item


def seed_users(db, fixture, created_counts):
    user_map = {}
    for user_data in fixture.get("users", []):
        user_map[user_data["key"]] = get_or_create_user(db, user_data, created_counts)
    return user_map


def seed_groups(db, fixture, user_map, created_counts):
    group_map = {}
    for group_data in fixture.get("groups", []):
        group_map[group_data["key"]] = get_or_create_group(db, group_data, user_map, created_counts)
    return group_map


def seed_group_members(db, fixture, user_map, group_map, created_counts):
    for payload in fixture.get("group_members", []):
        group_id = group_map[payload["group"]].id
        user_id = user_map[payload["user"]].id

        existing = (
            db.query(GroupMembers)
            .filter(GroupMembers.group_id == group_id, GroupMembers.user_id == user_id)
            .first()
        )
        if existing:
            continue

        item = GroupMembers(
            group_id=group_id,
            user_id=user_id,
            role=GroupRole(payload["role"]),
            is_restricted=payload["is_restricted"],
        )
        db.add(item)
        db.commit()
        created_counts["group_members"] += 1


def seed_chores(db, fixture, group_map, created_counts):
    chore_map = {}
    for payload in fixture.get("chores", []):
        group_id = group_map[payload["group"]].id
        existing = (
            db.query(Chores)
            .filter(Chores.group_id == group_id, Chores.title == payload["title"])
            .first()
        )
        if existing:
            chore_map[payload["key"]] = existing
            continue

        item = Chores(
            group_id=group_id,
            title=payload["title"],
            frequency=ChoreFrequency(payload["frequency"]),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        created_counts["chores"] += 1
        chore_map[payload["key"]] = item
    return chore_map


def seed_chore_assignments(db, fixture, chore_map, user_map, created_counts):
    for payload in fixture.get("chore_assignments", []):
        chore_id = chore_map[payload["chore"]].id
        assigned_to = user_map[payload["assigned_to"]].id
        due_date = to_datetime(payload["due_date"])

        existing = (
            db.query(ChoreAssignments)
            .filter(
                ChoreAssignments.chore_id == chore_id,
                ChoreAssignments.assigned_to == assigned_to,
                ChoreAssignments.due_date == due_date,
            )
            .first()
        )
        if existing:
            continue

        item = ChoreAssignments(
            chore_id=chore_id,
            assigned_to=assigned_to,
            due_date=due_date,
            status=ChoreStatus(payload["status"]),
            completed_at=to_datetime(payload["completed_at"]),
        )
        db.add(item)
        db.commit()
        created_counts["chore_assignments"] += 1


def seed_receipts(db, fixture, group_map, user_map, created_counts):
    receipt_map = {}
    for payload in fixture.get("receipts", []):
        group_id = group_map[payload["group"]].id
        existing = (
            db.query(Receipts)
            .filter(Receipts.group_id == group_id, Receipts.image_url == payload["image_url"])
            .first()
        )
        if existing:
            receipt_map[payload["key"]] = existing
            continue

        item = Receipts(
            group_id=group_id,
            uploaded_by=user_map[payload["uploaded_by"]].id,
            image_url=payload["image_url"],
            total_extracted=to_decimal(payload["total_extracted"]),
            status=ReceiptStatus(payload["status"]),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        created_counts["receipts"] += 1
        receipt_map[payload["key"]] = item
    return receipt_map


def seed_receipt_items(db, fixture, receipt_map, created_counts):
    for payload in fixture.get("receipt_items", []):
        receipt_id = receipt_map[payload["receipt"]].id
        unit_price = to_decimal(payload["unit_price"])

        existing = (
            db.query(ReceiptItems)
            .filter(
                ReceiptItems.receipt_id == receipt_id,
                ReceiptItems.item_name == payload["item_name"],
                ReceiptItems.quantity == payload["quantity"],
                ReceiptItems.unit_price == unit_price,
            )
            .first()
        )
        if existing:
            continue

        item = ReceiptItems(
            receipt_id=receipt_id,
            item_name=payload["item_name"],
            quantity=payload["quantity"],
            unit_price=unit_price,
        )
        db.add(item)
        db.commit()
        created_counts["receipt_items"] += 1


def seed_expenses(db, fixture, group_map, user_map, receipt_map, created_counts):
    expense_map = {}
    for payload in fixture.get("expenses", []):
        group_id = group_map[payload["group"]].id
        total_amount = to_decimal(payload["total_amount"])

        existing = (
            db.query(Expenses)
            .filter(
                Expenses.group_id == group_id,
                Expenses.title == payload["title"],
                Expenses.total_amount == total_amount,
            )
            .first()
        )
        if existing:
            expense_map[payload["key"]] = existing
            continue

        receipt_id = None
        if payload.get("receipt"):
            receipt_id = receipt_map[payload["receipt"]].id

        item = Expenses(
            group_id=group_id,
            paid_by=user_map[payload["paid_by"]].id,
            receipt_id=receipt_id,
            title=payload["title"],
            total_amount=total_amount,
            split_type=SplitType(payload["split_type"]),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        created_counts["expenses"] += 1
        expense_map[payload["key"]] = item
    return expense_map


def seed_expense_splits(db, fixture, expense_map, user_map, created_counts):
    split_map = {}
    for payload in fixture.get("expense_splits", []):
        expense_id = expense_map[payload["expense"]].id
        user_id = user_map[payload["user"]].id

        existing = (
            db.query(ExpenseSplits)
            .filter(ExpenseSplits.expense_id == expense_id, ExpenseSplits.user_id == user_id)
            .first()
        )
        if existing:
            split_map[(payload["expense"], payload["user"])] = existing
            continue

        item = ExpenseSplits(
            expense_id=expense_id,
            user_id=user_id,
            amount_owed=to_decimal(payload["amount_owed"]),
            is_settled=payload["is_settled"],
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        created_counts["expense_splits"] += 1
        split_map[(payload["expense"], payload["user"])] = item
    return split_map


def seed_payments(db, fixture, user_map, split_map, created_counts):
    for payload in fixture.get("payments", []):
        split_key = (payload["expense"], payload["payer"])
        expense_split_id = split_map.get(split_key).id if split_map.get(split_key) else None
        paid_at = to_datetime(payload["paid_at"])
        amount = to_decimal(payload["amount"])

        existing = (
            db.query(Payments)
            .filter(
                Payments.payer_id == user_map[payload["payer"]].id,
                Payments.payee_id == user_map[payload["payee"]].id,
                Payments.amount == amount,
                Payments.paid_at == paid_at,
            )
            .first()
        )
        if existing:
            continue

        item = Payments(
            payer_id=user_map[payload["payer"]].id,
            payee_id=user_map[payload["payee"]].id,
            expense_split_id=expense_split_id,
            amount=amount,
            paid_at=paid_at,
        )
        db.add(item)
        db.commit()
        created_counts["payments"] += 1


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
    model_loader.index()

    created_counts = {
        "users": 0,
        "groups": 0,
        "group_members": 0,
        "chores": 0,
        "chore_assignments": 0,
        "receipts": 0,
        "receipt_items": 0,
        "expenses": 0,
        "expense_splits": 0,
        "payments": 0,
    }

    db = SessionLocal()
    try:
        user_map = seed_users(db, fixture, created_counts)
        group_map = seed_groups(db, fixture, user_map, created_counts)
        seed_group_members(db, fixture, user_map, group_map, created_counts)
        chore_map = seed_chores(db, fixture, group_map, created_counts)
        seed_chore_assignments(db, fixture, chore_map, user_map, created_counts)
        receipt_map = seed_receipts(db, fixture, group_map, user_map, created_counts)
        seed_receipt_items(db, fixture, receipt_map, created_counts)
        expense_map = seed_expenses(db, fixture, group_map, user_map, receipt_map, created_counts)
        split_map = seed_expense_splits(db, fixture, expense_map, user_map, created_counts)
        seed_payments(db, fixture, user_map, split_map, created_counts)

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

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..controllers import expenses as controller
from ..schemas import expenses as schema
from ..dependencies.database import engine, get_db

router = APIRouter(
    tags=['Expenses'],
    prefix="/expenses"
)

@router.post("/", response_model=schema.Expense)
def create(request: schema.ExpenseCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("/", response_model=list[schema.Expense])
def read_all(group_id: int = None, db: Session = Depends(get_db)):
    if group_id:
        return controller.read_all_by_group(db, group_id)
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.Expense)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)

@router.put("/{item_id}", response_model=schema.Expense)
def update(item_id: int, request: schema.ExpenseUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
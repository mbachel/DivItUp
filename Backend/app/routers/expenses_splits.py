from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..controllers import expense_splits as controller
from ..schemas import expense_splits as schema
from ..dependencies.database import engine, get_db

router = APIRouter(
    tags=['Expense Splits'],
    prefix="/expense-splits"
)

@router.post("/", response_model=schema.ExpenseSplit)
def create(request: schema.ExpenseSplitCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("/", response_model=list[schema.ExpenseSplit])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.ExpenseSplit)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)

@router.put("/{item_id}", response_model=schema.ExpenseSplit)
def update(item_id: int, request: schema.ExpenseSplitUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
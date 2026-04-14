from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..controllers import receipt_items as controller
from ..schemas import receipt_items as schema
from ..dependencies.database import engine, get_db

router = APIRouter(
    tags=['Receipt Items'],
    prefix="/receipt-items"
)

@router.post("", response_model=schema.ReceiptItem)
def create(request: schema.ReceiptItemCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("", response_model=list[schema.ReceiptItem])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.ReceiptItem)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)

@router.put("/{item_id}", response_model=schema.ReceiptItem)
def update(item_id: int, request: schema.ReceiptItemUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
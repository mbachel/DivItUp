from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response
from ..models import expense_splits as model
from sqlalchemy.exc import SQLAlchemyError

def create(db: Session, request):
    new_split = model.ExpenseSplits(
        expense_id=request.expense_id,
        user_id=request.user_id,
        amount_owed=request.amount_owed,
        is_settled=request.is_settled
    )
    try:
        db.add(new_split)
        db.commit()
        db.refresh(new_split)
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return new_split

def read_all(db: Session):
    try:
        result = db.query(model.ExpenseSplits).all()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return result

def read_one(db: Session, item_id):
    try:
        item = db.query(model.ExpenseSplits).filter(model.ExpenseSplits.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense split not found!")
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item

def update(db: Session, item_id, request):
    try:
        item = db.query(model.ExpenseSplits).filter(model.ExpenseSplits.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense split not found!")
        update_data = request.dict(exclude_unset=True)
        item.update(update_data, synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item.first()

def delete(db: Session, item_id):
    try:
        item = db.query(model.ExpenseSplits).filter(model.ExpenseSplits.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense split not found!")
        item.delete(synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
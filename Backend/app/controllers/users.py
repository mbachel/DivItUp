from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Response
from ..models import users as model
from ..dependencies.security import hash_password
from sqlalchemy.exc import SQLAlchemyError

def create(db: Session, request):
    new_user = model.Users(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password_hash),
        full_name=request.full_name
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return new_user

def read_all(db: Session):
    try:
        result = db.query(model.Users).all()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return result

def read_one(db: Session, item_id):
    try:
        item = db.query(model.Users).filter(model.Users.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found!")
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item

def update(db: Session, item_id, request):
    try:
        item = db.query(model.Users).filter(model.Users.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found!")
        update_data = request.dict(exclude_unset=True)
        if "password_hash" in update_data and update_data["password_hash"] is not None:
            update_data["password_hash"] = hash_password(update_data["password_hash"])
        item.update(update_data, synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return item.first()

def delete(db: Session, item_id):
    try:
        item = db.query(model.Users).filter(model.Users.id == item_id)
        if not item.first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found!")
        item.delete(synchronize_session=False)
        db.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..controllers import groups as controller
from ..schemas import groups as schema
from ..dependencies.database import engine, get_db

router = APIRouter(
    tags=['Groups'],
    prefix="/groups"
)

@router.post("", response_model=schema.Group)
def create(request: schema.GroupCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("", response_model=list[schema.Group])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.Group)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)

@router.put("/{item_id}", response_model=schema.Group)
def update(item_id: int, request: schema.GroupUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
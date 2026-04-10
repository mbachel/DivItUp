from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..controllers import chores as controller
from ..schemas import chores as schema
from ..dependencies.database import engine, get_db

router = APIRouter(
    tags=['Chores'],
    prefix="/chores"
)

@router.post("/", response_model=schema.Chore)
def create(request: schema.ChoreCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("/", response_model=list[schema.Chore])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.Chore)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id=item_id)

@router.put("/{item_id}", response_model=schema.Chore)
def update(item_id: int, request: schema.ChoreUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, request=request, item_id=item_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
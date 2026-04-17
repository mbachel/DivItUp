from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .dependencies.database import get_db
from .dependencies.auth_cookies import clear_auth_cookie, set_auth_cookie
from .dependencies.security import verify_password
from .models import users as user_model
from .routers.auth import create_access_token, get_current_user


router = APIRouter(
    tags=['Authentication'],
    prefix="/auth"
)


@router.post("/login")
def login(
    response: Response,
    request: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(user_model.Users)
        .filter(
            or_(
                user_model.Users.username == request.username,
                user_model.Users.email == request.username,
            )
        )
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    access_token = create_access_token(subject=user.username)
    set_auth_cookie(response, access_token)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
        },
    }


@router.get("/me")
def me(current_user: user_model.Users = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
    }


@router.post("/logout")
def logout(
    response: Response,
    _current_user: user_model.Users = Depends(get_current_user),
):
    clear_auth_cookie(response)
    response.status_code = status.HTTP_200_OK
    return {"detail": "Logged out"}

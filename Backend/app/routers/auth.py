import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..dependencies.database import get_db
from ..dependencies.auth_cookies import AUTH_COOKIE_NAME
from ..models import users as user_model


env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(dotenv_path=env_path)


SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": subject,
        "iat": now.timestamp(),
        "exp": expire.timestamp()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    cookie_token = request.cookies.get(AUTH_COOKIE_NAME)
    selected_token = cookie_token or token

    if selected_token is None:
        raise credentials_exception

    if selected_token.lower().startswith("bearer "):
        selected_token = selected_token[7:]

    payload = decode_access_token(selected_token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = db.query(user_model.Users).filter(user_model.Users.username == username).first()
    if user is None:
        raise credentials_exception
    return user


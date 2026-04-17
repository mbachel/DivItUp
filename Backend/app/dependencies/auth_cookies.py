import os
from fastapi import Response


AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "divitup_access_token")
AUTH_COOKIE_PATH = os.getenv("AUTH_COOKIE_PATH", "/")
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax").lower()
AUTH_COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() in (
    "1",
    "true",
    "yes",
    "on",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
AUTH_COOKIE_MAX_AGE_SECONDS = int(
    os.getenv("AUTH_COOKIE_MAX_AGE_SECONDS", str(ACCESS_TOKEN_EXPIRE_MINUTES * 60))
)


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=AUTH_COOKIE_MAX_AGE_SECONDS,
        expires=AUTH_COOKIE_MAX_AGE_SECONDS,
        path=AUTH_COOKIE_PATH,
        httponly=True,
        secure=AUTH_COOKIE_SECURE,
        samesite=AUTH_COOKIE_SAMESITE,
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        path=AUTH_COOKIE_PATH,
    )
    if AUTH_COOKIE_PATH != "/api":
        response.delete_cookie(
            key=AUTH_COOKIE_NAME,
            path="/api",
        )

"""FastAPI dependency that resolves the current authenticated user from the
session cookie, for use on every route that requires a signed-in user."""

from fastapi import Cookie, HTTPException, status

from app import db
from app.auth.security import COOKIE_NAME, decode_access_token
from app.schemas import UserResponse

UNAUTHENTICATED = HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")


def get_current_user(access_token: str | None = Cookie(default=None, alias=COOKIE_NAME)) -> UserResponse:
    if access_token is None:
        raise UNAUTHENTICATED
    user_id = decode_access_token(access_token)
    if user_id is None:
        raise UNAUTHENTICATED
    with db.get_connection() as conn:
        row = conn.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise UNAUTHENTICATED
    return UserResponse(id=row["id"], email=row["email"])

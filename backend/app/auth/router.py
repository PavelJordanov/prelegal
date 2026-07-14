"""Sign-up, sign-in, sign-out, and current-user routes.

Session state travels as a JWT in an HttpOnly cookie rather than a bearer
token in localStorage, since the frontend is a static export served
same-origin by this API (see ``app/main.py``) - the browser attaches the
cookie automatically on every fetch, so no client-side token handling is
needed and the token isn't reachable from page JavaScript (XSS-resistant).
"""

import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app import db
from app.auth.deps import get_current_user
from app.auth.security import COOKIE_NAME, JWT_EXPIRY, create_access_token, hash_password, verify_password
from app.schemas import AuthRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_MAX_AGE_SECONDS = int(JWT_EXPIRY.total_seconds())


def _set_session_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(user_id),
        httponly=True,
        samesite="lax",
        max_age=COOKIE_MAX_AGE_SECONDS,
        path="/",
    )


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(request: AuthRequest, response: Response) -> UserResponse:
    password_hash = hash_password(request.password)
    try:
        with db.get_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (request.email, password_hash),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "An account with this email already exists."
        ) from exc

    _set_session_cookie(response, user_id)
    return UserResponse(id=user_id, email=request.email)


@router.post("/signin", response_model=UserResponse)
def signin(request: AuthRequest, response: Response) -> UserResponse:
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (request.email,)
        ).fetchone()

    if row is None or not verify_password(request.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    _set_session_cookie(response, row["id"])
    return UserResponse(id=row["id"], email=row["email"])


@router.post("/signout", status_code=status.HTTP_204_NO_CONTENT)
def signout(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


@router.get("/me", response_model=UserResponse)
def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user

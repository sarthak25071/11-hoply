"""Auth routes: user registration and access-token issuance.

Implements:
  POST /auth/register  -> registerUser
  POST /auth/token     -> issueToken
"""

from typing import Annotated

from app.api.deps import get_db
from app.core.security import create_access_token, verify_password
from app.crud import user as user_crud
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import User, UserRegistration
from fastapi import (APIRouter, Depends, HTTPException, Request, Response,
                     status)
from sqlalchemy.orm import Session

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    operation_id="registerUser",
)
def register_user(
    payload: UserRegistration,
    request: Request,
    response: Response,
    db: DbSession,
) -> User:
    """Create a new user account so a traveller can join Hoply; rejects duplicate email/phone."""
    if user_crud.get_by_email(db, str(payload.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )
    if user_crud.get_by_phone(db, payload.phone_number):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this phone number already exists.",
        )

    user = user_crud.create(db, payload)
    response.headers["Location"] = f"{request.url_for('registerUser')}/{user.user_id}"
    return User.model_validate(user)


@router.post(
    "/token",
    summary="Exchange credentials for an access token",
    operation_id="issueToken",
)
def issue_token(credentials: LoginRequest, db: DbSession) -> TokenResponse:
    """Verify login credentials and issue a JWT so the client can authenticate later requests."""
    user = user_crud.get_by_email(db, str(credentials.email))
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token, expires_in = create_access_token(subject=str(user.user_id))
    return TokenResponse(access_token=token, token_type="Bearer", expires_in=expires_in)

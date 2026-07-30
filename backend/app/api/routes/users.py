"""User routes: authenticated account and public traveller profiles.

Implements:
  GET   /users/me       -> getCurrentUser
  PATCH /users/me       -> updateCurrentUser
  GET   /users/{userId} -> getUserById
"""

from typing import Annotated

from app.api.deps import get_current_user, get_db
from app.crud import user as user_crud
from app.models.user import User as UserModel
from app.schemas.user import TravellerProfile, User, UserUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[UserModel, Depends(get_current_user)]


@router.get(
    "/me",
    summary="Get the authenticated user",
    operation_id="getCurrentUser",
)
def get_current_user_profile(current_user: CurrentUser) -> User:
    """Return the authenticated user's own account so the client can render their profile."""
    return User.model_validate(current_user)


@router.patch(
    "/me",
    summary="Update the authenticated user's profile",
    operation_id="updateCurrentUser",
)
def update_current_user(
    payload: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> User:
    """Apply a partial update to the authenticated user's profile and return the saved record."""
    user = user_crud.update(db, current_user, payload)
    return User.model_validate(user)


@router.get(
    "/{user_id}",
    summary="Get a public traveller profile",
    operation_id="getUserById",
)
def get_user_by_id(user_id: str, db: DbSession) -> TravellerProfile:
    """Return a traveller's public profile (without contact details) for discovery views."""
    user = _get_user_or_404(db, user_id)
    return TravellerProfile.model_validate(user)


def _get_user_or_404(db: Session, user_id: str) -> UserModel:
    """Resolve an opaque string user id to a stored user or raise 404."""
    try:
        primary_key = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        ) from None

    user = user_crud.get_by_id(db, primary_key)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user

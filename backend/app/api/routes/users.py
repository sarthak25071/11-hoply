"""User routes: profile retrieval and updates."""

from typing import Annotated

from app.api.deps import get_current_user, get_db
from app.crud import user as user_crud
from app.models.user import User as UserModel
from app.schemas.user import User, UserUpdate
from fastapi import APIRouter, Depends, status
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
    """Return the authenticated user's profile."""
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
    """Update profile fields for the authenticated user."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return User.model_validate(current_user)

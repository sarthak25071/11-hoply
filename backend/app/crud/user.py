"""CRUD operations for the User model."""

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserRegistration, UserUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def get_by_id(db: Session, user_id: int) -> User | None:
    """Fetch a user by primary key (used for auth resolution and profile lookups)."""
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    """Look up a user by email (used for login and duplicate-registration checks)."""
    return db.scalar(select(User).where(User.email == email))


def get_by_phone(db: Session, phone_number: str) -> User | None:
    """Look up a user by phone number to enforce phone uniqueness at registration."""
    return db.scalar(select(User).where(User.phone_number == phone_number))


def create(db: Session, data: UserRegistration) -> User:
    """Persist a new user with a hashed password and return the stored record."""
    user = User(
        name=data.name,
        email=str(data.email),
        password_hash=hash_password(data.password),
        phone_number=data.phone_number,
        age=data.age,
        gender=data.gender,
        description=data.description,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, user: User, data: UserUpdate) -> User:
    """Apply a partial update to an existing user and persist the change."""
    changes = data.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

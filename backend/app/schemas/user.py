"""User schemas (mirrors UserRegistration / User in openapi.yaml)."""

from datetime import datetime

from app.models.user import Gender
from app.schemas.base import CamelModel
from pydantic import EmailStr, Field, field_serializer


class UserRegistration(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    phone_number: str = Field(max_length=20, examples=["+919876543210"])
    age: int | None = Field(default=None, ge=13, le=120)
    gender: Gender = Gender.prefer_not_to_say
    description: str | None = Field(default=None, max_length=1000)


class UserUpdate(CamelModel):
    """Fields a user may update (all optional; omitted fields are unchanged)."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=13, le=120)
    gender: Gender | None = None
    description: str | None = Field(default=None, max_length=1000)
    profession: str | None = Field(default=None, max_length=100)
    hometown: str | None = Field(default=None, max_length=100)
    profile_photo: str | None = Field(default=None)


class User(CamelModel):
    """Public representation of a user (no password hash)."""

    user_id: int
    name: str
    email: EmailStr
    phone_number: str
    age: int | None = None
    gender: Gender
    description: str | None = None
    profession: str | None = None
    hometown: str | None = None
    profile_photo: str | None = None
    created_at: datetime
    updated_at: datetime

    @field_serializer("user_id")
    def _serialize_user_id(self, value: int) -> str:
        # IDs are opaque strings in the API contract.
        return str(value)

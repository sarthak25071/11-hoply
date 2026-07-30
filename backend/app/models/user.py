"""User ORM model (maps to the `users` table in schema.sql)."""

import enum
from datetime import datetime

from app.core.database import Base
from sqlalchemy import BigInteger, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[Gender] = mapped_column(
        Enum(Gender, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=Gender.prefer_not_to_say,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_photo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

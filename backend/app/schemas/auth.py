"""Auth schemas (mirrors LoginRequest / TokenResponse in openapi.yaml)."""

from app.schemas.base import CamelModel
from pydantic import EmailStr


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int

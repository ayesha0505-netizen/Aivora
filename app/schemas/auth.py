from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for new user registration credentials and profile information."""

    email: EmailStr = Field(description="User's valid email address")
    password: str = Field(min_length=6, description="Password with minimum 6 characters")
    first_name: Optional[str] = Field(default=None, description="User's first name")
    last_name: Optional[str] = Field(default=None, description="User's last name")
    full_name: Optional[str] = Field(default=None, description="User's full name")
    auth_provider: str = Field(
        default="local", description="Authentication provider (local, google, github)"
    )


class UserLogin(BaseModel):
    """Schema for user authentication credentials."""

    email: EmailStr = Field(description="Registered email address")
    password: str = Field(description="Account password")


class SocialLoginRequest(BaseModel):
    """Schema for social login token verification."""
    
    token: str = Field(description="OAuth2 provider access token or credential")


class UserPreferenceResponse(BaseModel):
    """Schema for serialized user preferences."""

    preferences: dict[str, Any]
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    """Schema representing public user profile and initialized preferences."""

    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    auth_provider: Optional[str] = "local"
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    preferences: Optional[UserPreferenceResponse] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """OAuth2 standard JWT bearer token response schema."""

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Decoded JWT payload structure."""

    sub: Optional[str] = None
    exp: Optional[int] = None
    type: str = "access"


class ForgotPasswordRequest(BaseModel):
    """Schema for requesting password recovery notification."""

    email: EmailStr = Field(description="Account email address for password reset")

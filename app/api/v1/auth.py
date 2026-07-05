from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/signup",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account and initialize ADK memory bank",
)
async def signup(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """Register a new user account, synthesize default ADK user preferences, and return bearer tokens."""
    return await AuthService.register_user(db, user_in)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate credentials and return access tokens",
)
async def login(
    login_in: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """Verify user credentials and issue JWT access and refresh tokens."""
    return await AuthService.authenticate_user(db, login_in)


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Initiate password recovery flow",
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Trigger MCP notification tool to send password recovery instructions."""
    return await AuthService.initiate_password_reset(db, request.email)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve current authenticated user profile and ADK memory bank",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Return profile and initialized ADK preferences of the logged-in user."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/{provider}",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Handle social OAuth login (Google / GitHub)",
)
async def social_login(
    provider: str,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """Simulate OAuth callback and return token for development verification."""
    provider_clean = provider.lower().strip()
    if provider_clean not in ["google", "github"]:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Unsupported OAuth provider.")

    mock_email = f"user.{provider_clean}@aivora.ai"
    user_create = UserCreate(
        email=mock_email,
        password=f"oauth-secret-{provider_clean}-2026",
        first_name="Social",
        last_name=provider_clean.capitalize(),
        auth_provider=provider_clean,
    )
    try:
        return await AuthService.register_user(db, user_create)
    except Exception:
        # If user already exists, authenticate them
        login_in = UserLogin(email=mock_email, password=f"oauth-secret-{provider_clean}-2026")
        return await AuthService.authenticate_user(db, login_in)

"""Authentication API router for user registration, login, and profile retrieval."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, get_current_user, get_password_hash, verify_password
from app.database import get_db
from app.models import User
from app.schemas import (
    ForgotPasswordRequest,
    PasswordResetResponse,
    SocialLoginRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
import httpx

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Register a new user account and return a JWT access token."""
    # Check if email is already taken
    existing_result = await db.execute(select(User).where(User.email == user_data.email))
    if existing_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate JWT token
    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Authenticate user credentials and return a JWT access token."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_login(request_data: SocialLoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Authenticate user with Google access token."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {request_data.token}"}
        )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google access token",
        )
        
    user_info = response.json()
    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            email=email,
            first_name=user_info.get("given_name"),
            last_name=user_info.get("family_name"),
            full_name=user_info.get("name"),
            auth_provider="google",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
) -> PasswordResetResponse:
    """Process a password reset request."""
    result = await db.execute(select(User).where(User.email == request_data.email))
    user = result.scalar_one_or_none()

    # In production, send an actual email via SendGrid/SES. For dev/security, return success either way.
    return PasswordResetResponse(
        message="If an account exists with this email, instructions to reset your password have been sent.",
        reset_token="mock-reset-token-for-dev-only" if user else None,
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.onboarding_agent import OnboardingInput, run_onboarding_agent
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserPreference
from app.schemas.auth import Token, UserCreate, UserLogin, UserResponse
from app.tools.notification_tool import send_notification_tool


class AuthService:
    """Service class encapsulating authentication, user registration, and ADK onboarding business logic."""

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Retrieve a user by their email address with preferences eagerly loaded."""
        stmt = select(User).options(selectinload(User.preferences)).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def register_user(cls, db: AsyncSession, user_in: UserCreate) -> Token:
        """Register a new user account, initialize their ADK memory bank, and return auth tokens."""
        existing_user = await cls.get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists.",
            )

        hashed_password = get_password_hash(user_in.password) if user_in.password else None
        new_user = User(
            email=user_in.email,
            password_hash=hashed_password,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            auth_provider=user_in.auth_provider,
            is_active=True,
        )
        db.add(new_user)
        await db.flush()  # Flush to generate new_user.id without committing

        # Trigger ADK Onboarding Agent to synthesize default user preferences
        onboarding_input = OnboardingInput(
            user_id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
        )
        onboarding_result = await run_onboarding_agent(onboarding_input)

        user_pref = UserPreference(
            user_id=new_user.id,
            preferences=onboarding_result.default_preferences,
        )
        db.add(user_pref)
        await db.commit()

        # Reload user with preferences
        user_loaded = await cls.get_user_by_email(db, new_user.email)
        if not user_loaded:
            raise HTTPException(status_code=500, detail="Failed to load user post-registration")

        access_token = create_access_token(subject=user_loaded.id)
        refresh_token = create_refresh_token(subject=user_loaded.id)

        user_resp = UserResponse.model_validate(user_loaded)
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def authenticate_user(cls, db: AsyncSession, login_in: UserLogin) -> Token:
        """Authenticate user credentials and issue access/refresh tokens."""
        user = await cls.get_user_by_email(db, login_in.email)
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been deactivated.",
            )

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        user_resp = UserResponse.model_validate(user)
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_resp,
        )

    @staticmethod
    async def initiate_password_reset(db: AsyncSession, email: str) -> dict[str, str]:
        """Initiate password recovery flow using the MCP notification tool."""
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            reset_token = create_access_token(subject=user.id)
            recovery_link = f"http://localhost:3000/?reset={reset_token}"
            body_text = (
                f"Hello {user.first_name or 'Aivora User'},\n\n"
                f"We received a request to reset your Aivora account password. "
                f"Click the link below to set a new password:\n{recovery_link}\n\n"
                "If you did not request this, please ignore this email."
            )
            try:
                await send_notification_tool(
                    recipient_email=user.email,
                    subject="Reset Your Aivora Password",
                    message_body=body_text,
                    notification_type="email",
                )
            except Exception as e:
                # Log error but don't expose internal failure details to client
                import logging

                logging.getLogger("aivora.services.auth").error(f"Failed sending reset email: {e}")

        # Always return success message to prevent user enumeration attacks
        return {"message": "If an account with that email exists, a password reset link has been sent."}

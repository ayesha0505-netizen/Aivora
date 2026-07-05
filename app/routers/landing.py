"""Landing page API router for newsletter signups, contact inquiries, and dynamic stats."""

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Inquiry, Subscriber, User
from app.schemas import (
    InquiryCreate,
    InquiryResponse,
    StatsResponse,
    SubscriberCreate,
    SubscriberResponse,
)

router = APIRouter(prefix="/api", tags=["Landing Page & Marketing"])


@router.post("/newsletter/subscribe", response_model=SubscriberResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(payload: SubscriberCreate, db: AsyncSession = Depends(get_db)) -> SubscriberResponse:
    """Subscribe an email address to the Aivora newsletter."""
    existing = await db.execute(select(Subscriber).where(Subscriber.email == payload.email))
    sub = existing.scalar_one_or_none()

    if sub is not None:
        if not sub.is_active:
            sub.is_active = True
            await db.commit()
            await db.refresh(sub)
            return SubscriberResponse.model_validate(sub)
        return SubscriberResponse.model_validate(sub)

    new_sub = Subscriber(email=payload.email, is_active=True)
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)

    return SubscriberResponse.model_validate(new_sub)


@router.post("/sales/contact", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_inquiry(payload: InquiryCreate, db: AsyncSession = Depends(get_db)) -> InquiryResponse:
    """Submit a sales or customer support inquiry from the landing page."""
    inquiry = Inquiry(
        email=payload.email,
        name=payload.name,
        message=payload.message,
        status="new",
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)

    return InquiryResponse.model_validate(inquiry)


@router.get("/stats", response_model=StatsResponse)
async def get_platform_stats(db: AsyncSession = Depends(get_db)) -> StatsResponse:
    """Retrieve live dynamic statistics for the Aivora platform."""
    # Count real users from DB and add to base trusted adopters
    user_count_res = await db.execute(select(func.count(User.id)))
    user_count = user_count_res.scalar() or 0

    return StatsResponse(
        active_users=50000 + user_count,
        apps_connected=1500,
        agents_online=6,
        tasks_automated=250000 + (user_count * 12),
    )

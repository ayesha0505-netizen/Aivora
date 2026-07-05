"""API v1 Routers."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.routers.assistant import router as assistant_router
from app.routers.dashboard import router as dashboard_router
from app.routers.weather import router as weather_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication & Onboarding"])
api_router.include_router(assistant_router, prefix="/assistant")
api_router.include_router(dashboard_router, prefix="/dashboard")
api_router.include_router(weather_router, prefix="/weather")

__all__ = ["api_router"]

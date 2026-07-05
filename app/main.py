from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # Ensure models are loaded for table creation
from app.api.v1 import api_router as v1_router
from app.config import get_settings
from app.database import Base, engine
from app.routers import auth as marketing_auth_router
from app.routers import landing as marketing_landing_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for database initialization and shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Aivora Personal Life Manager & Concierge API",
    description="Backend Concierge API, ADK Multi-Agent Coordinator, and Marketing Gateway for Aivora.",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include both advanced full-stack v1 router and marketing routers
app.include_router(v1_router, prefix="/api/v1")
app.include_router(marketing_auth_router.router)
app.include_router(marketing_landing_router.router)


@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check() -> dict[str, str]:
    """Health check endpoint to verify backend server status."""
    return {"status": "ok", "service": "aivora-backend", "version": "0.1.0"}

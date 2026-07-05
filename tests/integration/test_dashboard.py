import httpx
import pytest
import pytest_asyncio

from app.database import Base, engine
from app.main import app

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_test_db():
    """Initialize test database schema before test run."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def test_dashboard_summary_endpoint():
    """Verify /api/v1/dashboard/summary seeds default data and returns rich payload."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. Signup a new user
        signup_resp = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "sarah.connor@aivora.ai",
                "password": "SecurePassword123!",
                "first_name": "Sarah",
                "last_name": "Connor",
            },
        )
        assert signup_resp.status_code == 201
        token = signup_resp.json()["access_token"]

        # 2. Call /api/v1/dashboard/summary with bearer token
        headers = {"Authorization": f"Bearer {token}"}
        dash_resp = await client.get("/api/v1/dashboard/summary", headers=headers)
        assert dash_resp.status_code == 200
        data = dash_resp.json()

        # 3. Verify seeded data and AI insight
        assert data["user_name"] == "Sarah"
        assert "ai_insight" in data
        assert len(data["schedule_events"]) == 3
        assert len(data["recent_notes"]) == 3
        assert len(data["shopping_items"]) == 3
        assert data["budget_weekly_limit"] == 1600.0
        assert data["budget_spent_this_week"] > 0
        assert data["upcoming_trip"] is not None
        assert "London" in data["upcoming_trip"]["destination"]

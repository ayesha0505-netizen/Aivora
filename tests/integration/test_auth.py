import httpx
import pytest
import pytest_asyncio

from app.database import Base, engine
from app.main import app

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_test_db():
    """Initialize test database schema before each test run."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def test_health_check():
    """Verify system health endpoint returns ok status."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "aivora-backend"


async def test_signup_success():
    """Verify user registration creates account and initializes ADK memory bank."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "email": "test.user@aivora.ai",
            "password": "SecurePassword123!",
            "first_name": "Test",
            "last_name": "User",
        }
        response = await client.post("/api/v1/auth/signup", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test.user@aivora.ai"
        assert data["user"]["preferences"] is not None
        assert "concierge_persona" in data["user"]["preferences"]["preferences"]


async def test_signup_duplicate_email():
    """Verify duplicate email registration returns 409 Conflict."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "email": "test.user@aivora.ai",
            "password": "AnotherPassword123!",
            "first_name": "Duplicate",
        }
        await client.post("/api/v1/auth/signup", json=payload)
        response = await client.post("/api/v1/auth/signup", json=payload)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]


async def test_login_success():
    """Verify valid login returns JWT access and refresh tokens."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "email": "test.user@aivora.ai",
            "password": "SecurePassword123!",
        }
        await client.post("/api/v1/auth/signup", json=payload)
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data


async def test_login_invalid_password():
    """Verify invalid login password returns 401 Unauthorized."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "email": "test.user@aivora.ai",
            "password": "WrongPassword!",
        }
        await client.post("/api/v1/auth/signup", json={"email": "test.user@aivora.ai", "password": "SecurePassword123!"})
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 401


async def test_protected_me_endpoint():
    """Verify /api/v1/auth/me returns profile with valid bearer token and 401 without token."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        # First signup and login to get token
        await client.post(
            "/api/v1/auth/signup",
            json={"email": "test.user@aivora.ai", "password": "SecurePassword123!"},
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test.user@aivora.ai", "password": "SecurePassword123!"},
        )
        token = login_resp.json()["access_token"]

        # Call /me with token
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = await client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "test.user@aivora.ai"

        # Call /me without token
        unauth_resp = await client.get("/api/v1/auth/me")
        assert unauth_resp.status_code == 401


async def test_forgot_password():
    """Verify forgot password triggers MCP notification tool cleanly."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {"email": "test.user@aivora.ai"}
        response = await client.post("/api/v1/auth/forgot-password", json=payload)
        assert response.status_code == 200
        assert "password reset link has been sent" in response.json()["message"]

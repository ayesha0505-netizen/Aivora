import pytest
from fastapi.testclient import TestClient

from app.core.deps import get_current_user
from app.main import app
from app.models.user import User

# Mock authenticated user
mock_user = User(id="test_user_id", email="test@aivora.app")

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_get_sessions_empty(client):
    """Test getting sessions seeds demo data when empty."""
    response = client.get("/api/v1/assistant/sessions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    assert data[0]["title"] == "Weekly productivity recap"


def test_create_session(client):
    """Test creating a new conversation session."""
    response = client.post(
        "/api/v1/assistant/sessions",
        json={"title": "Test Chat"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Chat"
    assert "id" in data


def test_send_message(client):
    """Test sending a message and receiving AI response."""
    # Create session
    create_res = client.post("/api/v1/assistant/sessions", json={"title": "Test Msg"})
    session_id = create_res.json()["id"]

    # Send message
    msg_res = client.post(
        f"/api/v1/assistant/sessions/{session_id}/messages",
        json={"text": "How is my coffee budget looking?"}
    )
    assert msg_res.status_code == 200
    data = msg_res.json()
    
    # Check that AI responded
    assert len(data) >= 3  # welcome msg, user msg, AI msg
    ai_msg = data[-1]
    assert ai_msg["sender"] == "ai"
    assert "budget" in ai_msg["text"].lower() or "spent" in ai_msg["text"].lower()
    assert ai_msg["stats"] is not None
    assert "score" in ai_msg["stats"]

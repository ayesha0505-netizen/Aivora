from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.core.deps import get_current_user
from app.main import app
from app.models.user import User

# Mock authenticated user for dashboard integration testing
mock_user = User(id="test_dashboard_user_id", email="sarah@aivora.app", first_name="Sarah", last_name="Connor")


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_get_dashboard_summary(client):
    """Test retrieving full dashboard summary seeds defaults and returns valid ADK insights."""
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "user_name" in data
    assert "ai_insight" in data
    assert isinstance(data["schedule_events"], list)
    assert isinstance(data["shopping_items"], list)
    assert isinstance(data["recent_notes"], list)
    assert isinstance(data["active_reminders"], list)
    assert "budget_spent_this_week" in data


def test_note_lifecycle(client):
    """Test creating, listing, and deleting a dashboard note."""
    # Create note
    create_res = client.post(
        "/api/v1/dashboard/notes",
        json={"title": "Integration Test Note", "content": "Testing FastAPI CRUD workflow"}
    )
    assert create_res.status_code == 201
    note_data = create_res.json()
    assert note_data["title"] == "Integration Test Note"
    note_id = note_data["id"]

    # List notes
    list_res = client.get("/api/v1/dashboard/notes")
    assert list_res.status_code == 200
    notes = list_res.json()
    assert any(n["id"] == note_id for n in notes)

    # Delete note
    del_res = client.delete(f"/api/v1/dashboard/notes/{note_id}")
    assert del_res.status_code == 204

    # Verify deleted
    list_after = client.get("/api/v1/dashboard/notes")
    assert not any(n["id"] == note_id for n in list_after.json())


def test_shopping_item_lifecycle(client):
    """Test creating, toggling completion, and deleting a shopping list item."""
    # Create shopping item
    create_res = client.post(
        "/api/v1/dashboard/shopping",
        json={"name": "Almond Milk"}
    )
    assert create_res.status_code == 201
    item = create_res.json()
    assert item["name"] == "Almond Milk"
    assert item["is_completed"] is False
    item_id = item["id"]

    # Toggle shopping item
    toggle_res = client.patch(f"/api/v1/dashboard/shopping/{item_id}/toggle")
    assert toggle_res.status_code == 200
    toggled_item = toggle_res.json()
    assert toggled_item["is_completed"] is True

    # Delete item
    del_res = client.delete(f"/api/v1/dashboard/shopping/{item_id}")
    assert del_res.status_code == 204


def test_event_lifecycle(client):
    """Test scheduling and cancelling a calendar event."""
    now_iso = datetime.now(timezone.utc).isoformat()
    create_res = client.post(
        "/api/v1/dashboard/events",
        json={
            "title": "Team Standup",
            "description": "Daily sync",
            "event_time": now_iso,
            "event_type": "video",
            "location": "Zoom"
        }
    )
    assert create_res.status_code == 201
    evt = create_res.json()
    assert evt["title"] == "Team Standup"
    evt_id = evt["id"]

    # Delete event
    del_res = client.delete(f"/api/v1/dashboard/events/{evt_id}")
    assert del_res.status_code == 204


def test_create_expense(client):
    """Test logging an expense dynamically updates budget tracking."""
    res = client.post(
        "/api/v1/dashboard/expenses",
        json={"amount": 45.50, "description": "Grocery shopping"}
    )
    assert res.status_code == 201
    assert res.json()["status"] == "recorded"
    assert res.json()["amount"] == 45.50


def test_complete_reminder(client):
    """Test marking a reminder as completed via dashboard API."""
    # First get summary to find an active reminder
    summary = client.get("/api/v1/dashboard/summary").json()
    reminders = summary["active_reminders"]
    if reminders:
        rem_id = reminders[0]["id"]
        complete_res = client.patch(f"/api/v1/dashboard/reminders/{rem_id}/complete")
        assert complete_res.status_code == 200
        assert complete_res.json()["status"] == "completed"

"""REST API Endpoints for AI Assistant Feature."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.assistant import (
    ActionRequest,
    MessageCreate,
    MessageResponse,
    SessionCreate,
    SessionResponse,
)
from app.services.assistant_service import assistant_service

router = APIRouter(tags=["AI Assistant"])

# Dependency shortcut
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    db: DbSession,
    current_user: CurrentUser,
):
    """Retrieve all active conversation sessions for the authenticated user."""
    return await assistant_service.list_user_sessions(db, current_user.id)


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: SessionCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new conversation session."""
    return await assistant_service.create_session(db, current_user.id, request.title or "New Conversation")


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete a conversation session."""
    success = await assistant_service.delete_session(db, session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
    return None


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    session_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Retrieve chronological chat messages for a specific session."""
    # Ensure user owns session
    sessions = await assistant_service.list_user_sessions(db, current_user.id)
    if session_id not in [s.id for s in sessions]:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    return await assistant_service.get_session_messages(db, session_id, current_user.id)


@router.post("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def send_message(
    session_id: str,
    request: MessageCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Send a user message, process it via ADK Coordinator/MCP tools, and return updated chat history."""
    return await assistant_service.process_user_message(db, session_id, current_user.id, request.text)


@router.post("/sessions/{session_id}/actions", response_model=list[MessageResponse])
async def execute_action(
    session_id: str,
    request: ActionRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Execute an interactive widget action and return updated chat history."""
    return await assistant_service.execute_message_action(
        db, session_id, current_user.id, request.action_id, request.message_id
    )

"""Pydantic schemas for AI Assistant sessions, messages, stats, and actions."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class SessionCreate(BaseModel):
    """Schema for creating a new conversation session."""

    title: Optional[str] = Field(default="New Conversation", description="Title of the session")


class SessionResponse(BaseModel):
    """Schema for returning a session."""

    id: str
    user_id: str
    title: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageStatsSchema(BaseModel):
    """Schema for widget statistics in an AI message."""

    done: Optional[Any] = None
    missed: Optional[Any] = None
    score: Optional[str] = None


class MessageActionSchema(BaseModel):
    """Schema for widget interactive buttons in an AI message."""

    label: str
    actionId: str
    primary: Optional[bool] = False


class MessageCreate(BaseModel):
    """Schema for sending a new user message."""

    text: str = Field(..., description="The user prompt or query text")


class MessageResponse(BaseModel):
    """Schema for returning a message with optional interactive widgets."""

    id: str
    session_id: str
    sender: str
    text: str
    stats: Optional[dict[str, Any]] = None
    actions: Optional[list[dict[str, Any]]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActionRequest(BaseModel):
    """Schema for executing an interactive widget action."""

    action_id: str = Field(..., description="Action ID triggered by the widget button")
    message_id: str = Field(..., description="ID of the message containing the widget")
    context_text: Optional[str] = Field(default=None, description="Optional context text")

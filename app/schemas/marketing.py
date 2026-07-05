from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PasswordResetResponse(BaseModel):
    """Schema for password reset response."""
    message: str
    reset_token: Optional[str] = None


class TokenResponse(BaseModel):
    """Schema for JWT authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: Any


class SubscriberCreate(BaseModel):
    """Schema for newsletter subscription request."""
    email: EmailStr = Field(description="Email address to subscribe")


class SubscriberResponse(BaseModel):
    """Schema for newsletter subscription response."""
    id: str
    email: str
    subscribed_at: Optional[datetime] = None
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)


class InquiryCreate(BaseModel):
    """Schema for sales or support inquiry submission."""
    email: EmailStr = Field(description="Contact email address")
    name: Optional[str] = Field(default=None, description="Contact name")
    message: Optional[str] = Field(default=None, description="Inquiry details")


class InquiryResponse(BaseModel):
    """Schema for returned inquiry data."""
    id: str
    email: str
    name: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class StatsResponse(BaseModel):
    """Schema for platform live statistics displayed on landing page."""
    active_users: int = Field(default=50000, description="Total trusted adopters")
    apps_connected: int = Field(default=1500, description="Integrated external apps")
    agents_online: int = Field(default=6, description="Specialized ADK sub-agents active")
    tasks_automated: int = Field(default=250000, description="Total tasks processed")


class SessionCreate(BaseModel):
    """Schema for initializing a new ADK agent session."""
    user_id: Optional[str] = None
    initial_context: dict[str, Any] = Field(default_factory=dict)


class SessionResponse(BaseModel):
    """Schema for returned agent session details."""
    id: str
    user_id: str
    status: str = "active"
    state_data: dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class MessageRequest(BaseModel):
    """Schema for sending a message/goal to the agent session."""
    message: str = Field(description="Natural language user request or goal")


class MessageResponse(BaseModel):
    """Schema for agent execution response."""
    session_id: str
    status: str
    response: Optional[str] = None
    state_delta: dict[str, Any] = Field(default_factory=dict)


class TaskExecuteRequest(BaseModel):
    """Request schema for executing an ADK background task."""
    task_name: str
    parameters: dict[str, Any] = Field(default_factory=dict)


class TaskExecuteResponse(BaseModel):
    """Response schema for ADK task execution initiation."""
    task_id: str
    status: str


class TaskStatusResponse(BaseModel):
    """Response schema checking task execution status."""
    task_id: str
    status: str
    result: Optional[dict[str, Any]] = None

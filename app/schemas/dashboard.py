from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CalendarEventSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    event_time: datetime
    event_type: str = "generic"
    location: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CalendarEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Event title")
    description: Optional[str] = Field(default=None, description="Event details or Zoom link")
    event_time: datetime = Field(..., description="ISO timestamp for when the event occurs")
    event_type: str = Field(default="generic", description="Type: video, restaurant, fitness, generic")
    location: Optional[str] = Field(default=None, max_length=255, description="Physical or virtual location")


class NoteSchema(BaseModel):
    id: str
    title: str
    content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Note title")
    content: Optional[str] = Field(default=None, description="Note content or checklist")


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None


class ShoppingItemSchema(BaseModel):
    id: str
    name: str
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)


class ShoppingItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Item name to buy")


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    is_completed: Optional[bool] = None


class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Expense amount in dollars")
    description: Optional[str] = Field(default=None, max_length=255, description="What was purchased")


class ReminderSchema(BaseModel):
    id: str
    title: str
    trigger_time: datetime
    status: str = "pending"

    model_config = ConfigDict(from_attributes=True)


class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    trigger_time: datetime = Field(...)


class ReminderUpdate(BaseModel):
    status: Optional[str] = Field(default=None, description="pending, completed, dismissed")
    title: Optional[str] = None
    trigger_time: Optional[datetime] = None


class TravelPlanSchema(BaseModel):
    id: str
    destination: str
    start_date: str
    end_date: str
    budget_estimate: Optional[float] = None
    bookings_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class DashboardSummaryResponse(BaseModel):
    user_name: str
    current_date: str
    ai_insight: str
    ai_action_suggestion: Optional[str] = None
    schedule_events: list[CalendarEventSchema]
    budget_spent_this_week: float
    budget_weekly_limit: float
    upcoming_trip: Optional[TravelPlanSchema] = None
    recent_notes: list[NoteSchema]
    shopping_items: list[ShoppingItemSchema]
    active_reminders: list[ReminderSchema]

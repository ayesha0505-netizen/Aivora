"""REST API Endpoints for Aivora Dashboard Feature."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import (
    CalendarEventCreate,
    CalendarEventSchema,
    DashboardSummaryResponse,
    ExpenseCreate,
    NoteCreate,
    NoteSchema,
    ReminderSchema,
    ShoppingItemCreate,
    ShoppingItemSchema,
    ChecklistGenerateRequest,
    ChecklistGenerateResponse,
)
from app.services.dashboard_service import dashboard_service

router = APIRouter(tags=["Dashboard"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    db: DbSession,
    current_user: CurrentUser,
):
    """Retrieve unified dashboard summary and AI insights for authenticated user."""
    return await dashboard_service.get_dashboard_summary(db, current_user)


@router.get("/notes", response_model=list[NoteSchema])
async def list_notes(
    db: DbSession,
    current_user: CurrentUser,
):
    """List all notes created by the authenticated user."""
    notes = await dashboard_service.get_user_notes(db, current_user)
    return [NoteSchema.model_validate(n) for n in notes]


@router.post("/notes", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new note or activity log entry."""
    note = await dashboard_service.create_note(db, current_user, note_in)
    return NoteSchema.model_validate(note)


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete a specific note."""
    success = await dashboard_service.delete_note(db, current_user, note_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")


@router.post("/shopping", response_model=ShoppingItemSchema, status_code=status.HTTP_201_CREATED)
async def create_shopping_item(
    item_in: ShoppingItemCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Add a new item to the shopping/buy list."""
    item = await dashboard_service.create_shopping_item(db, current_user, item_in)
    return ShoppingItemSchema.model_validate(item)


@router.patch("/shopping/{item_id}/toggle", response_model=ShoppingItemSchema)
async def toggle_shopping_item(
    item_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Toggle the completion checkbox status of a shopping list item."""
    item = await dashboard_service.toggle_shopping_item(db, current_user, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shopping item not found")
    return ShoppingItemSchema.model_validate(item)


@router.delete("/shopping/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shopping_item(
    item_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Remove an item from the shopping list."""
    success = await dashboard_service.delete_shopping_item(db, current_user, item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shopping item not found")


@router.get("/events", response_model=list[CalendarEventSchema])
async def list_events(
    db: DbSession,
    current_user: CurrentUser,
):
    """List all scheduled events for the user."""
    events = await dashboard_service.get_user_events(db, current_user)
    return [CalendarEventSchema.model_validate(e) for e in events]


@router.post("/events", response_model=CalendarEventSchema, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: CalendarEventCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Schedule a new calendar event for today's schedule."""
    event = await dashboard_service.create_event(db, current_user, event_in)
    return CalendarEventSchema.model_validate(event)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Cancel and delete a scheduled event."""
    success = await dashboard_service.delete_event(db, current_user, event_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_in: ExpenseCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Log a new expense amount to update the budget summary dynamically."""
    await dashboard_service.create_expense(db, current_user, expense_in)
    return {"status": "recorded", "amount": expense_in.amount}


@router.patch("/reminders/{reminder_id}/complete", response_model=ReminderSchema)
async def complete_reminder(
    reminder_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Mark a reminder as completed."""
    rem = await dashboard_service.complete_reminder(db, current_user, reminder_id)
    if not rem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return ReminderSchema.model_validate(rem)


@router.post("/checklists/generate", response_model=ChecklistGenerateResponse)
async def generate_checklist(
    request: ChecklistGenerateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Generate a checklist using AI based on a natural language prompt."""
    res = await dashboard_service.generate_checklist(request.prompt)
    return ChecklistGenerateResponse(**res)


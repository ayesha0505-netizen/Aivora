from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.insight_agent import InsightInput, run_insight_agent
from app.models.dashboard import CalendarEvent, Expense, Note, ShoppingItem
from app.models.marketing import Reminder, TravelPlan
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
    TravelPlanSchema,
)


class DashboardService:
    """Service handling dashboard data aggregation and ADK insight generation."""

    async def get_dashboard_summary(self, db: AsyncSession, user: User) -> DashboardSummaryResponse:
        """Fetch all dashboard widgets data and synthesize AI morning insight."""
        # Check if user has data, if not seed initial dashboard defaults
        await self._ensure_seeded_data(db, user)
        now = datetime.now(timezone.utc)

        # 1. Fetch Today's Calendar Events
        stmt_events = (
            select(CalendarEvent)
            .where(CalendarEvent.user_id == user.id)
            .order_by(CalendarEvent.event_time.asc())
            .limit(10)
        )
        res_events = await db.execute(stmt_events)
        calendar_events = list(res_events.scalars().all())

        # 2. Fetch Recent Notes
        stmt_notes = (
            select(Note)
            .where(Note.user_id == user.id)
            .order_by(Note.created_at.desc())
            .limit(3)
        )
        res_notes = await db.execute(stmt_notes)
        notes = list(res_notes.scalars().all())

        # 3. Fetch Shopping Items
        stmt_shopping = (
            select(ShoppingItem)
            .where(ShoppingItem.user_id == user.id)
            .order_by(ShoppingItem.created_at.asc())
            .limit(10)
        )
        res_shopping = await db.execute(stmt_shopping)
        shopping_items = list(res_shopping.scalars().all())

        # 4. Fetch Reminders
        stmt_reminders = (
            select(Reminder)
            .where(Reminder.user_id == user.id, Reminder.status == "pending")
            .order_by(Reminder.trigger_time.asc())
            .limit(5)
        )
        res_reminders = await db.execute(stmt_reminders)
        reminders = list(res_reminders.scalars().all())

        # 5. Fetch Weekly Expenses & Budget
        stmt_expenses = select(func.sum(Expense.amount)).where(Expense.user_id == user.id)
        res_expenses = await db.execute(stmt_expenses)
        spent_this_week = res_expenses.scalar() or 0.0
        weekly_limit = 1600.0  # Default or from user preferences

        # 6. Fetch Upcoming Travel Plan
        # Note: TravelPlan uses session_id currently, let's query via sessions or just get latest
        stmt_trips = select(TravelPlan).order_by(TravelPlan.created_at.desc()).limit(1)
        res_trips = await db.execute(stmt_trips)
        latest_trip = res_trips.scalar_one_or_none()

        upcoming_trip_schema = None
        trip_destination = None
        trip_days_until = None
        if latest_trip:
            bookings_cnt = len(latest_trip.itinerary) if isinstance(latest_trip.itinerary, list) else 4
            upcoming_trip_schema = TravelPlanSchema(
                id=latest_trip.id,
                destination=latest_trip.destination,
                start_date=latest_trip.start_date,
                end_date=latest_trip.end_date,
                budget_estimate=latest_trip.budget_estimate,
                bookings_count=bookings_cnt if bookings_cnt > 0 else 4,
            )
            trip_destination = latest_trip.destination
            try:
                start_dt = datetime.strptime(latest_trip.start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                trip_days_until = max(0, (start_dt - now).days)
            except Exception:
                trip_days_until = 2

        # 7. Execute ADK Insight Agent
        user_display_name = user.first_name or user.full_name or user.email.split("@")[0]
        insight_input = InsightInput(
            user_name=user_display_name,
            upcoming_events_count=len(calendar_events),
            pending_reminders_count=len(reminders),
            upcoming_trip_destination=trip_destination,
            upcoming_trip_days=trip_days_until,
            weekly_spent=spent_this_week,
            weekly_limit=weekly_limit,
        )
        insight_res = await run_insight_agent(insight_input)

        # Format current date string
        formatted_date = now.strftime("%A, %B %d, %Y")

        return DashboardSummaryResponse(
            user_name=user_display_name,
            current_date=formatted_date,
            ai_insight=insight_res.insight_message,
            ai_action_suggestion=insight_res.action_suggestion,
            schedule_events=[CalendarEventSchema.model_validate(e) for e in calendar_events],
            budget_spent_this_week=spent_this_week,
            budget_weekly_limit=weekly_limit,
            upcoming_trip=upcoming_trip_schema,
            recent_notes=[NoteSchema.model_validate(n) for n in notes],
            shopping_items=[ShoppingItemSchema.model_validate(s) for s in shopping_items],
            active_reminders=[ReminderSchema.model_validate(r) for r in reminders],
        )

    async def create_note(self, db: AsyncSession, user: User, note_in: NoteCreate) -> Note:
        note = Note(
            user_id=user.id,
            title=note_in.title,
            content=note_in.content,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        return note

    async def get_user_notes(self, db: AsyncSession, user: User) -> list[Note]:
        stmt = select(Note).where(Note.user_id == user.id).order_by(Note.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def delete_note(self, db: AsyncSession, user: User, note_id: str) -> bool:
        stmt = select(Note).where(Note.id == note_id, Note.user_id == user.id)
        res = await db.execute(stmt)
        note = res.scalar_one_or_none()
        if not note:
            return False
        await db.delete(note)
        await db.commit()
        return True

    async def create_shopping_item(self, db: AsyncSession, user: User, item_in: ShoppingItemCreate) -> ShoppingItem:
        item = ShoppingItem(
            user_id=user.id,
            name=item_in.name,
            is_completed=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item

    async def toggle_shopping_item(self, db: AsyncSession, user: User, item_id: str) -> Optional[ShoppingItem]:
        stmt = select(ShoppingItem).where(ShoppingItem.id == item_id, ShoppingItem.user_id == user.id)
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            return None
        item.is_completed = not item.is_completed
        await db.commit()
        await db.refresh(item)
        return item

    async def delete_shopping_item(self, db: AsyncSession, user: User, item_id: str) -> bool:
        stmt = select(ShoppingItem).where(ShoppingItem.id == item_id, ShoppingItem.user_id == user.id)
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            return False
        await db.delete(item)
        await db.commit()
        return True

    async def get_user_events(self, db: AsyncSession, user: User) -> list[CalendarEvent]:
        await self._ensure_seeded_data(db, user)
        stmt = select(CalendarEvent).where(CalendarEvent.user_id == user.id).order_by(CalendarEvent.event_time.asc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create_event(self, db: AsyncSession, user: User, event_in: CalendarEventCreate) -> CalendarEvent:
        event = CalendarEvent(
            user_id=user.id,
            title=event_in.title,
            description=event_in.description,
            event_time=event_in.event_time,
            event_type=event_in.event_type,
            location=event_in.location,
            created_at=datetime.now(timezone.utc),
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event

    async def delete_event(self, db: AsyncSession, user: User, event_id: str) -> bool:
        stmt = select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == user.id)
        res = await db.execute(stmt)
        event = res.scalar_one_or_none()
        if not event:
            return False
        await db.delete(event)
        await db.commit()
        return True

    async def create_expense(self, db: AsyncSession, user: User, expense_in: ExpenseCreate) -> Expense:
        expense = Expense(
            user_id=user.id,
            amount=expense_in.amount,
            description=expense_in.description,
            created_at=datetime.now(timezone.utc),
        )
        db.add(expense)
        await db.commit()
        await db.refresh(expense)
        return expense

    async def complete_reminder(self, db: AsyncSession, user: User, reminder_id: str) -> Optional[Reminder]:
        stmt = select(Reminder).where(Reminder.id == reminder_id, Reminder.user_id == user.id)
        res = await db.execute(stmt)
        rem = res.scalar_one_or_none()
        if not rem:
            return None
        rem.status = "completed"
        await db.commit()
        await db.refresh(rem)
        return rem

    async def _ensure_seeded_data(self, db: AsyncSession, user: User) -> None:
        """Seed sample dashboard data for users without any existing widgets."""
        return  # Disabled to prevent demo false data for real users
        stmt = select(func.count(CalendarEvent.id)).where(CalendarEvent.user_id == user.id)
        res = await db.execute(stmt)
        count = res.scalar() or 0
        if count > 0:
            return  # Already has data

        now = datetime.now(timezone.utc)
        
        # Seed Calendar Events
        events = [
            CalendarEvent(
                user_id=user.id,
                title="Design Sync: Project Aivora",
                description="Zoom Conference • Link Attached",
                event_time=now.replace(hour=9, minute=0, second=0, microsecond=0),
                event_type="video",
                location="Zoom",
            ),
            CalendarEvent(
                user_id=user.id,
                title="Lunch with Michael",
                description="The Daily Roast, Soho",
                event_time=now.replace(hour=13, minute=30, second=0, microsecond=0),
                event_type="restaurant",
                location="Soho",
            ),
            CalendarEvent(
                user_id=user.id,
                title="Gym: Lower Body Power",
                description="Equinox High Street",
                event_time=now.replace(hour=16, minute=0, second=0, microsecond=0),
                event_type="fitness",
                location="Equinox",
            ),
        ]
        db.add_all(events)

        # Seed Notes
        notes = [
            Note(
                user_id=user.id,
                title="Project Brainstorming",
                content="Must remember to add the bento grid layout for the dashboard...",
                created_at=now - timedelta(hours=2),
            ),
            Note(
                user_id=user.id,
                title="Gift Ideas for Leo",
                content="Mechanical keyboard, vintage film camera, or premium coffee beans...",
                created_at=now - timedelta(days=1),
            ),
            Note(
                user_id=user.id,
                title="Healthy Meal Prep",
                content="Quinoa salad, roasted chickpeas, and tahini dressing...",
                created_at=now - timedelta(days=3),
            ),
        ]
        db.add_all(notes)

        # Seed Shopping Items
        shopping = [
            ShoppingItem(user_id=user.id, name="Whole Wheat Sourdough", is_completed=False),
            ShoppingItem(user_id=user.id, name="Almond Milk (Unsweetened)", is_completed=True),
            ShoppingItem(user_id=user.id, name="Organic Avocados (x3)", is_completed=False),
        ]
        db.add_all(shopping)

        # Seed Reminders
        reminders = [
            Reminder(
                user_id=user.id,
                title="Renew Insurance",
                trigger_time=now + timedelta(hours=24),
                status="pending",
            ),
            Reminder(
                user_id=user.id,
                title="Call Mom",
                trigger_time=now + timedelta(days=2),
                status="pending",
            ),
        ]
        db.add_all(reminders)

        # Seed Expenses
        expenses = [
            Expense(user_id=user.id, amount=450.00, description="Flight reservation"),
            Expense(user_id=user.id, amount=320.50, description="Hotel deposit"),
            Expense(user_id=user.id, amount=470.00, description="Weekly dining and groceries"),
        ]
        db.add_all(expenses)

        # Seed TravelPlan if none exists
        stmt_tp = select(func.count(TravelPlan.id))
        res_tp = await db.execute(stmt_tp)
        tp_cnt = res_tp.scalar() or 0
        if tp_cnt == 0:
            # Create a mock session for travel plan
            from app.models.session import Session
            mock_sess = Session(user_id=user.id, title="London Trip Planning", status="completed")
            db.add(mock_sess)
            await db.flush()
            
            tp = TravelPlan(
                session_id=mock_sess.id,
                destination="London, UK",
                start_date=(now + timedelta(days=2)).strftime("%Y-%m-%d"),
                end_date=(now + timedelta(days=9)).strftime("%Y-%m-%d"),
                budget_estimate=1850.00,
                itinerary=[{"day": 1, "activity": "Arrival at Heathrow"}, {"day": 2, "activity": "West End Theater"}],
            )
            db.add(tp)

        await db.commit()

    async def generate_checklist(self, prompt: str) -> dict:
        from app.config import settings
        import google.generativeai as genai
        import json
        
        if not settings.gemini_api_key or settings.gemini_api_key == "mock-gemini-api-key-for-local-dev":
            return {"title": prompt, "category": "General Task", "items": [{"id": "ai-1", "text": "Set up Gemini key to get AI lists", "completed": False}]}
        
        try:
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            system_prompt = (
                "You are an AI assistant that generates structured checklists. "
                "Given a user prompt, generate a relevant checklist with a title, "
                "a category (choose from: General Task, Travel Prep, Work & Tech, Chore List), "
                "and a list of actionable items (strings). "
                "Output ONLY valid JSON with keys: 'title', 'category', 'items'."
            )
            response = await model.generate_content_async(
                f"{system_prompt}\n\nUser prompt: {prompt}",
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            content = response.text
            data = json.loads(content)
            return {
                "title": data.get("title", prompt),
                "category": data.get("category", "General Task"),
                "items": [{"id": f"ai-{i}-{int(datetime.now(timezone.utc).timestamp())}", "text": text, "completed": False} for i, text in enumerate(data.get("items", []))]
            }
        except Exception as e:
            print(f"Gemini error: {e}")
            return {"title": prompt, "category": "General Task", "items": [{"id": "ai-error", "text": "Failed to generate AI list.", "completed": False}]}


dashboard_service = DashboardService()

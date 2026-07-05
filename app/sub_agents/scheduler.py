"""Scheduler Sub-Agent with Human-in-the-Loop (HITL) gatekeeper support."""

from typing import Any

from pydantic import BaseModel, Field


class SchedulerInput(BaseModel):
    """Input schema for Scheduler sub-agent."""

    event_title: str
    start_time: str = Field(description="ISO 8601 timestamp")
    end_time: str = Field(description="ISO 8601 timestamp")
    description: str | None = None
    user_email: str


class HITLConfirmationCard(BaseModel):
    """Interactive card sent to frontend requesting user approval before external mutation."""

    card_id: str
    action_type: str = "calendar_reservation"
    title: str
    details: dict[str, Any]
    requires_approval: bool = True
    status: str = "pending_user_approval"


class SchedulerOutput(BaseModel):
    """Output schema for Scheduler sub-agent."""

    status: str = Field(description="Status: 'scheduled', 'pending_approval', or 'rejected'")
    confirmation_card: HITLConfirmationCard | None = None
    external_event_id: str | None = None


SCHEDULER_INSTRUCTIONS = """
You are the Aivora Scheduler Agent operating in ADK task mode.
Whenever an external state mutation such as a Google Calendar reservation is required, you MUST NOT execute the external API write directly.
Instead, generate an HITLConfirmationCard and trigger an interrupt to request explicit user authorization.
Only proceed when the session resumes with user approval.
When complete, execute finish_task to return the structured SchedulerOutput.
"""


def run_scheduler_agent(input_data: SchedulerInput, auto_approve: bool = False) -> SchedulerOutput:
    """Execute calendar scheduling check with HITL card generation."""
    if not auto_approve:
        card = HITLConfirmationCard(
            card_id=f"hitl-{input_data.start_time}",
            title=f"Confirm Calendar Reservation: {input_data.event_title}",
            details={
                "start": input_data.start_time,
                "end": input_data.end_time,
                "description": input_data.description,
                "calendar": input_data.user_email,
            },
        )
        return SchedulerOutput(status="pending_approval", confirmation_card=card)

    return SchedulerOutput(
        status="scheduled",
        external_event_id="gcal-mock-event-id-998877",
    )

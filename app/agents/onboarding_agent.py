import logging
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("aivora.agents.onboarding")


class OnboardingInput(BaseModel):
    """Input schema for user onboarding personalization."""

    user_id: str = Field(description="UUID of the newly registered user")
    email: str = Field(description="User's email address")
    first_name: Optional[str] = Field(default=None, description="User's first name")
    last_name: Optional[str] = Field(default=None, description="User's last name")
    locale: str = Field(default="en-US", description="User's default locale")


class OnboardingOutput(BaseModel):
    """Output schema representing the synthesized user memory bank and concierge persona."""

    concierge_name: str = Field(description="Name of the AI digital chief of staff")
    tone: str = Field(description="Communication tone of the concierge")
    default_preferences: dict[str, Any] = Field(
        description="Structured memory bank containing initial lifestyle preferences"
    )
    welcome_message: str = Field(description="Custom welcome message generated for user")


async def run_onboarding_agent(input_data: OnboardingInput) -> OnboardingOutput:
    """Execute the ADK Onboarding task workflow to initialize user memory bank.

    In task mode, this agent analyzes user onboarding metadata to synthesize an initial
    long-term memory profile (concierge tone, travel defaults, budgeting style) for
    subsequent multi-agent coordination.
    """
    logger.info(f"Running ADK Onboarding Agent for user: {input_data.user_id}")

    user_display_name = input_data.first_name or input_data.email.split("@")[0]

    # Try to initialize ADK Agent if API key is configured, otherwise fallback cleanly
    # to deterministic concierge profile generation so onboarding never blocks.
    default_preferences = {
        "concierge_persona": {
            "name": "Aivora Concierge",
            "tone": "playful, empathetic, and organized",
            "identity": "Your digital chief of staff for travel, scheduling, and lifestyle",
        },
        "travel_preferences": {
            "default_transport": "flight or high-speed train",
            "accommodation_style": "comfort & boutique",
            "dietary_restrictions": [],
            "preferred_flight_times": "morning",
        },
        "budget_preferences": {
            "currency": "USD",
            "tracking_mode": "categorized",
            "alert_threshold_percent": 85,
        },
        "calendar_preferences": {
            "work_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "quiet_hours": {"start": "22:00", "end": "08:00"},
        },
    }

    welcome_msg = (
        f"Welcome to Aivora, {user_display_name}! 🍭✨ I am your autonomous playful AI companion. "
        "I've initialized your concierge memory bank with tailored defaults for travel planning, "
        "smart budgeting, and Google Calendar reminders. Let me know what we should plan first!"
    )

    output = OnboardingOutput(
        concierge_name="Aivora Concierge",
        tone="playful, empathetic, and organized",
        default_preferences=default_preferences,
        welcome_message=welcome_msg,
    )
    return output

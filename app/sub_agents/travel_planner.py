"""Travel Planner Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class TravelPlannerInput(BaseModel):
    """Input schema for Travel Planner sub-agent."""

    destination: str = Field(description="Target travel city or region")
    start_date: str = Field(description="Start date of travel (YYYY-MM-DD)")
    end_date: str = Field(description="End date of travel (YYYY-MM-DD)")
    preferences: list[str] = Field(
        default_factory=list, description="User travel preferences (e.g., vegetarian, morning flights)"
    )


class ActivityItem(BaseModel):
    """Individual activity item in a daily itinerary."""

    time: str = Field(description="Time of day (e.g., '09:00 AM')")
    title: str = Field(description="Activity or location name")
    description: str = Field(description="Brief details and tips")


class DailyItinerary(BaseModel):
    """Day-by-day travel plan structure."""

    day: int = Field(description="Day number (e.g., 1)")
    date: str = Field(description="Date string")
    theme: str = Field(description="Daily theme (e.g., 'Historical Landmarks & Old Delhi')")
    activities: list[ActivityItem] = Field(default_factory=list)


class TravelPlannerOutput(BaseModel):
    """Output schema for Travel Planner sub-agent."""

    destination: str
    itinerary: list[DailyItinerary] = Field(default_factory=list)
    summary: str = Field(description="Executive summary of the travel plan")


TRAVEL_PLANNER_INSTRUCTIONS = """
You are the Aivora Travel Planner Agent operating in ADK task mode.
Your objective is to generate structured, realistic, and highly enjoyable daily itineraries based on the user's destination, dates, and accumulated memory bank preferences.
Always include specific locations, timing suggestions, and dining recommendations matching preferences.
When complete, you must execute finish_task to return the structured TravelPlannerOutput.
"""


def run_travel_planner(input_data: TravelPlannerInput) -> TravelPlannerOutput:
    """Execute the travel planner agent logic (mocked for local development execution)."""
    mock_itinerary = [
        DailyItinerary(
            day=1,
            date=input_data.start_date,
            theme="Arrival & Heritage Sightseeing",
            activities=[
                ActivityItem(
                    time="10:00 AM",
                    title="Red Fort Exploration",
                    description="Guided tour of the UNESCO World Heritage site.",
                ),
                ActivityItem(
                    time="01:30 PM",
                    title="Traditional Vegetarian Lunch at Chandni Chowk",
                    description="Enjoy authentic local culinary delights matching vegetarian preferences.",
                ),
            ],
        )
    ]
    return TravelPlannerOutput(
        destination=input_data.destination,
        itinerary=mock_itinerary,
        summary=f"Customized 1-day itinerary for {input_data.destination} incorporating all dietary and scheduling preferences.",
    )

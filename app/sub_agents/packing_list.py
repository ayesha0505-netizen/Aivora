"""Packing List Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class PackingInput(BaseModel):
    """Input schema for Packing List sub-agent."""

    destination: str
    duration_days: int
    weather_condition: str = Field(description="General weather forecast summary")
    planned_activities: list[str] = Field(default_factory=list)


class PackingItemSchema(BaseModel):
    """Individual checklist item schema."""

    item_name: str
    category: str = Field(description="Category (e.g., 'Clothing', 'Electronics', 'Documents')")
    is_essential: bool = True
    reason: str | None = None


class PackingOutput(BaseModel):
    """Output schema for Packing List sub-agent."""

    destination: str
    items: list[PackingItemSchema] = Field(default_factory=list)
    luggage_recommendation: str = Field(description="Recommended bag type and weight limit")


PACKING_INSTRUCTIONS = """
You are the Aivora Packing List Agent operating in ADK task mode.
Synthesize a categorized checklist tailored to the target destination's weather conditions, trip duration, and scheduled activities.
Ensure all essential travel documents and chargers are included.
When complete, execute finish_task to return the structured PackingOutput.
"""


def run_packing_list_agent(input_data: PackingInput) -> PackingOutput:
    """Execute packing list generation (mocked for local dev)."""
    return PackingOutput(
        destination=input_data.destination,
        items=[
            PackingItemSchema(item_name="Passport & ID", category="Documents", is_essential=True),
            PackingItemSchema(
                item_name="Light Cotton Shirts", category="Clothing", is_essential=True, reason="Pleasant warm weather"
            ),
            PackingItemSchema(
                item_name="Comfortable Walking Shoes",
                category="Footwear",
                is_essential=True,
                reason="Red Fort exploration",
            ),
            PackingItemSchema(item_name="Universal Power Adapter", category="Electronics", is_essential=True),
        ],
        luggage_recommendation="Carry-on backpack or small trolley bag (under 10kg).",
    )

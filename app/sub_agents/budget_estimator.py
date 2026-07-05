"""Budget Estimator Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class BudgetInput(BaseModel):
    """Input schema for Budget Estimator sub-agent."""

    destination: str
    duration_days: int = Field(gt=0, description="Duration of trip in days")
    traveler_count: int = Field(default=1, gt=0, description="Number of travelers")
    currency: str = Field(default="USD", description="Target currency code")


class CostCategory(BaseModel):
    """Cost breakdown by category."""

    category: str = Field(description="Category name (e.g., 'Accommodation', 'Food & Dining')")
    estimated_amount: float = Field(ge=0, description="Estimated cost in currency")
    percentage_of_total: float = Field(ge=0, le=100, description="Percentage share of total budget")


class BudgetOutput(BaseModel):
    """Output schema for Budget Estimator sub-agent."""

    total_estimated_cost: float = Field(ge=0)
    currency: str
    breakdown: list[CostCategory] = Field(default_factory=list)
    money_saving_tips: list[str] = Field(default_factory=list)


BUDGET_INSTRUCTIONS = """
You are the Aivora Budget Estimator Agent operating in ADK task mode.
Calculate realistic travel expenses across accommodation, transport, dining, and sightseeing activities based on traveler count and duration.
Generate percentage breakdowns suitable for SVG chart rendering in the A2UI frontend.
When complete, execute finish_task to return the structured BudgetOutput.
"""


def run_budget_estimator(input_data: BudgetInput) -> BudgetOutput:
    """Execute budget calculation (mocked for local dev)."""
    return BudgetOutput(
        total_estimated_cost=450.00,
        currency=input_data.currency,
        breakdown=[
            CostCategory(category="Accommodation", estimated_amount=200.00, percentage_of_total=44.4),
            CostCategory(category="Food & Dining", estimated_amount=120.00, percentage_of_total=26.7),
            CostCategory(category="Activities & Sightseeing", estimated_amount=80.00, percentage_of_total=17.8),
            CostCategory(category="Local Transport", estimated_amount=50.00, percentage_of_total=11.1),
        ],
        money_saving_tips=[
            "Book metro day passes for unlimited local rides.",
            "Pre-book monument tickets online for discounts.",
        ],
    )

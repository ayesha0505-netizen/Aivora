"""Critic/Reviewer Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class CriticInput(BaseModel):
    """Input schema for Critic sub-agent."""

    travel_cost: float = Field(description="Total estimated cost of the trip")
    shopping_cost: float = Field(description="Total estimated cost of shopping")
    budget_limit: float = Field(description="User's total budget limit")
    currency: str = Field(default="USD")


class CriticOutput(BaseModel):
    """Output schema for Critic sub-agent."""

    approved: bool = Field(description="True if total cost is within budget, else False")
    total_calculated_cost: float = Field(description="Sum of all costs")
    feedback: str = Field(description="Explanation or warning to the user")


def run_critic_agent(input_data: CriticInput) -> CriticOutput:
    """Execute plan evaluation (mocked for local dev)."""
    
    total_cost = input_data.travel_cost + input_data.shopping_cost
    approved = total_cost <= input_data.budget_limit
    
    if approved:
        feedback = f"Your total plan comes to {input_data.currency} {total_cost:.2f}, which is well within your budget of {input_data.currency} {input_data.budget_limit:.2f}."
    else:
        feedback = f"Warning: Your total plan ({input_data.currency} {total_cost:.2f}) exceeds your budget of {input_data.currency} {input_data.budget_limit:.2f} by {input_data.currency} {(total_cost - input_data.budget_limit):.2f}. Consider adjusting your itinerary or shopping list."

    return CriticOutput(
        approved=approved,
        total_calculated_cost=total_cost,
        feedback=feedback,
    )

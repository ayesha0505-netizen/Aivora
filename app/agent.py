"""Root Coordinator Workflow orchestrating specialized task-mode sub-agents."""

from typing import Any

from pydantic import BaseModel, Field

from app.sub_agents.budget_estimator import BudgetInput, run_budget_estimator
from app.sub_agents.critic import CriticInput, run_critic_agent
from app.sub_agents.packing_list import PackingInput, run_packing_list_agent
from app.sub_agents.scheduler import SchedulerInput, run_scheduler_agent
from app.sub_agents.shopping_agent import ShoppingInput, run_shopping_agent
from app.sub_agents.storage import StorageInput, run_storage_agent
from app.sub_agents.travel_planner import TravelPlannerInput, run_travel_planner
from app.sub_agents.weather import WeatherInput, run_weather_agent


class CoordinatorInput(BaseModel):
    """Input request for the master coordinator."""

    session_id: str
    user_id: str | None = None
    natural_language_request: str = Field(
        description="High-level goal or query from user"
    )
    user_preferences: list[str] = Field(default_factory=list)


class CoordinatorOutput(BaseModel):
    """Synthesized response from the multi-agent coordinator workflow."""

    session_id: str
    status: str = "completed"
    summary_response: str
    structured_a2ui_payload: dict[str, Any] = Field(default_factory=dict)
    hitl_pending: bool = False


class AivoraCoordinatorWorkflow:
    """ADK 2.0 style Coordinator Workflow engine managing sub-agent execution."""

    def __init__(self, name: str = "AivoraMasterCoordinator") -> None:
        self.name = name
        self.sub_agents = [
            "TravelPlannerAgent",
            "WeatherAgent",
            "BudgetEstimatorAgent",
            "ShoppingAgent",
            "PackingListAgent",
            "CriticAgent",
            "SchedulerAgent",
            "StorageAgent",
        ]

    def execute_workflow(self, request: CoordinatorInput) -> CoordinatorOutput:
        """Execute the multi-step coordination pipeline (mocked/local synchronous execution)."""
        # Step 1: Query parser & parallel sub-agent triggers
        destination = "Delhi"
        start_date = "2026-07-11"
        end_date = "2026-07-12"

        travel_res = run_travel_planner(
            TravelPlannerInput(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
                preferences=request.user_preferences,
            )
        )
        weather_res = run_weather_agent(
            WeatherInput(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
            )
        )
        budget_res = run_budget_estimator(
            BudgetInput(destination=destination, duration_days=2, traveler_count=1)
        )

        # Step 2: Join node -> Packing list synthesis
        packing_res = run_packing_list_agent(
            PackingInput(
                destination=destination,
                duration_days=2,
                weather_condition=weather_res.forecast[0].condition
                if weather_res.forecast
                else "Sunny",
            )
        )

        # Step 2.5: Shopping Agent trigger
        shopping_res = run_shopping_agent(
            ShoppingInput(
                destination=destination,
                items_needed=["universal travel adapter", "sunscreen"],
            )
        )

        # Step 2.6: Critic Agent review
        critic_res = run_critic_agent(
            CriticInput(
                travel_cost=budget_res.total_estimated_cost,
                shopping_cost=shopping_res.total_estimated_shopping_cost,
                budget_limit=1000.0,
            )
        )

        # Step 3: Scheduler check (HITL check)
        scheduler_res = run_scheduler_agent(
            SchedulerInput(
                event_title=f"Trip to {destination}",
                start_time=f"{start_date}T09:00:00Z",
                end_time=f"{end_date}T18:00:00Z",
                user_email="user@aivora.app",
            ),
            auto_approve=False,
        )

        # Step 4: Storage agent packaging
        storage_res = run_storage_agent(
            StorageInput(
                session_id=request.session_id,
                artifact_type="pdf",
                data_payload={"itinerary": travel_res.model_dump()},
                filename="delhi_itinerary_2026.pdf",
            )
        )

        a2ui_payload = {
            "travel": travel_res.model_dump(),
            "weather": weather_res.model_dump(),
            "budget": budget_res.model_dump(),
            "shopping": shopping_res.model_dump(),
            "packing": packing_res.model_dump(),
            "critic": critic_res.model_dump(),
            "scheduler": scheduler_res.model_dump(),
            "storage": storage_res.model_dump(),
        }

        hitl = scheduler_res.status == "pending_approval"

        return CoordinatorOutput(
            session_id=request.session_id,
            status="pending_hitl" if hitl else "completed",
            summary_response=f"I have organized your complete {destination} itinerary, calculated a ${budget_res.total_estimated_cost:.2f} budget, checked the weather ({weather_res.forecast[0].condition if weather_res.forecast else 'Pleasant'}), and prepared your packing checklist. I also added a few shopping items. {critic_res.feedback} A calendar reservation confirmation card is ready for your approval.",
            structured_a2ui_payload=a2ui_payload,
            hitl_pending=hitl,
        )


coordinator_engine = AivoraCoordinatorWorkflow()

"""Weather Sub-Agent running in ADK task mode."""

from pydantic import BaseModel, Field


class WeatherInput(BaseModel):
    """Input schema for Weather sub-agent."""

    destination: str = Field(description="Target location for weather forecast")
    start_date: str = Field(description="Start date (YYYY-MM-DD)")
    end_date: str = Field(description="End date (YYYY-MM-DD)")


class DailyWeather(BaseModel):
    """Daily forecast data."""

    date: str
    condition: str = Field(description="Weather condition (e.g., 'Sunny', 'Light Rain')")
    temp_high_c: int = Field(description="Maximum temperature in Celsius")
    temp_low_c: int = Field(description="Minimum temperature in Celsius")
    icon: str = Field(description="Icon code or name for UI rendering")


class WeatherOutput(BaseModel):
    """Output schema for Weather sub-agent."""

    destination: str
    forecast: list[DailyWeather] = Field(default_factory=list)
    apparel_advice: str = Field(description="Recommended clothing and accessories based on forecast")
    schedule_warnings: list[str] = Field(
        default_factory=list, description="Any weather warnings impacting outdoor activities"
    )


WEATHER_INSTRUCTIONS = """
You are the Aivora Weather Agent operating in ADK task mode.
Analyze historical climate patterns and meteorological APIs for the specified destination and dates.
Provide daily temperature ranges, condition icons, apparel advice, and any schedule warnings for outdoor activities.
When complete, execute finish_task to return the structured WeatherOutput.
"""


def run_weather_agent(input_data: WeatherInput) -> WeatherOutput:
    """Execute weather agent analysis (mocked for local dev)."""
    return WeatherOutput(
        destination=input_data.destination,
        forecast=[
            DailyWeather(
                date=input_data.start_date,
                condition="Sunny & Pleasant",
                temp_high_c=28,
                temp_low_c=18,
                icon="wb_sunny",
            )
        ],
        apparel_advice="Light cotton clothing with sunglasses and comfortable walking shoes.",
        schedule_warnings=[],
    )

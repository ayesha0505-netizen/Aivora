"""REST API Endpoints for Aivora Weather Feature."""
from fastapi import APIRouter, Query

from app.schemas.weather import WeatherResponseSchema
from app.services.weather_service import weather_service

router = APIRouter(tags=["Weather Forecast"])


@router.get("", response_model=WeatherResponseSchema)
@router.get("/forecast", response_model=WeatherResponseSchema)
async def get_weather_forecast(
    city: str = Query("San Francisco, CA", description="City name or location to fetch weather for"),
):
    """Retrieve real-time weather conditions, hourly breakdown, and 7-day forecast from Open-Meteo."""
    return await weather_service.get_weather(city)

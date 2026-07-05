"""Pydantic schemas for Aivora Weather Feature."""
from typing import List

from pydantic import BaseModel


class HourlyForecastSchema(BaseModel):
    time: str
    temp: int
    icon: str
    condition: str


class ForecastDaySchema(BaseModel):
    day: str
    date: str
    tempHigh: int
    tempLow: int
    condition: str
    icon: str
    precipitation: str
    badgeClass: str
    shadowClass: str


class TravelRecommendationSchema(BaseModel):
    title: str
    subtitle: str
    icon: str
    colorClass: str


class WeatherResponseSchema(BaseModel):
    city: str
    currentTemp: int
    condition: str
    tempHigh: int
    tempLow: int
    uvIndex: str
    humidity: int
    windSpeed: int
    pressure: int
    visibility: float
    cloudCover: int
    sunsetTime: str
    aqi: str
    aqiDescription: str
    aiInsight: str
    wearRecommendation: str
    activityRecommendation: str
    hourly: List[HourlyForecastSchema]
    forecast: List[ForecastDaySchema]
    travelRecommendations: List[TravelRecommendationSchema]

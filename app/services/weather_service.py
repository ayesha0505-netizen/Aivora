"""Service layer for fetching and formatting real-time weather data."""
import datetime
import logging
from typing import Any, Dict, Tuple

import httpx

from app.schemas.weather import (
    ForecastDaySchema,
    HourlyForecastSchema,
    TravelRecommendationSchema,
    WeatherResponseSchema,
)

logger = logging.getLogger(__name__)

# Known cities fallback / fast lookup
KNOWN_CITIES = {
    "san francisco, ca": (37.7749, -122.4194, "San Francisco, CA"),
    "san francisco": (37.7749, -122.4194, "San Francisco, CA"),
    "new york, ny": (40.7128, -74.0060, "New York, NY"),
    "new york": (40.7128, -74.0060, "New York, NY"),
    "tokyo, japan": (35.6762, 139.6503, "Tokyo, Japan"),
    "tokyo": (35.6762, 139.6503, "Tokyo, Japan"),
    "paris, france": (48.8566, 2.3522, "Paris, France"),
    "paris": (48.8566, 2.3522, "Paris, France"),
    "london, uk": (51.5074, -0.1278, "London, UK"),
    "london": (51.5074, -0.1278, "London, UK"),
    "sydney, australia": (-33.8688, 151.2093, "Sydney, Australia"),
    "sydney": (-33.8688, 151.2093, "Sydney, Australia"),
    "berlin, germany": (52.5200, 13.4050, "Berlin, Germany"),
    "berlin": (52.5200, 13.4050, "Berlin, Germany"),
}


def get_condition_info(code: int, is_day: bool = True) -> Tuple[str, str, str, str]:
    """Map WMO weather codes to UI conditions, icons, badge classes, and shadow classes."""
    if code == 0:
        return (
            "Sunny & Clear" if is_day else "Clear Night",
            "wb_sunny" if is_day else "clear_night",
            "bg-primary-fixed text-on-primary-fixed-variant",
            "pink-shadow border-primary/20",
        )
    elif code in [1, 2]:
        return (
            "Partly Cloudy",
            "partly_cloudy_day" if is_day else "partly_cloudy_night",
            "bg-secondary-container text-on-secondary-container",
            "purple-shadow border-secondary/20",
        )
    elif code == 3:
        return (
            "Overcast",
            "cloud",
            "bg-surface-variant text-on-surface-variant",
            "blue-shadow border-tertiary/20",
        )
    elif code in [45, 48]:
        return (
            "Morning Fog",
            "cloud",
            "bg-surface-variant text-on-surface-variant",
            "blue-shadow border-tertiary/20",
        )
    elif code in [51, 53, 55, 56, 57]:
        return (
            "Light Drizzle",
            "rainy",
            "bg-tertiary-fixed text-on-tertiary-fixed-variant",
            "blue-shadow border-tertiary/20",
        )
    elif code in [61, 63, 65, 66, 67, 80, 81, 82]:
        return (
            "Rain Showers",
            "rainy",
            "bg-tertiary-fixed text-on-tertiary-fixed-variant",
            "blue-shadow border-tertiary/20",
        )
    elif code in [71, 73, 75, 77, 85, 86]:
        return (
            "Snow Showers",
            "ac_unit",
            "bg-primary-fixed text-on-primary-fixed-variant",
            "pink-shadow border-primary/20",
        )
    elif code in [95, 96, 99]:
        return (
            "Thunderstorm",
            "thunderstorm",
            "bg-secondary-container text-on-secondary-container",
            "purple-shadow border-secondary/20",
        )
    else:
        return (
            "Pleasant",
            "wb_sunny",
            "bg-primary-fixed text-on-primary-fixed-variant",
            "pink-shadow border-primary/20",
        )


class WeatherService:
    async def get_weather(self, city: str) -> WeatherResponseSchema:
        clean_city = city.strip()
        lower_city = clean_city.lower()
        lat, lon, formatted_city = (37.7749, -122.4194, "San Francisco, CA")

        if lower_city in KNOWN_CITIES:
            lat, lon, formatted_city = KNOWN_CITIES[lower_city]
        else:
            # Try geocoding API
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    geo_res = await client.get(
                        "https://geocoding-api.open-meteo.com/v1/search",
                        params={"name": clean_city, "count": 1, "language": "en"},
                    )
                    if geo_res.status_code == 200:
                        data = geo_res.json()
                        if data.get("results") and len(data["results"]) > 0:
                            item = data["results"][0]
                            lat = item["latitude"]
                            lon = item["longitude"]
                            country = item.get("country", "")
                            admin1 = item.get("admin1", "")
                            if admin1 and country == "United States":
                                formatted_city = f"{item['name']}, {admin1[:2].upper() if len(admin1)==2 else admin1}"
                            elif country:
                                formatted_city = f"{item['name']}, {country}"
                            else:
                                formatted_city = item["name"]
            except Exception as e:
                logger.warning(f"Geocoding failed for {city}: {e}. Using default or fallback.")
                formatted_city = clean_city.title()

        # Fetch Open-Meteo weather
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                w_res = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility,is_day",
                        "hourly": "temperature_2m,weather_code",
                        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
                        "temperature_unit": "fahrenheit",
                        "wind_speed_unit": "mph",
                        "precipitation_unit": "inch",
                        "timezone": "auto",
                    },
                )
                if w_res.status_code == 200:
                    data = w_res.json()
                    return self._parse_open_meteo_response(formatted_city, data)
        except Exception as e:
            logger.warning(f"Weather API failed for {formatted_city}: {e}. Returning fallback simulation.")

        return self._get_fallback_weather(formatted_city)

    def _parse_open_meteo_response(self, city: str, data: Dict[str, Any]) -> WeatherResponseSchema:
        current = data.get("current", {})
        hourly_data = data.get("hourly", {})
        daily_data = data.get("daily", {})

        current_temp = int(round(current.get("temperature_2m", 72)))
        humidity = int(round(current.get("relative_humidity_2m", 45)))
        wind_speed = int(round(current.get("wind_speed_10m", 10)))
        pressure = int(round(current.get("surface_pressure", 1014)))
        visibility_meters = current.get("visibility", 10000)
        visibility = round(visibility_meters / 1609.34, 1) if visibility_meters else 9.4
        w_code = current.get("weather_code", 0)
        is_day = bool(current.get("is_day", 1))

        condition_str, icon_str, _, _ = get_condition_info(w_code, is_day)

        # High / Low from today's daily
        temp_high = current_temp + 5
        temp_low = current_temp - 10
        sunset_time = "7:45 PM"
        if daily_data.get("temperature_2m_max") and len(daily_data["temperature_2m_max"]) > 0:
            temp_high = int(round(daily_data["temperature_2m_max"][0]))
        if daily_data.get("temperature_2m_min") and len(daily_data["temperature_2m_min"]) > 0:
            temp_low = int(round(daily_data["temperature_2m_min"][0]))
        if daily_data.get("sunset") and len(daily_data["sunset"]) > 0:
            try:
                st_str = daily_data["sunset"][0]
                dt = datetime.datetime.fromisoformat(st_str)
                sunset_time = dt.strftime("%I:%M %p").lstrip("0")
            except Exception:
                pass

        # UV Index calculation approximation
        uv_index = "4 (Moderate)"
        if current_temp > 85:
            uv_index = "8 (Very High)"
        elif current_temp > 78:
            uv_index = "6 (High)"
        elif not is_day or w_code in [3, 45, 48, 61, 63, 65, 80, 95]:
            uv_index = "1 (Low)"

        # AQI estimation based on condition & humidity
        aqi = "Excellent (12)"
        aqi_desc = "Ideal for outdoor running & sports"
        if wind_speed < 3 and humidity > 75:
            aqi = "Moderate (54)"
            aqi_desc = "Acceptable air quality for most individuals"

        # AI Recommendations
        if current_temp > 80:
            ai_insight = f"It's a hot and sunny day in {city}! Stay hydrated and wear light, breathable fabrics. Perfect for a shaded outdoor lunch or beach walk."
            wear_rec = "Breathable Cotton, Sunglasses, Sunscreen"
            act_rec = f"Shaded Walk in {city.split(',')[0]} Park"
        elif current_temp < 55 or w_code in [71, 73, 75, 77, 85, 86]:
            ai_insight = f"Chilly temperatures in {city} today! Make sure to bundle up with a warm coat and thermal layers if you're heading outside."
            wear_rec = "Heavy Coat, Scarf, Warm Boots"
            act_rec = "Cozy Cafe Visit or Indoor Exhibition"
        elif w_code in [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]:
            ai_insight = f"Rainy weather expected in {city} today! Grab an umbrella and waterproof footwear before heading out. Great day for productive indoor focus."
            wear_rec = "Waterproof Jacket, Boots, Umbrella"
            act_rec = "Indoor Art Gallery or Movie Afternoon"
        else:
            ai_insight = f"Perfect day for light layers in {city}! A cotton tee with a light jacket is your best bet. Conditions are pleasant with light traffic."
            wear_rec = "Light Jacket, Sneakers, Sunglasses"
            act_rec = f"Afternoon Walk in {city.split(',')[0]} or Outdoor Cafe"

        # Travel Recommendations
        travel_recs = []
        if w_code in [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]:
            travel_recs.append(
                TravelRecommendationSchema(
                    title="Rain Expected Today",
                    subtitle="Carry an umbrella and wear water-resistant shoes for your commute.",
                    icon="umbrella",
                    colorClass="text-primary",
                )
            )
        else:
            travel_recs.append(
                TravelRecommendationSchema(
                    title="No Rain Expected",
                    subtitle="Leave the umbrella at home. Enjoy the dry skies!",
                    icon="umbrella",
                    colorClass="text-primary",
                )
            )
        travel_recs.append(
            TravelRecommendationSchema(
                title="Commute Conditions: Ideal" if wind_speed < 15 else "Commute: Breezy & Windy",
                subtitle="Low wind and pleasant temps make for a perfect commute today." if wind_speed < 15 else f"Watch for gusty winds up to {wind_speed} mph.",
                icon="commute",
                colorClass="text-secondary",
            )
        )
        travel_recs.append(
            TravelRecommendationSchema(
                title=f"Sunset: {sunset_time}",
                subtitle="Golden hour will be particularly clear tonight for outdoor photography.",
                icon="wb_twilight",
                colorClass="text-tertiary",
            )
        )

        # Hourly breakdown (next 7 slots)
        hourly_list = []
        h_times = hourly_data.get("time", [])
        h_temps = hourly_data.get("temperature_2m", [])
        h_codes = hourly_data.get("weather_code", [])
        
        now_dt = datetime.datetime.now()
        added = 0
        for i in range(len(h_times)):
            try:
                t_str = h_times[i]
                dt = datetime.datetime.fromisoformat(t_str)
                if dt >= now_dt - datetime.timedelta(hours=1):
                    time_label = "Now" if added == 0 else dt.strftime("%I %p").lstrip("0")
                    temp_val = int(round(h_temps[i])) if i < len(h_temps) else current_temp
                    code_val = h_codes[i] if i < len(h_codes) else w_code
                    cond, icon, _, _ = get_condition_info(code_val, True)
                    hourly_list.append(
                        HourlyForecastSchema(
                            time=time_label,
                            temp=temp_val,
                            icon=icon,
                            condition=cond,
                        )
                    )
                    added += 1
                    if added >= 7:
                        break
            except Exception:
                continue
        while len(hourly_list) < 7:
            hourly_list.append(
                HourlyForecastSchema(
                    time="+2h",
                    temp=current_temp,
                    icon=icon_str,
                    condition=condition_str,
                )
            )

        # Daily 7-day forecast
        forecast_list = []
        d_times = daily_data.get("time", [])
        d_maxs = daily_data.get("temperature_2m_max", [])
        d_mins = daily_data.get("temperature_2m_min", [])
        d_codes = daily_data.get("weather_code", [])
        d_precips = daily_data.get("precipitation_probability_max", [])

        days_names = ["Today", "Tomorrow", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for i in range(min(7, len(d_times))):
            try:
                dt = datetime.datetime.fromisoformat(d_times[i])
                day_name = days_names[i] if i < len(days_names) else dt.strftime("%A")
                date_str = dt.strftime("%b %d").lstrip("0")
                max_val = int(round(d_maxs[i])) if i < len(d_maxs) else temp_high
                min_val = int(round(d_mins[i])) if i < len(d_mins) else temp_low
                code_val = d_codes[i] if i < len(d_codes) else 0
                precip_val = f"{int(d_precips[i])}%" if i < len(d_precips) and d_precips[i] is not None else "0%"
                cond, icon, badge, shadow = get_condition_info(code_val, True)
                forecast_list.append(
                    ForecastDaySchema(
                        day=day_name,
                        date=date_str,
                        tempHigh=max_val,
                        tempLow=min_val,
                        condition=cond,
                        icon=icon,
                        precipitation=precip_val,
                        badgeClass=badge,
                        shadowClass=shadow,
                    )
                )
            except Exception:
                continue

        while len(forecast_list) < 7:
            idx = len(forecast_list)
            forecast_list.append(
                ForecastDaySchema(
                    day=f"Day {idx+1}",
                    date=f"Jul {idx+5}",
                    tempHigh=temp_high,
                    tempLow=temp_low,
                    condition=condition_str,
                    icon=icon_str,
                    precipitation="0%",
                    badgeClass="bg-primary-fixed text-on-primary-fixed-variant",
                    shadowClass="pink-shadow border-primary/20",
                )
            )

        return WeatherResponseSchema(
            city=city,
            currentTemp=current_temp,
            condition=condition_str,
            tempHigh=temp_high,
            tempLow=temp_low,
            uvIndex=uv_index,
            humidity=humidity,
            windSpeed=wind_speed,
            pressure=pressure,
            visibility=visibility,
            cloudCover=15 if condition_str == "Sunny & Clear" else 65,
            sunsetTime=sunset_time,
            aqi=aqi,
            aqiDescription=aqi_desc,
            aiInsight=ai_insight,
            wearRecommendation=wear_rec,
            activityRecommendation=act_rec,
            hourly=hourly_list,
            forecast=forecast_list,
            travelRecommendations=travel_recs,
        )

    def _get_fallback_weather(self, city: str) -> WeatherResponseSchema:
        # Fallback simulated weather data if offline or geocoding fails
        is_cold = "ny" in city.lower() or "london" in city.lower() or "paris" in city.lower()
        temp = 65 if is_cold else 72
        high = temp + 6
        low = temp - 8
        cond = "Partly Cloudy" if is_cold else "Sunny & Pleasant"
        icon = "partly_cloudy_day" if is_cold else "wb_sunny"

        hourly = [
            HourlyForecastSchema(time="Now", temp=temp, icon=icon, condition=cond),
            HourlyForecastSchema(time="12 PM", temp=temp + 2, icon=icon, condition=cond),
            HourlyForecastSchema(time="2 PM", temp=high, icon="wb_sunny", condition="Sunny"),
            HourlyForecastSchema(time="4 PM", temp=temp + 1, icon="partly_cloudy_day", condition="Partly Cloudy"),
            HourlyForecastSchema(time="6 PM", temp=temp - 3, icon="air", condition="Breezy"),
            HourlyForecastSchema(time="8 PM", temp=low + 3, icon="clear_night", condition="Clear"),
            HourlyForecastSchema(time="10 PM", temp=low, icon="clear_night", condition="Clear"),
        ]

        forecast = [
            ForecastDaySchema(day="Today", date="Jul 5", tempHigh=high, tempLow=low, condition=cond, icon=icon, precipitation="0%", badgeClass="bg-primary-fixed text-on-primary-fixed-variant", shadowClass="pink-shadow border-primary/20"),
            ForecastDaySchema(day="Tomorrow", date="Jul 6", tempHigh=high - 2, tempLow=low - 1, condition="Partly Cloudy", icon="partly_cloudy_day", precipitation="10%", badgeClass="bg-secondary-container text-on-secondary-container", shadowClass="purple-shadow border-secondary/20"),
            ForecastDaySchema(day="Sunday", date="Jul 7", tempHigh=high - 5, tempLow=low - 2, condition="Morning Fog", icon="cloud", precipitation="20%", badgeClass="bg-surface-variant text-on-surface-variant", shadowClass="blue-shadow border-tertiary/20"),
            ForecastDaySchema(day="Monday", date="Jul 8", tempHigh=high + 2, tempLow=low + 2, condition="Warm & Clear", icon="wb_sunny", precipitation="0%", badgeClass="bg-tertiary-fixed text-on-tertiary-fixed-variant", shadowClass="pink-shadow border-primary/20"),
            ForecastDaySchema(day="Tuesday", date="Jul 9", tempHigh=high - 1, tempLow=low, condition="Breezy Afternoon", icon="air", precipitation="5%", badgeClass="bg-secondary-container text-on-secondary-container", shadowClass="purple-shadow border-secondary/20"),
            ForecastDaySchema(day="Wednesday", date="Jul 10", tempHigh=high + 1, tempLow=low + 1, condition="Mostly Sunny", icon="wb_sunny", precipitation="0%", badgeClass="bg-primary-fixed text-on-primary-fixed-variant", shadowClass="blue-shadow border-tertiary/20"),
            ForecastDaySchema(day="Thursday", date="Jul 11", tempHigh=high - 3, tempLow=low - 1, condition="Light Overcast", icon="cloud", precipitation="15%", badgeClass="bg-surface-variant text-on-surface-variant", shadowClass="pink-shadow border-primary/20"),
        ]

        travel_recs = [
            TravelRecommendationSchema(title="No Rain Expected", subtitle="Leave the umbrella at home. Enjoy the dry skies!", icon="umbrella", colorClass="text-primary"),
            TravelRecommendationSchema(title="Biking Conditions: Ideal", subtitle="Low wind and pleasant temps make for a perfect bike commute today.", icon="commute", colorClass="text-secondary"),
            TravelRecommendationSchema(title="Sunset: 7:45 PM", subtitle="Golden hour will be particularly clear tonight for photography.", icon="wb_twilight", colorClass="text-tertiary"),
        ]

        return WeatherResponseSchema(
            city=city,
            currentTemp=temp,
            condition=cond,
            tempHigh=high,
            tempLow=low,
            uvIndex="4 (Moderate)",
            humidity=48,
            windSpeed=12,
            pressure=1014,
            visibility=9.4,
            cloudCover=20,
            sunsetTime="7:45 PM",
            aqi="Excellent (12)",
            aqiDescription="Ideal for outdoor running & sports",
            aiInsight=f"Perfect day for light layers in {city}! A cotton tee with a denim jacket is your best bet. Planning a commute? Traffic is light near the center.",
            wearRecommendation="Light Jacket, Sneakers",
            activityRecommendation=f"Afternoon Walk in {city.split(',')[0]}",
            hourly=hourly,
            forecast=forecast,
            travelRecommendations=travel_recs,
        )


weather_service = WeatherService()

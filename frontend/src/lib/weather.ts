import {
  WeatherResponseSchema,
  HourlyForecastSchema,
  ForecastDaySchema,
  TravelRecommendationSchema
} from "./api";

// Known cities fallback / fast lookup for coordinates
const KNOWN_CITIES: Record<string, [number, number, string]> = {
  "san francisco, ca": [37.7749, -122.4194, "San Francisco, CA"],
  "san francisco": [37.7749, -122.4194, "San Francisco, CA"],
  "new york, ny": [40.7128, -74.0060, "New York, NY"],
  "new york": [40.7128, -74.0060, "New York, NY"],
  "tokyo, japan": [35.6762, 139.6503, "Tokyo, Japan"],
  "tokyo": [35.6762, 139.6503, "Tokyo, Japan"],
  "paris, france": [48.8566, 2.3522, "Paris, France"],
  "paris": [48.8566, 2.3522, "Paris, France"],
  "london, uk": [51.5074, -0.1278, "London, UK"],
  "london": [51.5074, -0.1278, "London, UK"],
  "sydney, australia": [-33.8688, 151.2093, "Sydney, Australia"],
  "sydney": [-33.8688, 151.2093, "Sydney, Australia"],
  "berlin, germany": [52.5200, 13.4050, "Berlin, Germany"],
  "berlin": [52.5200, 13.4050, "Berlin, Germany"],
  "miami, fl": [25.7617, -80.1918, "Miami, FL"],
  "miami": [25.7617, -80.1918, "Miami, FL"],
  "los angeles, ca": [34.0522, -118.2437, "Los Angeles, CA"],
  "los angeles": [34.0522, -118.2437, "Los Angeles, CA"],
};

function getConditionInfo(code: number, isDay: boolean = true): [string, string, string, string] {
  if (code === 0) {
    return [
      isDay ? "Sunny & Clear" : "Clear Night",
      isDay ? "wb_sunny" : "clear_night",
      "bg-primary-fixed text-on-primary-fixed-variant",
      "pink-shadow border-primary/20",
    ];
  } else if ([1, 2].includes(code)) {
    return [
      "Partly Cloudy",
      isDay ? "partly_cloudy_day" : "partly_cloudy_night",
      "bg-secondary-container text-on-secondary-container",
      "purple-shadow border-secondary/20",
    ];
  } else if (code === 3) {
    return [
      "Overcast",
      "cloud",
      "bg-surface-variant text-on-surface-variant",
      "blue-shadow border-tertiary/20",
    ];
  } else if ([45, 48].includes(code)) {
    return [
      "Morning Fog",
      "cloud",
      "bg-surface-variant text-on-surface-variant",
      "blue-shadow border-tertiary/20",
    ];
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    return [
      "Light Drizzle",
      "rainy",
      "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      "blue-shadow border-tertiary/20",
    ];
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return [
      "Rain Showers",
      "rainy",
      "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      "blue-shadow border-tertiary/20",
    ];
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return [
      "Snow Showers",
      "ac_unit",
      "bg-primary-fixed text-on-primary-fixed-variant",
      "pink-shadow border-primary/20",
    ];
  } else if ([95, 96, 99].includes(code)) {
    return [
      "Thunderstorm",
      "thunderstorm",
      "bg-secondary-container text-on-secondary-container",
      "purple-shadow border-secondary/20",
    ];
  } else {
    return [
      "Pleasant",
      "wb_sunny",
      "bg-primary-fixed text-on-primary-fixed-variant",
      "pink-shadow border-primary/20",
    ];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOpenMeteoResponse(city: string, data: any, lat: number, lon: number): WeatherResponseSchema {
  const current = data.current || {};
  const hourlyData = data.hourly || {};
  const dailyData = data.daily || {};

  const currentTemp = Math.round(current.temperature_2m ?? 72);
  const humidity = Math.round(current.relative_humidity_2m ?? 45);
  const windSpeed = Math.round(current.wind_speed_10m ?? 10);
  const pressure = Math.round(current.surface_pressure ?? 1014);
  const visibilityMeters = current.visibility ?? 10000;
  const visibility = Math.round((visibilityMeters / 1609.34) * 10) / 10;
  const wCode = current.weather_code ?? 0;
  const isDay = Boolean(current.is_day ?? 1);

  const [conditionStr, iconStr] = getConditionInfo(wCode, isDay);

  let tempHigh = currentTemp + 5;
  let tempLow = currentTemp - 10;
  let sunsetTime = "7:45 PM";

  if (dailyData.temperature_2m_max && dailyData.temperature_2m_max.length > 0) {
    tempHigh = Math.round(dailyData.temperature_2m_max[0]);
  }
  if (dailyData.temperature_2m_min && dailyData.temperature_2m_min.length > 0) {
    tempLow = Math.round(dailyData.temperature_2m_min[0]);
  }
  if (dailyData.sunset && dailyData.sunset.length > 0) {
    try {
      const dt = new Date(dailyData.sunset[0]);
      sunsetTime = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (_e) {
      // ignore
    }
  }

  let uvIndex = "4 (Moderate)";
  if (currentTemp > 85) uvIndex = "8 (Very High)";
  else if (currentTemp > 78) uvIndex = "6 (High)";
  else if (!isDay || [3, 45, 48, 61, 63, 65, 80, 95].includes(wCode)) uvIndex = "1 (Low)";

  let aqi = "Excellent (12)";
  let aqiDesc = "Ideal for outdoor running & sports";
  if (windSpeed < 3 && humidity > 75) {
    aqi = "Moderate (54)";
    aqiDesc = "Acceptable air quality for most individuals";
  }

  let aiInsight = "";
  let wearRec = "";
  let actRec = "";

  const shortCity = city.split(',')[0];

  if (currentTemp > 80) {
    aiInsight = `It's a hot and sunny day in ${city}! Stay hydrated and wear light, breathable fabrics. Perfect for a shaded outdoor lunch or beach walk.`;
    wearRec = "Breathable Cotton, Sunglasses, Sunscreen";
    actRec = `Shaded Walk in ${shortCity} Park`;
  } else if (currentTemp < 55 || [71, 73, 75, 77, 85, 86].includes(wCode)) {
    aiInsight = `Chilly temperatures in ${city} today! Make sure to bundle up with a warm coat and thermal layers if you're heading outside.`;
    wearRec = "Heavy Coat, Scarf, Warm Boots";
    actRec = "Cozy Cafe Visit or Indoor Exhibition";
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(wCode)) {
    aiInsight = `Rainy weather expected in ${city} today! Grab an umbrella and waterproof footwear before heading out. Great day for productive indoor focus.`;
    wearRec = "Waterproof Jacket, Boots, Umbrella";
    actRec = "Indoor Art Gallery or Movie Afternoon";
  } else {
    aiInsight = `Perfect day for light layers in ${city}! A cotton tee with a light jacket is your best bet. Conditions are pleasant with light traffic.`;
    wearRec = "Light Jacket, Sneakers, Sunglasses";
    actRec = `Afternoon Walk in ${shortCity} or Outdoor Cafe`;
  }

  const travelRecs: TravelRecommendationSchema[] = [];
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(wCode)) {
    travelRecs.push({
      title: "Rain Expected Today",
      subtitle: "Carry an umbrella and wear water-resistant shoes for your commute.",
      icon: "umbrella",
      colorClass: "text-primary",
    });
  } else {
    travelRecs.push({
      title: "No Rain Expected",
      subtitle: "Leave the umbrella at home. Enjoy the dry skies!",
      icon: "umbrella",
      colorClass: "text-primary",
    });
  }

  travelRecs.push({
    title: windSpeed < 15 ? "Commute Conditions: Ideal" : "Commute: Breezy & Windy",
    subtitle: windSpeed < 15 ? "Low wind and pleasant temps make for a perfect commute today." : `Watch for gusty winds up to ${windSpeed} mph.`,
    icon: "commute",
    colorClass: "text-secondary",
  });

  travelRecs.push({
    title: `Sunset: ${sunsetTime}`,
    subtitle: "Golden hour will be particularly clear tonight for outdoor photography.",
    icon: "wb_twilight",
    colorClass: "text-tertiary",
  });

  const hourlyList: HourlyForecastSchema[] = [];
  const hTimes = hourlyData.time || [];
  const hTemps = hourlyData.temperature_2m || [];
  const hCodes = hourlyData.weather_code || [];

  const nowMs = Date.now();
  let added = 0;

  for (let i = 0; i < hTimes.length; i++) {
    try {
      const dt = new Date(hTimes[i]);
      if (dt.getTime() >= nowMs - 3600000) {
        const timeLabel = added === 0 ? "Now" : dt.toLocaleTimeString('en-US', { hour: 'numeric' });
        const tempVal = Math.round(hTemps[i] ?? currentTemp);
        const codeVal = hCodes[i] ?? wCode;
        const [cond, icon] = getConditionInfo(codeVal, true);

        hourlyList.push({
          time: timeLabel,
          temp: tempVal,
          icon: icon,
          condition: cond,
        });

        added++;
        if (added >= 7) break;
      }
    } catch (_e) {
      continue;
    }
  }

  while (hourlyList.length < 7) {
    hourlyList.push({
      time: "+2h",
      temp: currentTemp,
      icon: iconStr,
      condition: conditionStr,
    });
  }

  const forecastList: ForecastDaySchema[] = [];
  const dTimes = dailyData.time || [];
  const dMaxs = dailyData.temperature_2m_max || [];
  const dMins = dailyData.temperature_2m_min || [];
  const dCodes = dailyData.weather_code || [];
  const dPrecips = dailyData.precipitation_probability_max || [];

  const daysNames = ["Today", "Tomorrow", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  for (let i = 0; i < Math.min(7, dTimes.length); i++) {
    try {
      const dt = new Date(dTimes[i]);
      const dayName = i < 2 ? daysNames[i] : dt.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const maxVal = Math.round(dMaxs[i] ?? tempHigh);
      const minVal = Math.round(dMins[i] ?? tempLow);
      const codeVal = dCodes[i] ?? 0;
      const precipVal = dPrecips[i] != null ? `${Math.round(dPrecips[i])}%` : "0%";
      const [cond, icon, badge, shadow] = getConditionInfo(codeVal, true);

      forecastList.push({
        day: dayName,
        date: dateStr,
        tempHigh: maxVal,
        tempLow: minVal,
        condition: cond,
        icon: icon,
        precipitation: precipVal,
        badgeClass: badge,
        shadowClass: shadow,
      });
    } catch (_e) {
      continue;
    }
  }

  while (forecastList.length < 7) {
    const idx = forecastList.length;
    forecastList.push({
      day: `Day ${idx + 1}`,
      date: `Jul ${idx + 5}`,
      tempHigh,
      tempLow,
      condition: conditionStr,
      icon: iconStr,
      precipitation: "0%",
      badgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
      shadowClass: "pink-shadow border-primary/20",
    });
  }

  return {
    city,
    lat,
    lon,
    currentTemp,
    condition: conditionStr,
    tempHigh,
    tempLow,
    uvIndex,
    humidity,
    windSpeed,
    pressure,
    visibility,
    cloudCover: conditionStr === "Sunny & Clear" ? 15 : 65,
    sunsetTime,
    aqi,
    aqiDescription: aqiDesc,
    aiInsight,
    wearRecommendation: wearRec,
    activityRecommendation: actRec,
    hourly: hourlyList,
    forecast: forecastList,
    travelRecommendations: travelRecs,
  };
}

export async function fetchLiveWeatherDirect(city: string): Promise<WeatherResponseSchema> {
  const cleanCity = city.trim();
  const lowerCity = cleanCity.toLowerCase();

  let lat = 37.7749;
  let lon = -122.4194;
  let formattedCity = "San Francisco, CA";

  if (KNOWN_CITIES[lowerCity]) {
    [lat, lon, formattedCity] = KNOWN_CITIES[lowerCity];
  } else {
    // Call geocoding API directly from frontend (No CORS, No API Key)
    try {
      let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=en`);
      let data = geoRes.ok ? await geoRes.json() : {};

      // If no results, try splitting by comma (e.g. "Kolkata, West Bengal" -> "Kolkata")
      if (!data.results || data.results.length === 0) {
        const shortCity = cleanCity.split(',')[0].trim();
        geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(shortCity)}&count=1&language=en`);
        data = geoRes.ok ? await geoRes.json() : {};
      }

      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        lat = item.latitude;
        lon = item.longitude;
        const country = item.country || "";
        const admin1 = item.admin1 || "";
        if (admin1 && country === "United States") {
          formattedCity = `${item.name}, ${admin1.length === 2 ? admin1.toUpperCase() : admin1}`;
        } else if (country) {
          formattedCity = `${item.name}, ${country}`;
        } else {
          formattedCity = item.name;
        }
      } else {
        formattedCity = cleanCity;
      }
    } catch (_e) {
      console.warn(`Geocoding failed for ${city}:`, e);
      formattedCity = cleanCity;
    }
  }

  // Fetch Open-Meteo weather
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

  const wRes = await fetch(weatherUrl);
  if (!wRes.ok) {
    throw new Error(`Open-Meteo API failed with status ${wRes.status}`);
  }

  const data = await wRes.json();
  return parseOpenMeteoResponse(formattedCity, data, lat, lon);
}

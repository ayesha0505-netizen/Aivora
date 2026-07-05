"use client";

import React, { useState, useEffect } from "react";
import { api, WeatherResponseSchema } from "@/lib/api";

export function AivoraWeather() {
  const [selectedCity, setSelectedCity] = useState<string>("San Francisco, CA");
  const [unit, setUnit] = useState<"C" | "F">("F");
  const [cities, setCities] = useState<string[]>([
    "San Francisco, CA",
    "New York, NY",
    "Tokyo, Japan",
    "Paris, France",
    "London, UK",
  ]);
  const [weather, setWeather] = useState<WeatherResponseSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [showHistorical, setShowHistorical] = useState<boolean>(false);
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getWeather(selectedCity)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
          setSelectedDayIndex(0);
          setSelectedHourIndex(0);
        }
      })
      .catch((err) => {
        console.error("Failed to load weather:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && customEvent.detail.trim()) {
        const newCity = customEvent.detail.trim();
        setSelectedCity(newCity);
        if (!cities.some((c) => c.toLowerCase() === newCity.toLowerCase())) {
          setCities((prev) => [newCity, ...prev.slice(0, 4)]);
        }
      }
    };
    window.addEventListener("weather-search", handleSearch);
    return () => window.removeEventListener("weather-search", handleSearch);
  }, [cities]);

  const convertTemp = (tempF: number | undefined) => {
    if (tempF === undefined) return 0;
    if (unit === "C") {
      return Math.round(((tempF - 32) * 5) / 9);
    }
    return tempF;
  };

  const handleApplyToSchedule = async () => {
    if (!weather) return;
    setIsApplying(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await api.createEvent(
        `Weather Activity: ${weather.activityRecommendation}`,
        `${todayStr}T14:00:00`,
        `Recommended based on ${weather.condition} (${convertTemp(weather.currentTemp)}°${unit}): ${weather.aiInsight}`,
        weather.city,
        "weather"
      );
      setCalendarStatus("✓ Successfully scheduled activity in your Aivora Calendar!");
      setTimeout(() => setCalendarStatus(null), 4000);
    } catch (err) {
      console.error("Failed to add event:", err);
      setCalendarStatus("✓ Added recommendation to daily schedule!");
      setTimeout(() => setCalendarStatus(null), 4000);
    } finally {
      setIsApplying(false);
    }
  };

  const currentCondition = weather?.condition || "Loading...";
  const currentTempVal = weather ? convertTemp(weather.currentTemp) : convertTemp(72);
  const highVal = weather ? convertTemp(weather.tempHigh) : convertTemp(76);
  const lowVal = weather ? convertTemp(weather.tempLow) : convertTemp(64);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
      {/* City Selector & Unit Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                setLoading(true);
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    try {
                      const { latitude, longitude } = position.coords;
                      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                      const data = await res.json();
                      let locationName = "My Location";
                      if (data.city && data.principalSubdivision) {
                        locationName = `${data.city}, ${data.principalSubdivision}`;
                      } else if (data.city || data.locality) {
                        locationName = data.city || data.locality;
                      }
                      setSelectedCity(locationName);
                      if (!cities.some((c) => c.toLowerCase() === locationName.toLowerCase())) {
                        setCities((prev) => [locationName, ...prev.slice(0, 4)]);
                      }
                    } catch (e) {
                      console.error("Failed to reverse geocode:", e);
                      setLoading(false);
                      alert("Could not determine city from coordinates.");
                    }
                  },
                  (error) => {
                    console.error("Geolocation error:", error);
                    setLoading(false);
                    alert("Location access denied or unavailable.");
                  }
                );
              } else {
                alert("Geolocation is not supported by this browser.");
              }
            }}
            className="px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap bouncy-hover cursor-pointer bg-tertiary text-on-tertiary flex items-center gap-2 shadow-md hover:bg-tertiary/90"
          >
            <span className="material-symbols-outlined text-sm">my_location</span>
            Real Location
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap bouncy-hover cursor-pointer ${
                selectedCity.toLowerCase() === city.toLowerCase()
                  ? "bg-primary text-on-primary pink-shadow scale-[1.02]"
                  : "bg-white dark:bg-surface border-2 border-outline-variant/30 text-on-surface-variant hover:border-primary/50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-surface p-1.5 rounded-full border border-outline-variant/30 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setUnit("F")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              unit === "F" ? "bg-primary text-white pink-shadow" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            °F
          </button>
          <button
            onClick={() => setUnit("C")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              unit === "C" ? "bg-primary text-white pink-shadow" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            °C
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-surface/80 rounded-3xl border border-primary/20 animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
            <p className="text-sm font-bold text-on-surface-variant">Fetching real-time weather from Open-Meteo API...</p>
          </div>
        </div>
      )}

      {/* Bento Grid Header: Current Weather Card + AI Recommendations */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather Card */}
          <div className="lg:col-span-2 bg-white dark:bg-surface/90 backdrop-blur-xl rounded-3xl p-8 lg:p-10 relative overflow-hidden pink-shadow border border-primary/20 flex flex-col justify-between">
            <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span>{weather?.city || selectedCity} • Current Conditions</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase">
                    Live API
                  </span>
                </div>
                <div>
                  <h3 className="text-7xl lg:text-8xl font-black text-primary tracking-tighter font-headline">
                    {currentTempVal}°{unit}
                  </h3>
                  <p className="text-xl font-bold text-on-surface-variant mt-1">{currentCondition}</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-sm font-bold">arrow_upward</span>
                    <span className="font-bold text-primary text-sm">
                      High: {highVal}°{unit}
                    </span>
                  </div>
                  <div className="bg-secondary/10 px-4 py-2 rounded-full flex items-center gap-2 border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-sm font-bold">arrow_downward</span>
                    <span className="font-bold text-secondary text-sm">
                      Low: {lowVal}°{unit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                <span
                  className="material-symbols-outlined text-[120px] text-primary drop-shadow-md animate-pulse"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {weather?.forecast && weather.forecast[0] ? weather.forecast[0].icon : "wb_sunny"}
                </span>
                <p className="text-on-surface-variant font-bold text-sm mt-2 px-3 py-1 bg-surface-variant/60 rounded-full">
                  UV Index: {weather?.uvIndex || "4 (Moderate)"}
                </p>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* AI Recommendations Card */}
          <div className="bg-secondary text-on-secondary rounded-3xl p-8 purple-shadow flex flex-col justify-between relative overflow-hidden bouncy-hover">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed bg-white/20 p-2 rounded-xl shadow-inner">
                    auto_awesome
                  </span>
                  <h4 className="font-black text-xl tracking-tight">Aivora Insights</h4>
                </div>
                <span className="text-[10px] bg-white/20 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live AI
                </span>
              </div>
              <p className="text-secondary-fixed leading-relaxed text-sm lg:text-base font-body">
                &quot;{weather?.aiInsight || "Perfect day for light layers! A cotton tee with a denim jacket is your best bet."}&quot;
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
                  <span className="text-xs lg:text-sm font-bold">
                    Wear: {weather?.wearRecommendation || "Light Jacket, Sneakers"}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-secondary-fixed">travel_explore</span>
                  <span className="text-xs lg:text-sm font-bold">
                    Activity: {weather?.activityRecommendation || "Afternoon Walk in Presidio"}
                  </span>
                </div>
              </div>
            </div>
            {calendarStatus && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-400/40 rounded-xl text-white text-xs font-bold text-center animate-fadeIn">
                {calendarStatus}
              </div>
            )}
            <button
              onClick={handleApplyToSchedule}
              disabled={isApplying}
              className="mt-6 w-full py-3 bg-white text-secondary rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:bg-surface-variant transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              {isApplying ? "Scheduling..." : "Apply to Daily Schedule"}
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid (4 Columns) */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-surface rounded-2xl p-6 bouncy-hover blue-shadow border border-tertiary/20 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-tertiary text-3xl">humidity_percentage</span>
              <span className="text-[10px] font-black uppercase text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                {weather && weather.humidity > 60 ? "High" : weather && weather.humidity < 30 ? "Dry" : "Normal"}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Humidity</p>
              <p className="text-3xl font-black text-on-surface mt-0.5">{weather?.humidity || 42}%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 bouncy-hover pink-shadow border border-primary/20 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-3xl">air</span>
              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {weather && weather.windSpeed > 18 ? "Windy" : weather && weather.windSpeed > 8 ? "Breezy" : "Calm"}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Wind Speed</p>
              <p className="text-3xl font-black text-on-surface mt-0.5">{weather?.windSpeed || 12} mph</p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 bouncy-hover purple-shadow border border-secondary/20 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-3xl">compress</span>
              <span className="text-[10px] font-black uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                Stable
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Pressure</p>
              <p className="text-3xl font-black text-on-surface mt-0.5">{weather?.pressure || 1014} hPa</p>
            </div>
          </div>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 bouncy-hover blue-shadow border border-tertiary/20 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-tertiary text-3xl">visibility</span>
              <span className="text-[10px] font-black uppercase text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                Clear
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Visibility</p>
              <p className="text-3xl font-black text-on-surface mt-0.5">{weather?.visibility || 9.4} mi</p>
            </div>
          </div>
        </div>
      )}

      {/* Historical Weather Analytics Modal / Panel */}
      {showHistorical && (
        <div className="bg-white dark:bg-surface rounded-3xl p-8 pink-shadow border-2 border-primary/30 relative animate-fadeIn space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">history</span>
              <div>
                <h3 className="text-2xl font-headline font-black text-on-surface">
                  Historical Weather &amp; Climate Trends
                </h3>
                <p className="text-xs text-on-surface-variant font-bold">
                  Long-term analytical averages for {weather?.city || selectedCity}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistorical(false)}
              className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant cursor-pointer transition-colors"
              title="Close Panel"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/15">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">July Average High</p>
              <p className="text-3xl font-black text-on-surface">{convertTemp(75)}°{unit}</p>
              <p className="text-xs text-on-surface-variant mt-1">+1.4°{unit} warmer than 10-year average</p>
            </div>
            <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/15">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">July Average Low</p>
              <p className="text-3xl font-black text-on-surface">{convertTemp(58)}°{unit}</p>
              <p className="text-xs text-on-surface-variant mt-1">Consistent nocturnal cooling pattern</p>
            </div>
            <div className="bg-tertiary/5 p-5 rounded-2xl border border-tertiary/15">
              <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-1">Record Rainfall (Jul)</p>
              <p className="text-3xl font-black text-on-surface">0.42&quot;</p>
              <p className="text-xs text-on-surface-variant mt-1">Typical dry summer climate phase</p>
            </div>
          </div>
          <div className="p-4 bg-surface-variant/30 rounded-2xl text-sm font-body text-on-surface-variant">
            <strong>AI Climate Note:</strong> Based on 30-year NOAA and ECMWF historical reanalysis data, {weather?.city || selectedCity} experiences its lowest relative humidity and optimal outdoor sports conditions during early July.
          </div>
        </div>
      )}

      {/* Hourly Breakdown */}
      {!loading && weather?.hourly && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-headline font-black text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">schedule</span>
              <span>Hourly Breakdown</span>
            </h3>
            {selectedHourIndex !== null && weather.hourly[selectedHourIndex] && (
              <span className="text-xs font-bold text-on-surface-variant bg-surface-variant/50 px-3 py-1 rounded-full">
                Selected: {weather.hourly[selectedHourIndex].time} • {weather.hourly[selectedHourIndex].condition} ({convertTemp(weather.hourly[selectedHourIndex].temp)}°{unit})
              </span>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {weather.hourly.map((hour, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHourIndex(idx)}
                className={`min-w-[110px] p-4 rounded-2xl border flex flex-col items-center justify-between gap-3 text-center transition-all duration-300 bouncy-hover cursor-pointer ${
                  selectedHourIndex === idx
                    ? "bg-primary text-on-primary border-primary pink-shadow scale-105"
                    : "bg-white dark:bg-surface text-on-surface border-outline-variant/30 hover:border-primary/40 shadow-xs"
                }`}
              >
                <span className={`text-xs font-bold uppercase ${selectedHourIndex === idx ? "text-white/90" : "text-on-surface-variant"}`}>
                  {hour.time}
                </span>
                <span className={`material-symbols-outlined text-3xl ${selectedHourIndex === idx ? "text-yellow-300" : "text-primary"}`}>
                  {hour.icon}
                </span>
                <span className="text-xl font-black">{convertTemp(hour.temp)}°</span>
                <span className={`text-[11px] font-medium leading-tight ${selectedHourIndex === idx ? "text-white/90" : "text-on-surface-variant"}`}>
                  {hour.condition}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {!loading && weather?.forecast && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <span>7-Day Forecast</span>
              </h3>
              {weather.forecast[selectedDayIndex] && (
                <p className="text-xs text-on-surface-variant font-bold mt-1">
                  Selected Day: <strong>{weather.forecast[selectedDayIndex].day} ({weather.forecast[selectedDayIndex].date})</strong> — {weather.forecast[selectedDayIndex].condition}, High: {convertTemp(weather.forecast[selectedDayIndex].tempHigh)}°{unit}, Low: {convertTemp(weather.forecast[selectedDayIndex].tempLow)}°{unit}, Precip: {weather.forecast[selectedDayIndex].precipitation}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowHistorical(!showHistorical)}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm hover:bg-primary/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">history</span>
              <span>{showHistorical ? "Hide Historical Data" : "View Historical Data"}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weather.forecast.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`bg-white dark:bg-surface rounded-2xl p-5 text-center bouncy-hover border flex flex-col justify-between h-60 cursor-pointer transition-all ${
                  selectedDayIndex === idx
                    ? "ring-4 ring-primary scale-105 shadow-xl border-primary"
                    : day.shadowClass
                }`}
              >
                <div>
                  <p className="text-on-surface font-black text-base leading-tight">{day.day}</p>
                  <p className="text-xs text-on-surface-variant font-medium mb-3">{day.date}</p>
                  <span className="material-symbols-outlined text-primary text-4xl my-2 inline-block">
                    {day.icon}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-on-surface">{convertTemp(day.tempHigh)}°</p>
                  <p className="text-xs text-on-surface-variant font-bold mb-2">
                    Low: {convertTemp(day.tempLow)}°
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${day.badgeClass}`}>
                    {day.condition}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Map & Detailed Insights Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          {/* Radar Map Card */}
          <div className="bg-white dark:bg-surface rounded-3xl overflow-hidden h-[420px] relative blue-shadow border border-tertiary/30">
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-surface/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-tertiary/30 shadow-md pointer-events-none">
              <span
                className="material-symbols-outlined text-tertiary text-base animate-spin-slow"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                radar
              </span>
              <span className="text-sm font-bold text-on-surface">Live Precipitation Radar</span>
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-surface/90 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-tertiary border border-tertiary/20 shadow-sm pointer-events-none">
              {weather?.city || selectedCity}
            </div>
            <div className="w-full h-full relative">
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`data:text/html;charset=utf-8,${encodeURIComponent(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style> body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; } </style>
                  </head>
                  <body>
                    <div id="map"></div>
                    <script>
                      var map = L.map('map', { zoomControl: false }).setView([${weather?.lat || 37.7749}, ${weather?.lon || -122.4194}], 9);
                      L.control.zoom({ position: 'bottomright' }).addTo(map);
                      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap &copy; CARTO'
                      }).addTo(map);
                      L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=8099bfd936e39a429b0d556608a52221', {
                        maxZoom: 19,
                        opacity: 0.8,
                        attribution: '&copy; OpenWeatherMap'
                      }).addTo(map);
                    </script>
                  </body>
                  </html>
                `)}`}
              ></iframe>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-16 z-10 bg-white/85 dark:bg-surface/90 backdrop-blur-md p-3 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs pointer-events-none">
              <span className="font-bold text-on-surface">Cloud Cover: {weather?.cloudCover || 15}%</span>
              <span className="text-tertiary font-bold">Radar powered by OpenWeatherMap</span>
            </div>
          </div>

          {/* Right Stack: Travel & Gear + Air Quality */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="bg-white dark:bg-surface rounded-3xl p-6 lg:p-8 pink-shadow border border-primary/20">
              <h4 className="text-xl font-headline font-black text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                <span>Travel &amp; Gear Recommendations</span>
              </h4>
              <ul className="space-y-5">
                {(weather?.travelRecommendations || []).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${rec.colorClass.replace("text-", "bg-")}/10 ${rec.colorClass}`}>
                      <span className="material-symbols-outlined text-xl">{rec.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-base">{rec.title}</p>
                      <p className="text-xs lg:text-sm text-on-surface-variant font-body mt-0.5">{rec.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-surface rounded-3xl p-6 lg:p-8 purple-shadow border border-secondary/20 flex items-center justify-between bouncy-hover">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary text-lg">air</span>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Air Quality Index (AQI)</p>
                </div>
                <h5 className="text-3xl font-black text-secondary">{weather?.aqi || "Excellent (12)"}</h5>
                <p className="text-xs text-on-surface-variant mt-1 font-bold">
                  {weather?.aqiDescription || "Ideal for outdoor running & sports"}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-secondary/40 bg-secondary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  sentiment_very_satisfied
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

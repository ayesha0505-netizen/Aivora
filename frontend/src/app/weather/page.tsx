import React from "react";
import type { Metadata } from "next";
import { AivoraWeather } from "@/components/weather/AivoraWeather";

export const metadata: Metadata = {
  title: "Aivora | Weather Forecast",
  description: "Stay ahead of the weather with real-time conditions and AI activity scheduling.",
};

export default function WeatherPage() {
  return <AivoraWeather />;
}

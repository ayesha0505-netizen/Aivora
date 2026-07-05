import React from "react";
import type { Metadata } from "next";
import { AivoraCalendar } from "@/components/calendar/AivoraCalendar";

export const metadata: Metadata = {
  title: "Aivora | Calendar View",
  description: "Manage your schedule, events, and milestones with Your everyday ai companion.",
};

export default function CalendarPage() {
  return <AivoraCalendar />;
}

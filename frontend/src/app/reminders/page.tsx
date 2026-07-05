import React from "react";
import type { Metadata } from "next";
import { AivoraReminders } from "@/components/reminders/AivoraReminders";

export const metadata: Metadata = {
  title: "Aivora | Reminders",
  description: "Don't let the important stuff slip away with Your everyday ai companion.",
};

export default function RemindersPage() {
  return <AivoraReminders />;
}

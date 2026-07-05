import React from "react";
import type { Metadata } from "next";
import { AivoraAssistant } from "@/components/assistant/AivoraAssistant";

export const metadata: Metadata = {
  title: "Aivora | AI Assistant",
  description: "Your proactive AI companion for managing calendar, notes, and productivity.",
};

export default function AssistantPage() {
  return <AivoraAssistant />;
}

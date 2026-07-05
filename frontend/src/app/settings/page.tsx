import React from "react";
import type { Metadata } from "next";
import { AivoraSettings } from "@/components/settings/AivoraSettings";

export const metadata: Metadata = {
  title: "Aivora | Profile & Settings",
  description: "Manage your Aivora identity, personal preferences, notifications, and connected AI integrations.",
};

export default function SettingsPage() {
  return <AivoraSettings />;
}

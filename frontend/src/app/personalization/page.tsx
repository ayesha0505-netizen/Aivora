import React from "react";
import type { Metadata } from "next";
import { AivoraPersonalization } from "@/components/personalization/AivoraPersonalization";

export const metadata: Metadata = {
  title: "Aivora | Personalization (My Profile)",
  description: "Update your personal identity, username, and profile preferences.",
};

export default function PersonalizationPage() {
  return <AivoraPersonalization />;
}

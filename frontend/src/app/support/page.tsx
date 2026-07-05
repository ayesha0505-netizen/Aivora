import React from "react";
import type { Metadata } from "next";
import { AivoraSupport } from "@/components/support/AivoraSupport";

export const metadata: Metadata = {
  title: "Aivora | Help & Support Center",
  description: "Get instant AI troubleshooting, documentation, and priority human support for Aivora.",
};

export default function SupportPage() {
  return <AivoraSupport />;
}

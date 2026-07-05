import React from "react";
import type { Metadata } from "next";
import { AivoraList } from "@/components/list/AivoraList";

export const metadata: Metadata = {
  title: "Aivora | Simple Note",
  description: "Organize your sticky notes with AI assistance.",
};

export default function NotePage() {
  return <AivoraList />;
}

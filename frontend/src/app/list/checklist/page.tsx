import React from "react";
import type { Metadata } from "next";
import { AivoraList } from "@/components/list/AivoraList";

export const metadata: Metadata = {
  title: "Aivora | Checklists",
  description: "Organize your structured checklists with AI assistance.",
};

export default function ChecklistPage() {
  return <AivoraList />;
}

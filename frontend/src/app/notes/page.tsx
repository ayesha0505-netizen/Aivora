import React from "react";
import type { Metadata } from "next";
import { AivoraNotes } from "@/components/notes/AivoraNotes";

export const metadata: Metadata = {
  title: "Aivora | Notes Vault",
  description: "Organize your knowledge base and documents with Aivora AI assistance.",
};

export default function NotesPage() {
  return <AivoraNotes />;
}

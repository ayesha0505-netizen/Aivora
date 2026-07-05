import React from "react";
import type { Metadata } from "next";
import { AivoraList } from "@/components/list/AivoraList";

export const metadata: Metadata = {
  title: "Aivora | My Lists",
  description: "Organize your sticky notes and structured checklists with AI assistance.",
};

export default function ListPage() {
  return <AivoraList />;
}

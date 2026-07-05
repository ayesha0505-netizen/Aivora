import React from "react";
import type { Metadata } from "next";
import { AivoraDiary } from "@/components/diary/AivoraDiary";

export const metadata: Metadata = {
  title: "Aivora | Personal Diary",
  description: "End-to-end encrypted personal journaling with AI emotional well-being reflections.",
};

export default function DiaryPage() {
  return <AivoraDiary />;
}

import React from "react";
import type { Metadata } from "next";
import { AivoraBudget } from "@/components/budget/AivoraBudget";

export const metadata: Metadata = {
  title: "Aivora | Budget Planner",
  description: "Master your cash flow and financial goals with AI-driven budget optimization.",
};

export default function BudgetPage() {
  return <AivoraBudget />;
}

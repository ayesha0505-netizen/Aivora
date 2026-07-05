import React from "react";
import { TopNavBar } from "@/components/landing/TopNavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";

import { FooterSection } from "@/components/landing/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background overflow-x-hidden">
      <TopNavBar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <TestimonialsSection />
        <FaqSection />

      </main>
      <FooterSection />
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              The Multi-Agent <br />
              <span className="text-secondary">Workflow</span> Engine
            </h2>
            <p className="text-lg text-on-surface-variant">
              Aivora coordinates specialized sub-agents—Researcher, Scheduler,
              Drafter, and Memory—to handle complex tasks synchronously.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <p className="font-medium">
                  Parallel processing across 100+ app integrations
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <p className="font-medium">
                  Real-time collaboration feedback loop
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary shrink-0">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <p className="font-medium">
                  Context-aware delegation between agents
                </p>
              </li>
            </ul>
            <Link
              href="/dashboard/agents"
              className="px-8 py-4 bg-secondary text-on-secondary font-bold rounded-full pill-shadow-secondary bouncy-hover cursor-pointer shadow-md inline-block text-center"
            >
              Explore Agents
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full"
          >
            <div className="relative p-8 md:p-12 glass-card rounded-2xl border-dashed border-2 border-outline-variant min-h-[380px] flex items-center justify-center bg-surface-container-low/50 shadow-sm">
              <div className="text-center space-y-3 z-10 max-w-sm">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center mx-auto text-white shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-3xl">
                    hub
                  </span>
                </div>
                <h4 className="font-bold text-lg text-on-background">
                  Synchronous Core
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Real-time task routing between your autonomous life assistants
                </p>
              </div>

              {/* Floating Agent Pills */}
              <div className="absolute top-8 left-6 md:top-10 md:left-10 glass-card px-4 py-2.5 rounded-full border border-primary/30 flex items-center gap-2 animate-float shadow-md">
                <span
                  className="material-symbols-outlined text-primary text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  person_search
                </span>
                <span className="text-xs font-bold text-on-surface">
                  Researching...
                </span>
              </div>
              <div
                className="absolute bottom-8 right-6 md:bottom-12 md:right-10 glass-card px-4 py-2.5 rounded-full border border-tertiary/30 flex items-center gap-2 animate-float shadow-md"
                style={{ animationDelay: "-3s" }}
              >
                <span
                  className="material-symbols-outlined text-tertiary text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  edit_note
                </span>
                <span className="text-xs font-bold text-on-surface">
                  Drafting Reply
                </span>
              </div>
              <div
                className="absolute top-12 right-6 md:top-14 md:right-12 glass-card px-4 py-2.5 rounded-full border border-secondary/30 flex items-center gap-2 animate-float shadow-md"
                style={{ animationDelay: "-1.5s" }}
              >
                <span
                  className="material-symbols-outlined text-secondary text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  schedule
                </span>
                <span className="text-xs font-bold text-on-surface">
                  Optimizing Calendar
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

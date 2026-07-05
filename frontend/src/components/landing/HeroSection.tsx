"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="relative min-h-[90vh] flex items-center pt-12 overflow-hidden">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-sm pill-shadow-primary animate-pulse">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              auto_awesome
            </span>
            Introducing Aivora 2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-on-background leading-tight">
            Your Everyday AI Companion
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
            Stop juggling a dozen apps. Aivora connects your calendar, notes,
            tasks, and communications into a single, proactive intelligence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/auth"}
              className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full pill-shadow-primary bouncy-hover flex items-center gap-2 shadow-lg"
            >
              Get Started
            </Link>

            <a
              href="#workflow"
              className="px-8 py-4 bg-white dark:bg-surface-container-highest border-2 border-secondary text-secondary font-bold rounded-full bouncy-hover flex items-center gap-2 shadow-sm"
            >
              Watch Demo
            </a>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Diverse creative professional with glasses smiling"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoPBko3acDpZq5NrJfnPQhvfil6nQ4rH74YVGLO2WJv9pA5zeiEjhvG3bnFCWKJnIPR4u4tVuXUvWHOTF3ui_IBugKg9LuSDLlU_9FE9U3tfjFpLbF7qDZJWpPNo7dekGgjMwzgp-r3-rJh6oCEYnIrRQHKR5vOnPiLdlC2TEIFHhHWcImmC34wtO9KHsiSHK6XZM86-tnW1uKMX2eZpDjvT4vhLw1kjoIqhA4hUlO2sBW8skqLqywMQ"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Smiling man in a modern office setting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAov0sYbHXCTgxZ7gcKm49A3y0G3kdx5ia1v0dbqAgccogO82lEW2wIgWzWj6eRigkbFCsu8Sgoce4vw-rEofNc2RYbd04OVtD9syGcFUPzJxBdzKhZN341voRkCDi-oCql-rCcqqgI2JPxCvcGLsJV8bu2X6cR58UVo6jkyWwmTluraVUTEV1Cb1uOxhlU3E0MoZGfjyrBoLA6AN2TVTCfwDqVa0VcJgoOInp0PyJlXn4YyoBG0DiEUA"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                alt="Young energetic person laughing"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBce9BdPBLajTtxQHiVTosc9sOEVSE4B1WM5KBoUI6Xp9WkuzZb5F2T6YZLibZTx471Dg5dZmgDWFSdgAZepuI6P4_5E_Oa3YuXSi0dUROa9sJWvIhxZ-zDEgpGr-xmFp4XKRWRnYFxJQPYLtfYahjWVUMFWyQFHdef54wzOwC5bhmVLCYx0DETOepw_J_Zr50C3B3y0BXrCOGx6LA1fz-ZziVNvtLINGeDFodqIORrXOpi4a3yvWlHoQ"
              />
            </div>
            <span className="text-sm font-medium text-on-surface-variant">
              Trusted by 50,000+ early adopters
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative lg:h-[600px] flex justify-center items-center mt-8 lg:mt-0"
        >
          <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 animate-float">
            <div className="glass-card p-8 rounded-3xl shadow-2xl relative bg-gradient-to-b from-white/10 to-white/5 border border-white/20 backdrop-blur-2xl flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-xl -z-10 animate-pulse" style={{ animationDuration: "4s" }}></div>
              <img
                className="w-full max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                alt="Aivora - Your Everyday AI Companion Official Logo"
                src="/logo.png"
              />
              {/* Overlay Notification */}
              <div
                className="absolute -top-6 -right-6 md:-top-8 md:-right-8 glass-card p-4 rounded-xl pill-shadow-tertiary flex items-center gap-3 animate-float"
                style={{ animationDelay: "-2s" }}
              >
                <div className="bg-tertiary p-2 rounded-full text-white shadow-md">
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Rescheduled: Sync with Team
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    Optimized for your flow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

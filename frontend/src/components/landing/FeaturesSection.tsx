"use client";

import React from "react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-black text-on-background">
            How Aivora Works
          </h2>
          <p className="text-lg text-on-surface-variant">
            Aivora doesn&apos;t just store information; it understands context and
            takes action across your entire ecosystem.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          {/* Feature 1: The Brain */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass-card rounded-xl p-8 flex flex-col justify-between overflow-hidden relative group bouncy-hover cursor-default shadow-sm"
          >
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">
                psychology
              </span>
              <h3 className="text-2xl font-bold mb-2">Centralized Intelligence</h3>
              <p className="text-on-surface-variant max-w-sm">
                One unified brain that learns your preferences, project nuances,
                and relationship histories to serve you better every day.
              </p>
            </div>
            <div className="relative h-48 mt-8 rounded-xl overflow-hidden border border-outline-variant">
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                alt="Data visualization showing glowing interconnected nodes and neural networks"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAHk5x8JuQ7Ba2kR6S1sZdgHQQ2d6r77D0NfMbLPU1cBqOaab8H0e_Egj20SBehN0GWlJa2JFIVubLB6pdwFBMvftmPu-8mUX7JT9F2IxSX2xTR-IcDTeEtdCcEC41EfG896yuPdEvvsXvUMQO2NhytcqDHhVi7HqiQ5cROBxUpTg3T24fBAUA7lKk-LfOkRmiUU6nO3Ucc7tLcYDwQFh5VKwHIS7Y-rwSnykAHemn6GsZBHXTzTL9fQ"
              />
            </div>
          </motion.div>

          {/* Feature 2: Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-8 flex flex-col justify-center items-center text-center bg-secondary-container/30 border-secondary/20 bouncy-hover shadow-sm"
          >
            <div className="bg-secondary p-4 rounded-full text-white mb-6 pill-shadow-secondary">
              <span className="material-symbols-outlined text-3xl">
                verified_user
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
            <p className="text-sm text-on-surface-variant">
              Your data is encrypted end-to-end. We don&apos;t sell insights; we
              protect your focus.
            </p>
          </motion.div>

          {/* Feature 3: Automation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-8 flex flex-col justify-between bouncy-hover shadow-sm"
          >
            <div>
              <span className="material-symbols-outlined text-4xl text-tertiary mb-4">
                bolt
              </span>
              <h3 className="text-xl font-bold mb-2">Proactive Automation</h3>
              <p className="text-sm text-on-surface-variant">
                Aivora identifies upcoming conflicts and proposes solutions
                before you even see the problem.
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider">
                Syncing
              </span>
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider">
                Drafting
              </span>
            </div>
          </motion.div>

          {/* Feature 4: Voice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass-card rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 bouncy-hover shadow-sm"
          >
            <div className="flex-1">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">
                mic
              </span>
              <h3 className="text-2xl font-bold mb-2">Seamless Voice Control</h3>
              <p className="text-on-surface-variant">
                Chat with Aivora naturally. &quot;Remind me to call Sam when I&apos;m near
                the grocery store&quot; just works.
              </p>
            </div>
            <div className="flex-1 w-full h-32 md:h-full bg-white rounded-xl flex items-center justify-center border border-outline-variant shadow-inner">
              <div className="flex gap-1.5 items-end h-12">
                <div
                  className="w-1.5 bg-primary rounded-full animate-bounce"
                  style={{ height: "60%", animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ height: "100%", animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 bg-tertiary rounded-full animate-bounce"
                  style={{ height: "40%", animationDelay: "0.3s" }}
                ></div>
                <div
                  className="w-1.5 bg-primary rounded-full animate-bounce"
                  style={{ height: "80%", animationDelay: "0.4s" }}
                ></div>
                <div
                  className="w-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ height: "50%", animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

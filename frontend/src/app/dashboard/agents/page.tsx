"use client";

import React from "react";
import { motion } from "framer-motion";

const agents = [
  { id: "planner", name: "Planner Agent", icon: "assignment", color: "from-primary to-primary/70", desc: "Orchestrates multi-step logic" },
  { id: "travel", name: "Travel Agent", icon: "flight_takeoff", color: "from-secondary to-secondary/70", desc: "Searches and books flights" },
  { id: "weather", name: "Weather Agent", icon: "partly_cloudy_day", color: "from-tertiary to-tertiary/70", desc: "Checks climate and forecasts" },
  { id: "budget", name: "Budget Agent", icon: "account_balance_wallet", color: "from-green-500 to-emerald-400", desc: "Manages costs and constraints" },
  { id: "shopping", name: "Shopping Agent", icon: "shopping_bag", color: "from-orange-500 to-amber-400", desc: "Finds products and gear" },
  { id: "critic", name: "Critic Agent", icon: "fact_check", color: "from-red-500 to-rose-400", desc: "Evaluates plans against rules" },
  { id: "packing", name: "Packing Agent", icon: "work", color: "from-indigo-500 to-blue-400", desc: "Generates packing lists" },
  { id: "scheduler", name: "Scheduler Agent", icon: "calendar_month", color: "from-purple-500 to-fuchsia-400", desc: "Syncs with Google Calendar" },
  { id: "storage", name: "Storage Agent", icon: "cloud_sync", color: "from-cyan-500 to-teal-400", desc: "Persists outputs to GCS" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function AgentsConsolePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12 text-center md:text-left space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-on-background">
          Multi-Agent <span className="text-primary">Configuration</span> Console
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          Aivora relies on a network of specialized autonomous sub-agents working in parallel. 
          Here is a real-time view of your active agent fleet and their responsibilities.
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center mb-16">
        {/* Coordinator Node */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 bg-surface-container-high border-2 border-outline/30 shadow-2xl rounded-3xl p-8 flex flex-col items-center text-center max-w-sm w-full mb-12 glass-card relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl -z-10" />
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white mb-4 animate-pulse shadow-lg">
            <span className="material-symbols-outlined text-4xl">hub</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Coordinator Agent</h2>
          <p className="text-sm text-on-surface-variant">
            The Master Router. It parses your natural language input, parallelizes tasks, and synthesizes the final output.
          </p>
        </motion.div>

        {/* Sub-Agents Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {agents.map((agent) => (
            <motion.div 
              key={agent.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className="glass-card bg-surface p-6 rounded-2xl border border-outline-variant hover:border-outline transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-inner`}>
                  <span className="material-symbols-outlined">{agent.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <span className="text-xs px-2 py-1 bg-surface-variant text-on-surface-variant rounded text-[10px] uppercase font-bold tracking-wider">
                    Task Mode
                  </span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant flex-grow">
                {agent.desc}
              </p>
              
              <div className="mt-4 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
                <span className="text-xs text-on-surface-variant/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active / Idle
                </span>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">settings</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

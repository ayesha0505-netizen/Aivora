"use client";

import React, { useState } from "react";

export interface NotebookPage {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  wordCount?: number;
}

export interface NotebookDocument {
  id: string;
  title: string;
  folder: string;
  tags: string[];
  coverTheme: string;
  lastEdited: string;
  favorite: boolean;
  sourcesCount: number;
  pages: NotebookPage[];
}

interface CoverThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  spineClass: string;
  elasticClass: string;
  textClass: string;
  badgeClass: string;
  accentIcon: string;
  patternType: "floral" | "waves" | "starry" | "geometric" | "boho" | "snow" | "autumn" | "confetti" | "minimal" | "cyber" | "botanical" | "sunset" | "lace" | "dreamcatcher" | "vintage";
}

const COVER_THEMES: CoverThemeConfig[] = [
  {
    id: "floral-garden",
    name: "Floral Garden",
    bgClass: "bg-gradient-to-br from-[#FFF9F5] via-[#FFF2EB] to-[#FDE8E0]",
    spineClass: "bg-gradient-to-b from-pink-500 to-rose-600",
    elasticClass: "bg-rose-500/80 shadow-rose-900/30",
    textClass: "text-rose-950",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    accentIcon: "local_florist",
    patternType: "floral",
  },
  {
    id: "tea-time",
    name: "Pastel Tea Time",
    bgClass: "bg-gradient-to-br from-[#EBF9F5] via-[#E2F6F0] to-[#D5EFE7]",
    spineClass: "bg-gradient-to-b from-emerald-400 to-teal-600",
    elasticClass: "bg-teal-600/80 shadow-teal-900/30",
    textClass: "text-teal-950",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-200",
    accentIcon: "cake",
    patternType: "confetti",
  },
  {
    id: "tropical-leaves",
    name: "Tropical Leaves",
    bgClass: "bg-gradient-to-br from-[#FEEAE0] via-[#FCE0D2] to-[#FAD4C0]",
    spineClass: "bg-gradient-to-b from-slate-800 to-navy-900 bg-[#0F172A]",
    elasticClass: "bg-orange-500/90 shadow-orange-950/40",
    textClass: "text-slate-900",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
    accentIcon: "park",
    patternType: "botanical",
  },
  {
    id: "boho-flower",
    name: "Bohemian Terracotta",
    bgClass: "bg-gradient-to-br from-[#FDF3EB] via-[#F8EBE0] to-[#F2DFD1]",
    spineClass: "bg-gradient-to-b from-amber-700 to-orange-800",
    elasticClass: "bg-amber-800/80 shadow-amber-950/40",
    textClass: "text-amber-950",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
    accentIcon: "wb_sunny",
    patternType: "boho",
  },
  {
    id: "winter-botanical",
    name: "Winter Botanical",
    bgClass: "bg-gradient-to-br from-[#F7F9FB] via-[#EFF4F8] to-[#E3ECEF]",
    spineClass: "bg-gradient-to-b from-blue-700 to-slate-800",
    elasticClass: "bg-blue-900/80 shadow-blue-950/40",
    textClass: "text-slate-900",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
    accentIcon: "ac_unit",
    patternType: "botanical",
  },
  {
    id: "peach-waves",
    name: "Peach Waves",
    bgClass: "bg-gradient-to-br from-[#FFEBE6] via-[#FFDFD6] to-[#FFD0C2]",
    spineClass: "bg-gradient-to-b from-coral-500 to-orange-600 bg-[#F97316]",
    elasticClass: "bg-orange-600/80 shadow-orange-950/30",
    textClass: "text-orange-950",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
    accentIcon: "waves",
    patternType: "waves",
  },
  {
    id: "pink-sunburst",
    name: "Pink Sunburst",
    bgClass: "bg-gradient-to-br from-[#FCE8F0] via-[#F9D6E4] to-[#F5C2D6]",
    spineClass: "bg-gradient-to-b from-purple-700 to-pink-800",
    elasticClass: "bg-purple-900/80 shadow-purple-950/40",
    textClass: "text-purple-950",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
    accentIcon: "filter_vintage",
    patternType: "boho",
  },
  {
    id: "blue-waves",
    name: "Ocean Japanese Waves",
    bgClass: "bg-gradient-to-br from-[#EAF6FF] via-[#D8EEFF] to-[#C4E4FF]",
    spineClass: "bg-gradient-to-b from-cyan-600 to-blue-800",
    elasticClass: "bg-blue-700/80 shadow-blue-950/40",
    textClass: "text-blue-950",
    badgeClass: "bg-cyan-100 text-cyan-900 border-cyan-200",
    accentIcon: "tsunami",
    patternType: "waves",
  },
  {
    id: "dark-starry",
    name: "Midnight Starry",
    bgClass: "bg-gradient-to-br from-[#1E1933] via-[#151226] to-[#0D0B1A]",
    spineClass: "bg-gradient-to-b from-purple-500 via-indigo-600 to-pink-500",
    elasticClass: "bg-amber-400/90 shadow-black/60",
    textClass: "text-white",
    badgeClass: "bg-purple-900/80 text-purple-200 border-purple-700",
    accentIcon: "auto_awesome",
    patternType: "starry",
  },
  {
    id: "winter-snow",
    name: "Crystal Snowflakes",
    bgClass: "bg-gradient-to-br from-[#E8F4F8] via-[#DCEEF5] to-[#CEE7F0]",
    spineClass: "bg-gradient-to-b from-sky-500 to-blue-600",
    elasticClass: "bg-white/90 shadow-blue-950/30",
    textClass: "text-sky-950",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
    accentIcon: "cloud_snowing",
    patternType: "snow",
  },
  {
    id: "autumn-burgundy",
    name: "Autumn Burgundy",
    bgClass: "bg-gradient-to-br from-[#4A1525] via-[#3A0F1B] to-[#2B0A13]",
    spineClass: "bg-gradient-to-b from-amber-500 to-yellow-600",
    elasticClass: "bg-amber-500/80 shadow-black/60",
    textClass: "text-white",
    badgeClass: "bg-rose-950 text-amber-200 border-amber-700/50",
    accentIcon: "eco",
    patternType: "autumn",
  },
  {
    id: "boho-lace",
    name: "Bohemian Lace",
    bgClass: "bg-gradient-to-br from-[#FFF5F5] via-[#FDE8E8] to-[#FBD5D5]",
    spineClass: "bg-gradient-to-b from-rose-400 to-red-500",
    elasticClass: "bg-rose-600/80 shadow-rose-950/30",
    textClass: "text-rose-950",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    accentIcon: "style",
    patternType: "lace",
  },
  {
    id: "retro-confetti",
    name: "Mustard Retro",
    bgClass: "bg-gradient-to-br from-[#FFF6D6] via-[#FFEEBA] to-[#FFE59E]",
    spineClass: "bg-gradient-to-b from-red-600 to-amber-700",
    elasticClass: "bg-slate-900/80 shadow-black/30",
    textClass: "text-amber-950",
    badgeClass: "bg-amber-200 text-amber-900 border-amber-300",
    accentIcon: "celebration",
    patternType: "confetti",
  },
  {
    id: "purple-dream",
    name: "Lavender Dreamcatcher",
    bgClass: "bg-gradient-to-br from-[#F3EFEF] via-[#EAE2EE] to-[#E0D5E7]",
    spineClass: "bg-gradient-to-b from-purple-500 to-indigo-600",
    elasticClass: "bg-indigo-700/80 shadow-indigo-950/30",
    textClass: "text-purple-950",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-200",
    accentIcon: "bedtime",
    patternType: "dreamcatcher",
  },
  {
    id: "botanical-vines",
    name: "Emerald Botanicals",
    bgClass: "bg-gradient-to-br from-[#E8F0EA] via-[#D8E6DB] to-[#C7DCCD]",
    spineClass: "bg-gradient-to-b from-emerald-700 to-green-900",
    elasticClass: "bg-emerald-900/80 shadow-emerald-950/40",
    textClass: "text-emerald-950",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
    accentIcon: "grass",
    patternType: "botanical",
  },
];

// Decorative Background Patterns for Covers
function CoverPattern({ type, icon }: { type: string; icon: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
      <span className="material-symbols-outlined text-[80px] absolute -bottom-4 -right-4 opacity-15 rotate-12 select-none">
        {icon}
      </span>
      {type === "starry" && (
        <div className="absolute inset-0">
          <span className="absolute top-4 right-8 text-yellow-300 text-2xl animate-pulse">★</span>
          <span className="absolute top-1/3 left-8 text-purple-300 text-xl">✦</span>
          <span className="absolute bottom-12 right-12 text-pink-300 text-lg">★</span>
          <span className="absolute bottom-6 left-1/3 text-white text-sm">✦</span>
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-purple-500/20 blur-xl"></div>
        </div>
      )}
      {type === "floral" && (
        <div className="absolute inset-0 flex flex-wrap justify-around items-center p-6 gap-6">
          <span className="material-symbols-outlined text-4xl -rotate-12">local_florist</span>
          <span className="material-symbols-outlined text-5xl rotate-45">filter_vintage</span>
          <span className="material-symbols-outlined text-3xl rotate-12">yard</span>
          <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full border-4 border-dashed border-current opacity-30"></div>
        </div>
      )}
      {type === "waves" && (
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="h-16 w-full bg-gradient-to-b from-current/10 to-transparent"></div>
          <div className="flex justify-around items-end pb-4">
            <span className="material-symbols-outlined text-6xl">tsunami</span>
            <span className="material-symbols-outlined text-4xl -scale-x-100">waves</span>
          </div>
        </div>
      )}
      {type === "snow" && (
        <div className="absolute inset-0 flex flex-wrap justify-around p-4">
          <span className="material-symbols-outlined text-4xl">ac_unit</span>
          <span className="material-symbols-outlined text-2xl mt-12">cloud_snowing</span>
          <span className="material-symbols-outlined text-5xl mb-8">ac_unit</span>
          <span className="material-symbols-outlined text-3xl">severe_cold</span>
        </div>
      )}
      {type === "autumn" && (
        <div className="absolute inset-0 flex flex-wrap justify-around p-6">
          <span className="material-symbols-outlined text-5xl rotate-45">eco</span>
          <span className="material-symbols-outlined text-3xl -rotate-12 mt-16">forest</span>
          <span className="material-symbols-outlined text-4xl rotate-90">eco</span>
        </div>
      )}
      {type === "confetti" && (
        <div className="absolute inset-0 flex flex-wrap justify-around items-center p-4">
          <div className="w-4 h-4 rounded-full bg-current"></div>
          <div className="w-6 h-6 rotate-45 border-2 border-current"></div>
          <span className="material-symbols-outlined text-4xl">celebration</span>
          <div className="w-3 h-8 bg-current rotate-12 rounded-full"></div>
        </div>
      )}
      {type === "botanical" && (
        <div className="absolute inset-0 flex flex-wrap justify-between p-6">
          <span className="material-symbols-outlined text-5xl -rotate-45">park</span>
          <span className="material-symbols-outlined text-4xl mt-20">grass</span>
          <span className="material-symbols-outlined text-6xl rotate-12">eco</span>
        </div>
      )}
      {type === "boho" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-dashed border-current opacity-20 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-current opacity-30"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AivoraNotes() {
  const [folders] = useState<string[]>([
    "All Notebooks",
    "AI Research",
    "Personal Projects",
    "Meeting Minutes",
    "Travel Plans",
    "Study Notes",
    "Favorites",
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string>("All Notebooks");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Search inside opened notebook
  const [pageSearchQuery, setPageSearchQuery] = useState<string>("");

  // View Mode: 'grid' (Notebooks Cover Grid) or 'full_notebook' (Opened Workspace)
  const [viewMode, setViewMode] = useState<"grid" | "full_notebook">("grid");

  // Initial 12 Rich Notebooks with diverse Digital Planner Cover Themes
  const [notebooks, setNotebooks] = useState<NotebookDocument[]>([
    {
      id: "nb-1",
      title: "Next-Gen Autonomous Agent Architectures",
      folder: "AI Research",
      tags: ["#LLM", "#agents", "#deepmind"],
      coverTheme: "dark-starry",
      lastEdited: "10 mins ago",
      favorite: true,
      sourcesCount: 13,
      pages: [
        {
          id: "pg-1-1",
          title: "Executive Summary & Core Pillars",
          lastEdited: "10 mins ago",
          content:
            "# Next-Gen Autonomous Agent Architectures\n\n## 1. Executive Summary\nModern agentic workflows rely on iterative reflection and hierarchical task decomposition. By combining tool-use capabilities with structured memory banks, agents can solve long-horizon coding tasks without human intervention.\n\n### Key Architectural Pillars:\n- **Reactive Wakeup:** No polling loops required; event-driven system wakeups reduce latency.\n- **Subagent Orchestration:** Delegating deep research tasks to specialized read-only subagents preserves context window efficiency.\n- **Structured Tool Definitions:** Clean JSON schemas with strict argument checking.\n\n> *Note: Always prioritize using the most specific tool available for the task at hand.*",
        },
        {
          id: "pg-1-2",
          title: "Reactive Wakeup & Event-Driven Systems",
          lastEdited: "1 hour ago",
          content:
            "# Reactive Wakeup Mechanics\n\nInstead of wasting tokens on polling loops (`while True: check_status()`), high-performance agents rely on reactive event triggers.\n\n```python\n# Event callback architecture\ndef on_subagent_complete(message):\n    context.append(message)\n    agent.resume_execution()\n```\n\nThis saves over 40% in compute latency during complex multi-step builds.",
        },
        {
          id: "pg-1-3",
          title: "Subagent Orchestration & Memory Banks",
          lastEdited: "Yesterday",
          content:
            "# Subagent Delegation Strategies\n\nWhen exploring large codebases (>500k LOC), launching a specialized `researcher` subagent ensures that the primary planning agent's context window remains uncluttered.\n\n## Best Practices:\n1. Provide unambiguous prompt instructions.\n2. Request structured markdown summary artifacts.\n3. Avoid redundant concurrent subagent calls for overlapping domains.",
        },
      ],
    },
    {
      id: "nb-2",
      title: "Paris 2026 Itinerary & Restaurant Reservations",
      folder: "Travel Plans",
      tags: ["#travel", "#paris", "#vacation"],
      coverTheme: "boho-flower",
      lastEdited: "Yesterday",
      favorite: true,
      sourcesCount: 4,
      pages: [
        {
          id: "pg-2-1",
          title: "7-Day Master Itinerary",
          lastEdited: "Yesterday",
          content:
            "# Paris 2026: 7-Day Master Itinerary\n\n## Day 1: Arrival & Le Marais\n- Morning: Arrive at CDG, check into boutique hotel near Place des Vosges.\n- Afternoon: Stroll through coffee shops (Carette, Ob-La-Di).\n- Evening: Welcome dinner at Le George.\n\n## Day 2: Louvre & Seine River Cruise\n- 9:30 AM: VIP skip-the-line entrance to Louvre Museum.\n- 3:00 PM: Tuileries Garden relaxation.\n- 7:30 PM: Sunset boat tour along the Seine.",
        },
        {
          id: "pg-2-2",
          title: "Restaurant & Cafe Bucket List",
          lastEdited: "2 days ago",
          content:
            "# Must-Visit Dining & Bistros\n\n- **Septime:** Michelin-starred neo-bistro (reservation booked for Wed 8 PM).\n- **L'As du Fallafel:** Best street food in Le Marais.\n- **Du Pain et des Idées:** Pistachio escargot pastries every morning!\n- **Le Chateaubriand:** Tasting menu experience.",
        },
      ],
    },
    {
      id: "nb-3",
      title: "Q3 Product Engineering Weekly Sync",
      folder: "Meeting Minutes",
      tags: ["#work", "#sync", "#q3"],
      coverTheme: "blue-waves",
      lastEdited: "Jul 2",
      favorite: false,
      sourcesCount: 8,
      pages: [
        {
          id: "pg-3-1",
          title: "July Week 1 Sync Notes",
          lastEdited: "Jul 2",
          content:
            "# Weekly Engineering Sync - July 2026\n\n**Attendees:** Alex, Elena, Marcus, Sarah\n\n## Action Items:\n1. [ ] Finalize UI color tokens for dark mode theme.\n2. [x] Optimize WebSocket reconnection strategy for real-time reminders.\n3. [ ] Prepare staging environment for client demo on Friday.\n\n## Discussion Notes:\n- Latency dropped by 35% after migrating prompt caching to edge nodes.\n- Aivora Weather widget received overwhelmingly positive user feedback during beta testing!",
        },
        {
          id: "pg-3-2",
          title: "Sprint Goal Tracker",
          lastEdited: "Jun 30",
          content:
            "# Sprint 24 Goals\n\n- Deliver Notebooks Gallery View with digital planner cover aesthetics.\n- Ensure 100% responsiveness across mobile, tablet, and widescreen.\n- Zero high-priority lint errors.",
        },
      ],
    },
    {
      id: "nb-4",
      title: "Synthesizers & Modular Audio Setup",
      folder: "Personal Projects",
      tags: ["#music", "#synth", "#hobby"],
      coverTheme: "retro-confetti",
      lastEdited: "Jun 28",
      favorite: false,
      sourcesCount: 6,
      pages: [
        {
          id: "pg-4-1",
          title: "Eurorack Modular Synth Dream Rig",
          lastEdited: "Jun 28",
          content:
            "# Eurorack Modular Synth Dream Rig\n\n## Essential Modules to Acquire:\n- **Make Noise Maths:** Dual analog control voltage generator.\n- **Intellijel Morgasmatron:** Dual state-variable filter with analog saturation.\n- **Mutable Instruments Beads:** Granular texture synthesizer for ambient soundscapes.\n\n*Next step:* Build custom wooden 6U case over the weekend.",
        },
      ],
    },
    {
      id: "nb-5",
      title: "Mastering the Modern HTML & Web Roadmap",
      folder: "Study Notes",
      tags: ["#html", "#web", "#frontend"],
      coverTheme: "floral-garden",
      lastEdited: "3 days ago",
      favorite: true,
      sourcesCount: 15,
      pages: [
        {
          id: "pg-5-1",
          title: "Semantic HTML5 & Accessibility",
          lastEdited: "3 days ago",
          content:
            "# Semantic HTML5 & Accessibility Mastery\n\nProper HTML structure forms the bedrock of accessible web applications.\n\n## Core Principles:\n- Use `<header>`, `<main>`, `<aside>`, and `<footer>` instead of generic `<div>` soup.\n- Always associate labels with inputs using `htmlFor` or nesting.\n- Maintain logical heading hierarchy (`<h1>` down to `<h6>`).",
        },
        {
          id: "pg-5-2",
          title: "Modern CSS Grid & Flexbox Patterns",
          lastEdited: "4 days ago",
          content:
            "# Layout Architectures\n\nCombining CSS Grid for macro layouts and Flexbox for component alignment gives maximum responsiveness without media query clutter.",
        },
      ],
    },
    {
      id: "nb-6",
      title: "Fundamentals of Managerial Economics",
      folder: "Study Notes",
      tags: ["#finance", "#economics", "#mba"],
      coverTheme: "autumn-burgundy",
      lastEdited: "5 days ago",
      favorite: false,
      sourcesCount: 31,
      pages: [
        {
          id: "pg-6-1",
          title: "Supply, Demand & Equilibrium Analysis",
          lastEdited: "5 days ago",
          content:
            "# Microeconomics Essentials\n\nUnderstanding price elasticity of demand allows firms to optimize revenue structures during inflationary cycles.\n\n$$\nE_d = \\frac{\\% \\Delta Q_d}{\\% \\Delta P}\n$$\n\nWhen $|E_d| > 1$, demand is elastic and price reductions increase total revenue.",
        },
      ],
    },
    {
      id: "nb-7",
      title: "Building Ambient AI Expense Agents",
      folder: "AI Research",
      tags: ["#fintech", "#agents", "#ocr"],
      coverTheme: "tropical-leaves",
      lastEdited: "Jun 25",
      favorite: true,
      sourcesCount: 9,
      pages: [
        {
          id: "pg-7-1",
          title: "Receipt OCR & Information Extraction",
          lastEdited: "Jun 25",
          content:
            "# Ambient Financial Intelligence\n\nBy running multimodal vision models on user receipt photos, Aivora can automatically parse merchant names, line items, taxes, and dates into structured budget entries.",
        },
      ],
    },
    {
      id: "nb-8",
      title: "Software Engineering Revision Essentials",
      folder: "Study Notes",
      tags: ["#algorithms", "#cs", "#interview"],
      coverTheme: "winter-snow",
      lastEdited: "Jun 20",
      favorite: false,
      sourcesCount: 12,
      pages: [
        {
          id: "pg-8-1",
          title: "System Design & Scalability Principles",
          lastEdited: "Jun 20",
          content:
            "# Scaled Distributed Systems\n\n## Caching Layers:\n- **Redis / Memcached:** In-memory key-value stores for hot database queries.\n- **CDN Edge Workers:** Caching static assets and API responses close to end users.",
        },
      ],
    },
    {
      id: "nb-9",
      title: "Digital Planner & Weekly Goal Tracker",
      folder: "Personal Projects",
      tags: ["#habits", "#goals", "#planner"],
      coverTheme: "tea-time",
      lastEdited: "Jun 18",
      favorite: true,
      sourcesCount: 10,
      pages: [
        {
          id: "pg-9-1",
          title: "Weekly Habit & Workout Log",
          lastEdited: "Jun 18",
          content:
            "# Weekly Fitness & Habit Tracker\n\n- [x] Monday: 5km Morning Run & Core Workout\n- [x] Tuesday: Upper Body Strength Training\n- [x] Wednesday: Yoga & Meditation Session\n- [ ] Thursday: High Intensity Interval Training\n- [ ] Friday: Active Recovery Walk",
        },
      ],
    },
    {
      id: "nb-10",
      title: "Tokyo 2026 Autumn Leaf Excursion",
      folder: "Travel Plans",
      tags: ["#japan", "#tokyo", "#autumn"],
      coverTheme: "peach-waves",
      lastEdited: "Jun 15",
      favorite: false,
      sourcesCount: 14,
      pages: [
        {
          id: "pg-10-1",
          title: "Kyoto & Tokyo Train Schedules",
          lastEdited: "Jun 15",
          content:
            "# Shinkansen & Subway Guide\n\n- Book JR Pass 30 days in advance.\n- Take the Nozomi bullet train from Tokyo Station to Kyoto (approx 2h 15m).\n- Best viewing spots for Momiji (autumn leaves): Arashiyama Bamboo Grove and Kiyomizu-dera.",
        },
      ],
    },
    {
      id: "nb-11",
      title: "Deep Learning & Transformers Mathematics",
      folder: "AI Research",
      tags: ["#math", "#transformers", "#ml"],
      coverTheme: "purple-dream",
      lastEdited: "Jun 12",
      favorite: false,
      sourcesCount: 18,
      pages: [
        {
          id: "pg-11-1",
          title: "Attention Mechanism Mathematics",
          lastEdited: "Jun 12",
          content:
            "# Scaled Dot-Product Attention\n\nThe fundamental equation powering modern Large Language Models:\n\n$$\n\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V\n$$\n\nWhere $Q$, $K$, and $V$ represent the query, key, and value projection matrices respectively.",
        },
      ],
    },
    {
      id: "nb-12",
      title: "Bohemian Interior Design & Mood Board",
      folder: "Personal Projects",
      tags: ["#design", "#home", "#decor"],
      coverTheme: "boho-lace",
      lastEdited: "Jun 10",
      favorite: false,
      sourcesCount: 7,
      pages: [
        {
          id: "pg-12-1",
          title: "Living Room Color Palette & Fabrics",
          lastEdited: "Jun 10",
          content:
            "# Boho Living Room Mood Board\n\n## Color Palette:\n- Terracotta Rust (`#C85A32`)\n- Warm Cream (`#FDF8F5`)\n- Sage Green (`#8BA888`)\n- Natural Rattan & Oak textures\n\n## Shopping List:\n- [x] Macramé wall hanging from artisan market\n- [ ] Velvet accent armchair in emerald green\n- [ ] Jute area rug (8x10 ft)",
        },
      ],
    },
  ]);

  // Active state for opened notebook
  const [activeNotebookId, setActiveNotebookId] = useState<string>("nb-1");
  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];

  // Active page inside the opened notebook
  const [activePageId, setActivePageId] = useState<string>(
    activeNotebook?.pages[0]?.id || "pg-1-1"
  );
  const activePage =
    activeNotebook?.pages.find((p) => p.id === activePageId) ||
    activeNotebook?.pages[0] || {
      id: "empty",
      title: "Untitled Page",
      content: "",
      lastEdited: "Just now",
    };

  // THE CRITICAL REQUIREMENT: Side Tab closing and opening all time
  const [isSideTabOpen, setIsSideTabOpen] = useState<boolean>(true);

  // Modal and AI states
  const [newModalOpen, setNewModalOpen] = useState<boolean>(false);
  const [newNbTitle, setNewNbTitle] = useState<string>("");
  const [newNbFolder, setNewNbFolder] = useState<string>("Personal Projects");
  const [newNbTheme, setNewNbTheme] = useState<string>("floral-garden");

  const [aiMenuOpen, setAiMenuOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("Saved to cloud");

  // Handler: Open full notebook from grid
  const handleOpenNotebook = (nbId: string) => {
    setActiveNotebookId(nbId);
    const targetNb = notebooks.find((n) => n.id === nbId);
    if (targetNb && targetNb.pages.length > 0) {
      setActivePageId(targetNb.pages[0].id);
    }
    setPageSearchQuery("");
    setViewMode("full_notebook");
    setIsSideTabOpen(true);
  };

  // Handler: Create new notebook
  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    const titleToUse = newNbTitle.trim() || "Untitled Planner & Notebook";
    const newNb: NotebookDocument = {
      id: "nb-" + Date.now(),
      title: titleToUse,
      folder: newNbFolder,
      tags: ["#new", "#notebook"],
      coverTheme: newNbTheme,
      lastEdited: "Just now",
      favorite: false,
      sourcesCount: 1,
      pages: [
        {
          id: "pg-" + Date.now(),
          title: "Chapter 1: Overview & Ideas",
          lastEdited: "Just now",
          content: `# ${titleToUse}\n\nWelcome to your new Aivora digital planner & notebook! Start typing your notes, sketches, or structured outlines here...`,
        },
      ],
    };

    setNotebooks([newNb, ...notebooks]);
    setNewModalOpen(false);
    setNewNbTitle("");
    handleOpenNotebook(newNb.id);
  };

  // Handler: Add new page to active notebook
  const handleAddPage = () => {
    const newPage: NotebookPage = {
      id: "pg-" + Date.now(),
      title: `Page ${activeNotebook.pages.length + 1}: Untitled Section`,
      lastEdited: "Just now",
      content: `# Untitled Section\n\nAdd your notes or paste sources here...`,
    };

    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === activeNotebookId
          ? {
              ...nb,
              sourcesCount: nb.sourcesCount + 1,
              lastEdited: "Just now",
              pages: [...nb.pages, newPage],
            }
          : nb
      )
    );
    setActivePageId(newPage.id);
  };

  // Handler: Delete a section/page
  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeNotebook.pages.length <= 1) {
      alert("A notebook must have at least one page/chapter!");
      return;
    }
    if (confirm("Delete this chapter/section?")) {
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebookId
            ? {
                ...nb,
                sourcesCount: Math.max(1, nb.sourcesCount - 1),
                lastEdited: "Just now",
                pages: nb.pages.filter((p) => p.id !== pageId),
              }
            : nb
        )
      );
      if (activePageId === pageId) {
        const remaining = activeNotebook.pages.filter((p) => p.id !== pageId);
        if (remaining.length > 0) setActivePageId(remaining[0].id);
      }
    }
  };

  // Handler: Update active page content
  const handleUpdatePageContent = (newText: string) => {
    setSaveStatus("Saving...");
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === activeNotebookId
          ? {
              ...nb,
              lastEdited: "Just now",
              pages: nb.pages.map((pg) =>
                pg.id === activePageId ? { ...pg, content: newText, lastEdited: "Just now" } : pg
              ),
            }
          : nb
      )
    );
    setTimeout(() => setSaveStatus("Saved to cloud"), 800);
  };

  // Handler: Update active page title
  const handleUpdatePageTitle = (newTitle: string) => {
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === activeNotebookId
          ? {
              ...nb,
              lastEdited: "Just now",
              pages: nb.pages.map((pg) =>
                pg.id === activePageId ? { ...pg, title: newTitle, lastEdited: "Just now" } : pg
              ),
            }
          : nb
      )
    );
  };

  // Handler: Formatting Toolbar Action Button Click
  const handleFormat = (type: string) => {
    let insertion = "";
    if (type === "H1") insertion = "# Heading 1\n";
    else if (type === "H2") insertion = "## Heading 2\n";
    else if (type === "bold") insertion = "**bold text**";
    else if (type === "italic") insertion = "*italic text*";
    else if (type === "strikethrough") insertion = "~~strikethrough~~";
    else if (type === "bullet") insertion = "\n- Bullet item";
    else if (type === "numbered") insertion = "\n1. Numbered item";
    else if (type === "checkbox") insertion = "\n- [ ] Task item";
    else if (type === "code") insertion = "\n```\ncode block\n```\n";
    else if (type === "quote") insertion = "\n> Blockquote\n";
    else if (type === "link") insertion = "[Link Title](https://example.com)";

    const sep = activePage.content.endsWith("\n") || activePage.content === "" ? "" : "\n";
    handleUpdatePageContent(activePage.content + sep + insertion);
  };

  // Handler: Delete notebook
  const handleDeleteNotebook = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure you want to delete this notebook?")) {
      const filtered = notebooks.filter((n) => n.id !== id);
      setNotebooks(filtered);
      if (activeNotebookId === id && filtered.length > 0) {
        setActiveNotebookId(filtered[0].id);
      }
      if (filtered.length === 0) {
        setViewMode("grid");
      }
    }
  };

  // Handler: Toggle favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotebooks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n))
    );
  };

  // Handler: Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (confirm(`Remove tag "${tagToRemove}"?`)) {
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebookId
            ? { ...nb, tags: nb.tags.filter((t) => t !== tagToRemove) }
            : nb
        )
      );
    }
  };

  // Handler: AI Actions
  const triggerAiAction = (actionType: string) => {
    setAiMenuOpen(false);
    setSaveStatus("AI generating...");

    setTimeout(() => {
      let appendText = "";
      if (actionType === "summarize") {
        appendText = `\n\n---\n**✨ Aivora AI Study Summary:**\n- Synthesized key insights from "${activePage.title}".\n- Highlighted 3 critical takeaways for rapid revision.\n- Recommended next step: Review practice problems or related sources.`;
      } else if (actionType === "action_items") {
        appendText = `\n\n---\n**📋 AI Extracted Action Checklist:**\n- [ ] Review document formatting and headers.\n- [ ] Share notebook outline with peers.\n- [ ] Schedule follow-up revision session for next week.`;
      } else if (actionType === "translate") {
        appendText = `\n\n---\n**🌐 Traduction Française (Aivora AI):**\nVoici une vue d'ensemble élégante et structurée de votre chapitre. Les concepts clés ont été traduits en conservant la précision technique et le style académique.`;
      } else if (actionType === "quiz") {
        appendText = `\n\n---\n**🧠 AI Self-Test Quiz:**\n1. What is the primary advantage of event-driven reactive wakeups over polling loops?\n2. Explain how subagent delegation optimizes token context window efficiency.\n*(Click or hover to reveal solutions in your Aivora companion)*`;
      }
      handleUpdatePageContent(activePage.content + appendText);
    }, 600);
  };

  // Filter notebooks for Grid View
  const filteredNotebooks = notebooks.filter((nb) => {
    const matchesFolder =
      selectedFolder === "All Notebooks" ||
      (selectedFolder === "Favorites" && nb.favorite) ||
      nb.folder === selectedFolder;
    const matchesSearch =
      nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      nb.pages.some((p) => p.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  // Filter pages inside the active notebook
  const filteredPages = activeNotebook.pages.filter(
    (pg) =>
      pg.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      pg.content.toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  const wordCount = activePage.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = activePage.content.length;
  const activeThemeConfig =
    COVER_THEMES.find((t) => t.id === activeNotebook?.coverTheme) || COVER_THEMES[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)] bg-background text-on-background relative overflow-hidden">
      {/* =========================================================================
          MODE 1: NOTEBOOKS & DIGITAL PLANNER COVERS GRID VIEW (The Studio)
          ========================================================================= */}
      {viewMode === "grid" && (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
          {/* Top Banner Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="material-symbols-outlined text-primary text-3xl font-black pink-glow">
                  auto_stories
                </span>
                <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Digital Planner Studio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-black text-on-surface tracking-tight">
                My Notebooks & Planners
              </h1>
              <p className="text-sm font-body text-on-surface-variant/80 mt-1">
                Click any digital planner cover to open the full interactive notebook workspace.
              </p>
            </div>

            {/* Action Buttons & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-base">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search notebooks, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-surface-variant/40 border border-outline-variant/20 text-xs font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface-variant/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => setNewModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-pink-500 text-white rounded-2xl font-bold text-xs shadow-lg pink-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Create New Notebook</span>
              </button>
            </div>
          </div>

          {/* Folder Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {folders.map((folder) => {
              const isSelected = selectedFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-variant/60 border border-outline-variant/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {folder === "Favorites" ? "star" : folder === "All Notebooks" ? "grid_view" : "folder"}
                  </span>
                  <span>{folder}</span>
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-mono">
                    {folder === "All Notebooks"
                      ? notebooks.length
                      : folder === "Favorites"
                      ? notebooks.filter((n) => n.favorite).length
                      : notebooks.filter((n) => n.folder === folder).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notebooks Grid Gallery */}
          {filteredNotebooks.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-surface-container-lowest border border-dashed border-outline-variant/40 max-w-lg mx-auto my-12">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-3 block">
                search_off
              </span>
              <h3 className="text-lg font-bold text-on-surface mb-1">No Notebooks Found</h3>
              <p className="text-xs text-on-surface-variant/70 mb-6">
                Try adjusting your search query or folder filter.
              </p>
              <button
                onClick={() => {
                  setSelectedFolder("All Notebooks");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* + Create New Notebook Card (Always first in grid) */}
              <div
                onClick={() => setNewModalOpen(true)}
                className="aspect-[3/4] min-h-[280px] rounded-3xl border-2 border-dashed border-primary/40 hover:border-primary bg-gradient-to-b from-primary/5 via-transparent to-primary/5 hover:bg-primary/10 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-primary/15 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center mb-4 transition-all duration-300 shadow-md">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <h3 className="text-base font-headline font-black text-on-surface group-hover:text-primary transition-colors">
                  Create New Notebook
                </h3>
                <p className="text-xs text-on-surface-variant/70 mt-1 max-w-[180px]">
                  Pick from 15 custom digital planner & journal cover styles
                </p>
              </div>

              {/* Digital Planner Cover Cards */}
              {filteredNotebooks.map((nb) => {
                const theme =
                  COVER_THEMES.find((t) => t.id === nb.coverTheme) || COVER_THEMES[0];

                return (
                  <div
                    key={nb.id}
                    onClick={() => handleOpenNotebook(nb.id)}
                    className={`aspect-[3/4] min-h-[280px] rounded-3xl relative overflow-hidden transition-all duration-300 cursor-pointer group shadow-md hover:shadow-2xl hover:-translate-y-2 border border-outline-variant/30 flex flex-col justify-between p-5 ${theme.bgClass}`}
                  >
                    {/* Decorative Background Pattern */}
                    <CoverPattern type={theme.patternType} icon={theme.accentIcon} />

                    {/* Book Binder Spine on Left Edge */}
                    <div className={`w-5 absolute left-0 top-0 bottom-0 shadow-inner ${theme.spineClass} flex flex-col justify-around items-center py-4 z-10`}>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                      <div className="w-2 h-2 rounded-full bg-white/40 shadow-inner"></div>
                    </div>

                    {/* Elastic Closure Band on Right Edge */}
                    <div className={`w-3.5 absolute right-6 top-0 bottom-0 shadow-lg opacity-90 ${theme.elasticClass} z-10`}>
                      <div className="w-full h-full bg-gradient-to-r from-black/20 via-transparent to-white/20"></div>
                    </div>

                    {/* Top Row: Star Favorite & Actions */}
                    <div className="relative z-20 flex items-center justify-between ml-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-xs ${theme.badgeClass}`}>
                        {nb.folder}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleFavorite(nb.id, e)}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            nb.favorite
                              ? "text-yellow-400 bg-black/20 scale-110 shadow-xs"
                              : "text-gray-400/60 hover:text-yellow-400 hover:bg-black/10 opacity-0 group-hover:opacity-100"
                          }`}
                          title="Toggle favorite"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ fontVariationSettings: nb.favorite ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Front Cover Title Label Box (The core digital planner look) */}
                    <div className="relative z-20 mx-3 my-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/70 dark:border-slate-700/70 transition-transform duration-300 group-hover:scale-[1.03]">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-base text-primary">
                          {theme.accentIcon}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-bold">
                          {nb.pages.length} {nb.pages.length === 1 ? "page" : "pages"}
                        </span>
                      </div>
                      <h3 className="text-base font-headline font-black text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2">
                        {nb.title || "Untitled Notebook"}
                      </h3>
                      <div className="w-full h-px bg-gradient-to-r from-primary/40 via-purple-400/40 to-transparent my-2"></div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        <span>{nb.sourcesCount} sources</span>
                        <span>{nb.lastEdited}</span>
                      </div>
                    </div>

                    {/* Bottom Hover Action Indicator */}
                    <div className="relative z-20 ml-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {nb.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery(t);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/20 hover:bg-black/40 text-white font-bold backdrop-blur-xs transition-colors cursor-pointer"
                            title="Filter by tag"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotebook(nb.id, e)}
                        className="p-1.5 rounded-full text-white/50 hover:text-red-400 hover:bg-black/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete Notebook"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>

                    {/* Click to open overlay hint */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-15 flex items-center justify-center"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODE 2: OPEN FULL NOTEBOOK WORKSPACE (After clicking notebook!)
          With Side Tab Closing and Opening All Time!
          ========================================================================= */}
      {viewMode === "full_notebook" && activeNotebook && (
        <div className="flex flex-col flex-1 h-[calc(100vh-73px)] overflow-hidden bg-background animate-fade-in">
          {/* Top Navbar Header for Active Notebook */}
          <div className="px-6 py-3 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-4 z-20 shadow-xs">
            {/* Left: Back to Grid Button & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("grid")}
                className="px-3.5 py-1.5 rounded-xl bg-surface-variant/60 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer group"
                title="Back to Notebooks Grid"
              >
                <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>All Notebooks</span>
              </button>

              <div className="h-5 w-px bg-outline-variant/40 hidden sm:block"></div>

              {/* Cover theme badge & title */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm ${activeThemeConfig.spineClass}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {activeThemeConfig.accentIcon}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-on-surface-variant">
                    <span>{activeNotebook.folder}</span>
                    <span>•</span>
                    <span>{activeNotebook.pages.length} pages</span>
                  </div>
                  <h2 className="text-sm font-headline font-black text-on-surface truncate max-w-xs md:max-w-md">
                    {activeNotebook.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Right: Toggle Side Tab Button (CRITICAL REQUIREMENT!), AI, Save Status */}
            <div className="flex items-center gap-2.5">
              <span className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant bg-surface-variant/40 px-3 py-1 rounded-full">
                <span
                  className={`w-2 h-2 rounded-full ${
                    saveStatus.includes("Saving") ? "bg-yellow-500 animate-ping" : "bg-emerald-500"
                  }`}
                ></span>
                <span>{saveStatus}</span>
              </span>

              {/* Aivora AI Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAiMenuOpen(!aiMenuOpen)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-primary via-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="hidden sm:inline">Aivora AI</span>
                  <span className="material-symbols-outlined text-xs">expand_more</span>
                </button>

                {aiMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/30 p-2 z-50 animate-fade-in">
                    <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant px-3 py-1.5 border-b border-outline-variant/20 flex items-center justify-between">
                      <span>AI Smart Assistant</span>
                      <span className="text-primary font-mono">Gemini Pro</span>
                    </div>
                    <button
                      onClick={() => triggerAiAction("summarize")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">summarize</span>
                      <span>Summarize Chapter in 3 Bullets</span>
                    </button>
                    <button
                      onClick={() => triggerAiAction("action_items")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-secondary/10 hover:text-secondary transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-secondary">checklist</span>
                      <span>Extract Action Checklist</span>
                    </button>
                    <button
                      onClick={() => triggerAiAction("quiz")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-amber-500/10 hover:text-amber-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-amber-500">quiz</span>
                      <span>Generate Study Self-Test Quiz</span>
                    </button>
                    <button
                      onClick={() => triggerAiAction("translate")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-purple-500/10 hover:text-purple-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-purple-500">translate</span>
                      <span>Translate to French</span>
                    </button>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  SIDE TAB CLOSING AND OPENING ALL TIME BUTTON IN HEADER
                  ========================================================================= */}
              <button
                onClick={() => setIsSideTabOpen(!isSideTabOpen)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isSideTabOpen
                    ? "bg-surface-variant text-on-surface hover:bg-red-500/10 hover:text-red-500 border border-outline-variant/30"
                    : "bg-gradient-to-r from-primary to-purple-600 text-white hover:scale-105 pink-glow animate-pulse"
                }`}
                title={isSideTabOpen ? "Close Side Tab (Full Screen Editor)" : "Open Side Tab (Pages & Sources)"}
              >
                <span className="material-symbols-outlined text-base">
                  {isSideTabOpen ? "left_panel_close" : "left_panel_open"}
                </span>
                <span className="font-headline font-black">
                  {isSideTabOpen ? "Close Side Tab" : "Open Side Tab"}
                </span>
              </button>
            </div>
          </div>

          {/* Main Workspace Split Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* =========================================================================
                THE SIDE TAB (Collapsible Pages & Sources Panel)
                Can be closed and opened at all times!
                ========================================================================= */}
            <div
              className={`border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-20 ${
                isSideTabOpen
                  ? "w-80 opacity-100 pointer-events-auto"
                  : "w-0 opacity-0 pointer-events-none border-r-0"
              }`}
            >
              {/* Side Tab Header */}
              <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between gap-2 bg-surface/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                  <h3 className="text-sm font-headline font-black text-on-surface">
                    Pages & Chapters
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAddPage}
                    className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold flex items-center gap-0.5 px-2 cursor-pointer"
                    title="Add new page"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>New Page</span>
                  </button>
                  <button
                    onClick={() => setIsSideTabOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-red-500 transition-colors ml-1 cursor-pointer"
                    title="Close Side Tab"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              </div>

              {/* Search Inside Notebook */}
              <div className="p-3 border-b border-outline-variant/20">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    placeholder="Search in this notebook..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-surface-variant/40 border border-outline-variant/20 text-xs font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                  {pageSearchQuery && (
                    <button
                      onClick={() => setPageSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Pages List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/70 px-1 mb-1 flex items-center justify-between">
                  <span>Sections ({filteredPages.length})</span>
                  <span>{activeNotebook.sourcesCount} sources</span>
                </div>

                {filteredPages.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant/60 text-xs">
                    <p>No sections match search.</p>
                    <button
                      onClick={() => setPageSearchQuery("")}
                      className="mt-2 text-primary font-bold hover:underline cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  filteredPages.map((pg, index) => {
                    const isSelected = pg.id === activePageId;
                    const pgWordCount = pg.content.trim().split(/\s+/).filter(Boolean).length;
                    return (
                      <div
                        key={pg.id}
                        onClick={() => setActivePageId(pg.id)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer relative group border ${
                          isSelected
                            ? "bg-primary-container/40 border-primary shadow-xs scale-[1.01]"
                            : "bg-white dark:bg-surface border-transparent hover:border-outline-variant/40 hover:bg-surface-variant/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                              #{index + 1}
                            </span>
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-primary font-black" : "text-on-surface"
                              }`}
                            >
                              {pg.title || "Untitled Section"}
                            </h4>
                          </div>
                          <button
                            onClick={(e) => handleDeletePage(pg.id, e)}
                            className="text-on-surface-variant/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0 cursor-pointer"
                            title="Delete section"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-on-surface-variant/80 line-clamp-2 font-body mb-2 pl-6">
                          {pg.content.replace(/^[#*-]\s+/gm, "") || "No content yet..."}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-on-surface-variant font-bold pl-6">
                          <span>{pgWordCount} words</span>
                          <span>{pg.lastEdited}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cover Theme Switcher at bottom of Side Tab (All 15 styles available!) */}
              <div className="p-3 border-t border-outline-variant/20 bg-surface/50">
                <div className="text-[10px] font-bold text-on-surface-variant mb-1.5 flex items-center justify-between">
                  <span>Cover Style:</span>
                  <span className="text-primary font-black">{activeThemeConfig.name}</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {COVER_THEMES.map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => {
                        setNotebooks((prev) =>
                          prev.map((nb) =>
                            nb.id === activeNotebookId ? { ...nb, coverTheme: thm.id } : nb
                          )
                        );
                      }}
                      className={`w-6 h-6 rounded-md shrink-0 border-2 transition-all cursor-pointer ${thm.spineClass} ${
                        activeNotebook.coverTheme === thm.id
                          ? "border-primary scale-110 shadow-md ring-2 ring-primary/40"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      title={`Change cover to ${thm.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* =========================================================================
                PERSISTENT FLOATING EDGE BUTTON (When Side Tab is Closed)
                Ensuring you can open the side tab AT ALL TIMES!
                ========================================================================= */}
            {!isSideTabOpen && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40 animate-fade-in">
                <button
                  onClick={() => setIsSideTabOpen(true)}
                  className="bg-gradient-to-b from-primary via-purple-600 to-pink-500 text-white py-4 px-2 rounded-r-2xl shadow-2xl flex flex-col items-center gap-2 hover:pr-3.5 transition-all cursor-pointer group pink-glow"
                  title="Open Side Tab (Pages & Sources)"
                >
                  <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">
                    dock_to_right
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
                    Side Tab
                  </span>
                </button>
              </div>
            )}

            {/* =========================================================================
                MAIN DOCUMENT WRITING WORKSPACE (Right Panel)
                Takes up full width (w-full) when Side Tab is closed!
                ========================================================================= */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-surface overflow-hidden">
              {/* Formatting Toolbar (All 11 buttons fully clickable and functional!) */}
              <div className="px-6 py-2 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center gap-1 overflow-x-auto scrollbar-hide text-on-surface-variant shrink-0">
                <button
                  onClick={() => handleFormat("H1")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors text-xs font-bold font-mono cursor-pointer"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => handleFormat("H2")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors text-xs font-bold font-mono cursor-pointer"
                  title="Heading 2"
                >
                  H2
                </button>
                <div className="w-px h-4 bg-outline-variant/40 mx-1"></div>
                <button
                  onClick={() => handleFormat("bold")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Bold"
                >
                  <span className="material-symbols-outlined text-base">format_bold</span>
                </button>
                <button
                  onClick={() => handleFormat("italic")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Italic"
                >
                  <span className="material-symbols-outlined text-base">format_italic</span>
                </button>
                <button
                  onClick={() => handleFormat("strikethrough")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Strikethrough"
                >
                  <span className="material-symbols-outlined text-base">strikethrough_s</span>
                </button>
                <div className="w-px h-4 bg-outline-variant/40 mx-1"></div>
                <button
                  onClick={() => handleFormat("bullet")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Bullet List"
                >
                  <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                </button>
                <button
                  onClick={() => handleFormat("numbered")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Numbered List"
                >
                  <span className="material-symbols-outlined text-base">format_list_numbered</span>
                </button>
                <button
                  onClick={() => handleFormat("checkbox")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Task Checklist"
                >
                  <span className="material-symbols-outlined text-base">check_box</span>
                </button>
                <div className="w-px h-4 bg-outline-variant/40 mx-1"></div>
                <button
                  onClick={() => handleFormat("code")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Code Block"
                >
                  <span className="material-symbols-outlined text-base">code</span>
                </button>
                <button
                  onClick={() => handleFormat("quote")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Blockquote"
                >
                  <span className="material-symbols-outlined text-base">format_quote</span>
                </button>
                <button
                  onClick={() => handleFormat("link")}
                  className="p-1.5 rounded-lg hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Insert Link"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                </button>
                <div className="ml-auto text-[11px] font-mono font-bold text-on-surface-variant/60 whitespace-nowrap">
                  {wordCount} words • {charCount} chars
                </div>
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-14 max-w-5xl mx-auto w-full space-y-6">
                {/* Editable Page Title */}
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handleUpdatePageTitle(e.target.value)}
                  placeholder="Page Title..."
                  className="w-full text-3xl lg:text-5xl font-headline font-black text-on-surface bg-transparent border-none focus:ring-0 outline-none placeholder:text-on-surface-variant/40 tracking-tight"
                />

                {/* Tags bar (Click tag to remove or filter!) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">sell</span>
                  {activeNotebook.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleRemoveTag(tag)}
                      className="px-2.5 py-0.5 rounded-md bg-secondary-container/50 hover:bg-red-500/10 hover:text-red-500 text-on-secondary-container text-xs font-mono font-bold cursor-pointer transition-colors"
                      title="Click to remove tag"
                    >
                      {tag} ✕
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const newTag = prompt("Enter new tag (e.g. #important):");
                      if (newTag) {
                        const tagStr = newTag.startsWith("#") ? newTag : `#${newTag}`;
                        setNotebooks((prev) =>
                          prev.map((n) =>
                            n.id === activeNotebookId
                              ? { ...n, tags: [...new Set([...n.tags, tagStr])] }
                              : n
                          )
                        );
                      }
                    }}
                    className="px-2 py-0.5 rounded-md border border-dashed border-outline-variant text-on-surface-variant text-xs font-bold hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    + Tag
                  </button>
                </div>

                {/* Rich Text Writing Area */}
                <textarea
                  value={activePage.content}
                  onChange={(e) => handleUpdatePageContent(e.target.value)}
                  placeholder="Start typing freely... Aivora AI will structure your ideas into elegant markdown."
                  className="w-full h-[calc(100%-150px)] min-h-[450px] bg-transparent border-none focus:ring-0 outline-none resize-none font-body text-base lg:text-lg leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 font-normal selection:bg-primary/20"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE NEW NOTEBOOK MODAL (With 15 Cover Themes Picker)
          ========================================================================= */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface-container-high rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl font-black">
                  auto_stories
                </span>
                <h3 className="text-xl font-headline font-black text-on-surface">
                  Create New Notebook & Planner
                </h3>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNotebook} className="space-y-6">
              {/* Notebook Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Notebook Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2026 Financial Roadmap & Goals"
                  value={newNbTitle}
                  onChange={(e) => setNewNbTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-variant/40 border border-outline-variant/30 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Folder Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Category / Folder
                </label>
                <select
                  value={newNbFolder}
                  onChange={(e) => setNewNbFolder(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-variant/40 border border-outline-variant/30 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="AI Research">AI Research</option>
                  <option value="Personal Projects">Personal Projects</option>
                  <option value="Meeting Minutes">Meeting Minutes</option>
                  <option value="Travel Plans">Travel Plans</option>
                  <option value="Study Notes">Study Notes</option>
                </select>
              </div>

              {/* Cover Theme Picker (15 Unique Designs!) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                  Pick Digital Planner Cover Style (15 Designs)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {COVER_THEMES.map((thm) => {
                    const isSelected = newNbTheme === thm.id;
                    return (
                      <div
                        key={thm.id}
                        onClick={() => setNewNbTheme(thm.id)}
                        className={`aspect-[3/4] rounded-xl p-2 flex flex-col justify-between cursor-pointer transition-all border-2 relative overflow-hidden ${
                          thm.bgClass
                        } ${
                          isSelected
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/40"
                            : "border-outline-variant/30 opacity-80 hover:opacity-100 hover:scale-[1.02]"
                        }`}
                      >
                        <div className={`w-2 absolute left-0 top-0 bottom-0 ${thm.spineClass}`}></div>
                        <span className="material-symbols-outlined text-sm text-primary relative z-10 ml-2">
                          {thm.accentIcon}
                        </span>
                        <div className="bg-white/90 dark:bg-slate-900/90 rounded p-1 text-[9px] font-bold truncate text-center relative z-10">
                          {thm.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-purple-600 to-pink-500 text-white font-bold text-xs shadow-lg pink-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">auto_stories</span>
                  <span>Create & Open Notebook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

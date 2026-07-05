"use client";

import React, { useState, useEffect } from "react";

interface ExpenseCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  icon: string;
  colorClass: string;
  bgClass: string;
}

interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: string;
  badgeClass: string;
  date: string;
}

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
  isAiGenerated?: boolean;
}

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: "idle" | "running" | "done";
  message: string;
  output?: string;
}

interface DossierItem {
  day: string;
  desc: string;
}

interface DossierResult {
  title: string;
  date: string;
  budgetTotal: number;
  weather: string;
  itinerary: DossierItem[];
  checklist: string[];
  reminders: string[];
}

const STORAGE_KEY = "aivora_budget_planner_data_v3";

const INITIAL_CATEGORIES: ExpenseCategory[] = [
  { id: "cat1", name: "🍔 Food", budget: 800, spent: 540, icon: "restaurant", colorClass: "bg-secondary", bgClass: "bg-secondary/10 text-secondary" },
  { id: "cat2", name: "🏠 Housing", budget: 1800, spent: 1750, icon: "home", colorClass: "bg-primary", bgClass: "bg-primary/10 text-primary" },
  { id: "cat3", name: "🚗 Transport", budget: 600, spent: 145, icon: "flight", colorClass: "bg-pink-500", bgClass: "bg-pink-500/10 text-pink-600" },
  { id: "cat4", name: "🛒 Shopping", budget: 400, spent: 220, icon: "local_activity", colorClass: "bg-purple-500", bgClass: "bg-purple-500/10 text-purple-600" },
  { id: "cat5", name: "💼 Work", budget: 300, spent: 150, icon: "work", colorClass: "bg-amber-500", bgClass: "bg-amber-500/10 text-amber-600" },
  { id: "cat6", name: "💻 Tech", budget: 200, spent: 185, icon: "smart_toy", colorClass: "bg-tertiary", bgClass: "bg-tertiary/10 text-tertiary" },
];

const INITIAL_GOALS: SavingsGoal[] = [
  { id: "g1", title: "Paris 2026 Trip Vault", target: 4500, current: 3200, icon: "flight_takeoff", badgeClass: "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300", date: "Target: Aug 2026" },
  { id: "g2", title: "New M4 MacBook Pro", target: 2400, current: 1850, icon: "laptop_mac", badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300", date: "Target: Nov 2026" },
  { id: "g3", title: "Emergency Fund (6 Mo)", target: 12000, current: 9500, icon: "health_and_safety", badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300", date: "Target: Dec 2026" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx1", title: "Whole Foods Organic Market", category: "🍔 Food", amount: 142.5, date: "Today, 4:30 PM", icon: "shopping_cart" },
  { id: "tx2", title: "OpenAI ChatGPT Team Plan", category: "💻 Tech", amount: 30.0, date: "Yesterday", icon: "bolt" },
  { id: "tx3", title: "Apple One Premier Bundle", category: "💻 Tech", amount: 37.95, date: "Jul 2", icon: "apple" },
  { id: "tx4", title: "Equinox Fitness Club Monthly", category: "🛒 Shopping", amount: 210.0, date: "Jul 1", icon: "fitness_center" },
  { id: "tx5", title: "Uber Black Ride - Midtown", category: "🚗 Transport", amount: 45.8, date: "Jun 28", icon: "directions_car" },
];

export function AivoraBudget() {
  // State initialization with localStorage persistence
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_CATEGORIES);
  const [goals, setGoals] = useState<SavingsGoal[]>(INITIAL_GOALS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI state for filters and quick form
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [selectedCat, setSelectedCat] = useState("🍔 Food");

  // Edit Transaction Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCat, setEditCat] = useState("");

  // Adjust Caps Modal State
  const [showCapModal, setShowCapModal] = useState(false);
  const [tempCategories, setTempCategories] = useState<ExpenseCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatBudget, setNewCatBudget] = useState("");

  // Add Savings Goal Modal State
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("Target: Dec 2026");
  const [newGoalIcon, setNewGoalIcon] = useState("stars");

  // Custom Contribution Modal State
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");

  // Export & Report Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // AI Deep Dive Analytics Modal State
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Dossier & Multi-Agent State
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nlQuery, setNlQuery] = useState("");
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [coordinationStep, setCoordinationStep] = useState(0);
  const [dossierResult, setDossierResult] = useState<DossierResult | null>(null);
  const [reallocationApplied, setReallocationApplied] = useState(false);

  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: "a1", name: "Trip & Itinerary Planner", role: "Logistics & Schedule", icon: "flight_takeoff", status: "idle", message: "Ready to analyze destination and timeline." },
    { id: "a2", name: "Live Weather Forecast", role: "Meteorology API", icon: "partly_cloudy_day", status: "idle", message: "Ready to check local climate." },
    { id: "a3", name: "Budget & Expense Estimator", role: "Financial Allocation", icon: "account_balance_wallet", status: "idle", message: "Ready to estimate costs and update budget." },
    { id: "a4", name: "Smart Packing List", role: "Checklist Generator", icon: "luggage", status: "idle", message: "Ready to generate tailored items." },
    { id: "a5", name: "Reminder & Scheduler", role: "Time Management", icon: "alarm", status: "idle", message: "Ready to schedule smart alarms." },
    { id: "a6", name: "Archive & Memory Save", role: "History Storage", icon: "save", status: "idle", message: "Ready to sync with Aivora Notes." },
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.reallocationApplied) setReallocationApplied(parsed.reallocationApplied);
      }
    } catch (err) {
      console.error("Failed to load budget data from storage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        categories,
        goals,
        transactions,
        reallocationApplied,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.error("Failed to save budget data to storage:", err);
    }
  }, [categories, goals, transactions, reallocationApplied, isLoaded]);

  // Trigger toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset to demo data
  const handleResetDemoData = () => {
    setCategories(INITIAL_CATEGORIES);
    setGoals(INITIAL_GOALS);
    setTransactions(INITIAL_TRANSACTIONS);
    setReallocationApplied(false);
    showToast("🔄 Restored initial demo budget planner data!");
  };

  // Metrics calculation
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;
  const savingsRate = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
  const dailyBurnRate = Math.round(totalSpent / 15);

  // Handle manual expense logging
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) return;
    const amountNum = parseFloat(newExpenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid amount greater than 0.");
      return;
    }

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      title: newExpenseTitle,
      category: selectedCat,
      amount: amountNum,
      date: "Just Now",
      icon: "receipt_long",
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === selectedCat ? { ...cat, spent: cat.spent + amountNum } : cat
      )
    );

    // Sync with backend API if available
    try {
      fetch("/api/v1/dashboard/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          description: `${newExpenseTitle} (${selectedCat})`,
        }),
      }).catch(() => {});
    } catch (err) {
      // Ignore network errors in local/offline mode
    }

    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setShowAddModal(false);
    showToast(`Logged $${amountNum.toFixed(2)} for "${newExpenseTitle}"!`);
  };

  // Handle transaction editing
  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCat(tx.category);
    setShowEditModal(true);
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editTitle || !editAmount) return;
    const newAmt = parseFloat(editAmount);
    if (isNaN(newAmt) || newAmt <= 0) return;

    const oldAmt = editingTx.amount;
    const oldCat = editingTx.category;

    // Update transactions list
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingTx.id
          ? { ...t, title: editTitle, amount: newAmt, category: editCat }
          : t
      )
    );

    // Update category totals
    setCategories((prev) =>
      prev.map((cat) => {
        let spent = cat.spent;
        if (cat.name === oldCat) spent = Math.max(0, spent - oldAmt);
        if (cat.name === editCat) spent = spent + newAmt;
        return { ...cat, spent };
      })
    );

    setShowEditModal(false);
    setEditingTx(null);
    showToast(`Updated "${editTitle}" to $${newAmt.toFixed(2)}!`);
  };

  const handleDeleteTransaction = (id: string, amount: number, catName: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === catName ? { ...cat, spent: Math.max(0, cat.spent - amount) } : cat
      )
    );
    showToast("Transaction removed and category budget updated.");
  };

  // Handle savings goal contributions
  const handleQuickContribute = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, current: Math.min(goal.target, goal.current + amount) }
          : goal
      )
    );
    showToast(`+$${amount} added to savings milestone!`);
  };

  const openContributeModal = (goalId: string) => {
    setActiveGoalId(goalId);
    setContributeAmount("150");
    setShowContributeModal(true);
  };

  const handleCustomContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalId || !contributeAmount) return;
    const amt = parseFloat(contributeAmount);
    if (isNaN(amt) || amt <= 0) return;

    handleQuickContribute(activeGoalId, amt);
    setShowContributeModal(false);
    setActiveGoalId(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;
    const targetNum = parseFloat(newGoalTarget);
    const currentNum = newGoalCurrent ? parseFloat(newGoalCurrent) : 0;
    if (isNaN(targetNum) || targetNum <= 0) return;

    const newGoal: SavingsGoal = {
      id: "g-" + Date.now(),
      title: newGoalTitle,
      target: targetNum,
      current: isNaN(currentNum) ? 0 : currentNum,
      icon: newGoalIcon,
      badgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
      date: newGoalDate || "Target: 2027",
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalTitle("");
    setNewGoalTarget("");
    setNewGoalCurrent("");
    setShowAddGoalModal(false);
    showToast(`Created milestone "${newGoalTitle}"!`);
  };

  // Handle Budget Caps Adjustments
  const openCapModal = () => {
    setTempCategories(JSON.parse(JSON.stringify(categories)));
    setShowCapModal(true);
  };

  const handleSaveCaps = (e: React.FormEvent) => {
    e.preventDefault();
    setCategories(tempCategories);
    setShowCapModal(false);
    showToast("✅ Monthly budget caps updated successfully!");
  };

  const handleAddNewCategory = () => {
    if (!newCatName || !newCatBudget) return;
    const budgetNum = parseFloat(newCatBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) return;

    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-rose-500"];
    const colorIdx = tempCategories.length % colors.length;
    const colorClass = colors[colorIdx];

    const newCat: ExpenseCategory = {
      id: "cat-" + Date.now(),
      name: newCatName,
      budget: budgetNum,
      spent: 0,
      icon: "category",
      colorClass,
      bgClass: `${colorClass}/10 text-indigo-600`,
    };

    setTempCategories((prev) => [...prev, newCat]);
    setNewCatName("");
    setNewCatBudget("");
  };

  const handleDeleteCategory = (id: string) => {
    if (tempCategories.length <= 1) {
      showToast("You must keep at least one budget category.");
      return;
    }
    setTempCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // CSV Report Export
  const handleDownloadCSV = () => {
    const headers = ["ID", "Title", "Category", "Amount", "Date", "AI Generated"];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      `"${t.date}"`,
      t.isAiGenerated ? "Yes" : "No",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aivora_Budget_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
    showToast("📥 CSV Financial Report downloaded successfully!");
  };

  const handlePrintReport = () => {
    setShowExportModal(false);
    window.print();
  };

  // Intelligent Multi-Agent Natural Language Simulation
  const runMultiAgentCoordination = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsCoordinating(true);
    setCoordinationStep(1);
    setDossierResult(null);

    const qLower = queryText.toLowerCase();
    const isTechOrMacBook = qLower.includes("macbook") || qLower.includes("laptop") || qLower.includes("computer") || qLower.includes("apple") || qLower.includes("subscription") || qLower.includes("buy");
    const isParisOrEurope = qLower.includes("paris") || qLower.includes("europe") || qLower.includes("france") || qLower.includes("vacation") || qLower.includes("abroad");

    // Configure agents based on intent
    if (isTechOrMacBook) {
      setAgents([
        { id: "a1", name: "Subscription Audit Agent", role: "Recurrent Spend Analyzer", icon: "radar", status: "idle", message: "Ready to scan active subscriptions." },
        { id: "a2", name: "Hardware Deal & Price Tracker", role: "Retail API Verification", icon: "laptop_mac", status: "idle", message: "Ready to check M4 MacBook pricing." },
        { id: "a3", name: "Savings Optimizer Swarm", role: "Reallocation Engine", icon: "trending_up", status: "idle", message: "Ready to optimize monthly burn rate." },
        { id: "a4", name: "Tech Setup & Checklist Bot", role: "Acquisition Checklist", icon: "fact_check", status: "idle", message: "Ready to generate setup requirements." },
        { id: "a5", name: "Deal Alert & Scheduler", role: "Calendar & Alarms", icon: "notifications_active", status: "idle", message: "Ready to schedule deal check alarms." },
        { id: "a6", name: "Archive & Vault Synchronizer", role: "Cloud Persistence", icon: "cloud_sync", status: "idle", message: "Ready to sync with Aivora Tech Vault." },
      ]);
    } else if (isParisOrEurope) {
      setAgents([
        { id: "a1", name: "European Itinerary Coordinator", role: "Logistics & Tour Planner", icon: "map", status: "idle", message: "Ready to design Paris travel schedule." },
        { id: "a2", name: "Euro Exchange & Climate API", role: "Meteorology & FX Rates", icon: "euro", status: "idle", message: "Ready to verify EUR/USD rates and weather." },
        { id: "a3", name: "Paris Travel Budget Estimator", role: "Expense Allocation", icon: "account_balance_wallet", status: "idle", message: "Ready to estimate flights and hotel stays." },
        { id: "a4", name: "International Packing Guide", role: "Checklist Generator", icon: "luggage", status: "idle", message: "Ready to generate European packing list." },
        { id: "a5", name: "Flight Check-in & Alarm Bot", role: "Time Management", icon: "alarm", status: "idle", message: "Ready to schedule passport and flight alarms." },
        { id: "a6", name: "Archive & Travel Memory Save", role: "History Storage", icon: "save", status: "idle", message: "Ready to sync with Aivora Notes." },
      ]);
    } else {
      // Default: Delhi trip or General Getaway
      setAgents([
        { id: "a1", name: "Trip & Itinerary Planner", role: "Logistics & Schedule", icon: "flight_takeoff", status: "idle", message: "Ready to analyze destination and timeline." },
        { id: "a2", name: "Live Weather Forecast", role: "Meteorology API", icon: "partly_cloudy_day", status: "idle", message: "Ready to check local climate." },
        { id: "a3", name: "Budget & Expense Estimator", role: "Financial Allocation", icon: "account_balance_wallet", status: "idle", message: "Ready to estimate costs and update budget." },
        { id: "a4", name: "Smart Packing List", role: "Checklist Generator", icon: "luggage", status: "idle", message: "Ready to generate tailored items." },
        { id: "a5", name: "Reminder & Scheduler", role: "Time Management", icon: "alarm", status: "idle", message: "Ready to schedule smart alarms." },
        { id: "a6", name: "Archive & Memory Save", role: "History Storage", icon: "save", status: "idle", message: "Ready to sync with Aivora Notes." },
      ]);
    }

    // Step 1: Agent 1
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) => (a.id === "a1" ? { ...a, status: "running", message: isTechOrMacBook ? "Scanning 14 subscription services for redundancy..." : isParisOrEurope ? "Designing 5-Day Paris Highlights itinerary..." : "Analyzing Delhi trip timeline (Next Friday - Sunday)..." } : a))
      );
    }, 400);

    // Step 2: Agent 2
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a1"
            ? {
                ...a,
                status: "done",
                message: isTechOrMacBook ? "Audit complete: Found $45/mo in overlapping cloud plans!" : isParisOrEurope ? "5-Day Paris Itinerary confirmed!" : "3-Day Delhi Itinerary planned!",
                output: isTechOrMacBook ? "Identified unused cloud storage and duplicate streaming services. Recommended cancellation saves $540/year." : isParisOrEurope ? "Day 1: Eiffel Tower & Seine Cruise. Day 2: Louvre Museum & Tuileries. Day 3: Montmartre & Sacré-Cœur." : "Day 1: Red Fort & Chandni Chowk food walk. Day 2: Qutub Minar & Lodhi Art District. Day 3: Humayun's Tomb & Connaught Place.",
              }
            : a.id === "a2"
            ? { ...a, status: "running", message: isTechOrMacBook ? "Verifying Apple Store educational discount & trade-in value..." : isParisOrEurope ? "Checking Paris live climate & EUR exchange rate (1 EUR = $1.08)..." : "Querying New Delhi live weather model..." }
            : a
        )
      );
      setCoordinationStep(2);
    }, 1500);

    // Step 3: Agent 3
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a2"
            ? {
                ...a,
                status: "done",
                message: isTechOrMacBook ? "Verified: $150 trade-in credit + $200 student discount applicable." : isParisOrEurope ? "Weather: 24°C Sunny / FX rate favorable." : "Weather verified: Warm with light showers.",
                output: isTechOrMacBook ? "Target M4 MacBook Pro price reduced from $2,400 to $2,050 net. Net savings velocity increased by 28%." : isParisOrEurope ? "Forecast: 24°C High / 16°C Low. Pleasant spring breeze. Euro exchange rate locked at spot rate." : "Forecast: 32°C High / 26°C Low. 60% humidity. Light monsoon drizzle likely on Saturday afternoon. Recommendation: Pack breathable fabrics and umbrella.",
              }
            : a.id === "a3"
            ? { ...a, status: "running", message: isTechOrMacBook ? "Reallocating monthly subscriptions to MacBook goal vault..." : isParisOrEurope ? "Estimating Paris flights, boutique stay & dining allocation..." : "Estimating Delhi travel budget & allocating expenses..." }
            : a
        )
      );
      setCoordinationStep(3);
    }, 2800);

    // Step 4: Agent 4
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a3"
            ? {
                ...a,
                status: "done",
                message: isTechOrMacBook ? "Allocated +$150/mo to M4 MacBook Pro savings vault!" : isParisOrEurope ? "Estimated Paris budget: $1,450 allocated." : "Estimated total trip budget: $750 allocated.",
                output: isTechOrMacBook ? "Budget updated: AI & Tech Subscriptions reduced by $45/mo. Added +$150 automatic monthly transfer to MacBook Pro milestone." : isParisOrEurope ? "Breakdown: Round-trip Flight ($650), Le Marais Hotel ($500), French Dining ($300). Added to Travel & Transit!" : "Breakdown: Round-trip Flight/Transit ($280), Boutique Hotel Stay ($240), Dining & Street Food ($120), Monuments & Cabs ($110). Added to Travel & Transit category!",
              }
            : a.id === "a4"
            ? { ...a, status: "running", message: isTechOrMacBook ? "Generating hardware migration checklist..." : isParisOrEurope ? "Creating Paris packing & adapter checklist..." : "Generating smart packing checklist..." }
            : a
        )
      );
      setCoordinationStep(4);

      // Apply dynamic state changes based on scenario
      if (isTechOrMacBook) {
        setGoals((prev) =>
          prev.map((g) =>
            g.title.includes("MacBook") ? { ...g, current: Math.min(g.target, g.current + 350) } : g
          )
        );
        setCategories((prev) =>
          prev.map((c) =>
            c.name.includes("Subscriptions") ? { ...c, spent: Math.max(0, c.spent - 45) } : c
          )
        );
      } else if (isParisOrEurope) {
        const newParisTxs: Transaction[] = [
          { id: "ai-paris1-" + Date.now(), title: "Paris Le Marais Boutique Hotel", category: "Travel & Transit", amount: 500.0, date: "Next Month (Estimated)", icon: "hotel", isAiGenerated: true },
          { id: "ai-paris2-" + Date.now(), title: "Direct Flight to Paris CDG", category: "Travel & Transit", amount: 650.0, date: "Next Month (Estimated)", icon: "flight_takeoff", isAiGenerated: true },
          { id: "ai-paris3-" + Date.now(), title: "Louvre Museum & Dining Pass", category: "Entertainment & Leisure", amount: 300.0, date: "Next Month (Estimated)", icon: "museum", isAiGenerated: true },
        ];
        setTransactions((prev) => [...newParisTxs, ...prev]);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.name === "Travel & Transit" ? { ...cat, budget: cat.budget + 800, spent: cat.spent + 1150 } : cat.name === "Entertainment & Leisure" ? { ...cat, spent: cat.spent + 300 } : cat
          )
        );
      } else {
        const newTripTxs: Transaction[] = [
          { id: "ai-tx1-" + Date.now(), title: "Delhi Boutique Hotel Stay", category: "Travel & Transit", amount: 240.0, date: "Next Fri (Estimated)", icon: "hotel", isAiGenerated: true },
          { id: "ai-tx2-" + Date.now(), title: "Delhi Flights & Airport Cabs", category: "Travel & Transit", amount: 280.0, date: "Next Fri (Estimated)", icon: "flight_takeoff", isAiGenerated: true },
          { id: "ai-tx3-" + Date.now(), title: "Food, Monuments & Experiences", category: "Travel & Transit", amount: 230.0, date: "Next Sat (Estimated)", icon: "restaurant", isAiGenerated: true },
        ];
        setTransactions((prev) => [...newTripTxs, ...prev]);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.name === "Travel & Transit" ? { ...cat, budget: cat.budget + 450, spent: cat.spent + 750 } : cat
          )
        );
      }
    }, 4200);

    // Step 5: Agent 5
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a4"
            ? {
                ...a,
                status: "done",
                message: isTechOrMacBook ? "Migration checklist created with 8 critical items." : isParisOrEurope ? "14 custom European travel items generated." : "12 custom items generated and saved to Aivora Lists.",
                output: isTechOrMacBook ? "Checklist: [x] Time Machine backup, [ ] USB-C adapter hub, [ ] AppleCare+ registration, [ ] Wipe old MacBook for trade-in." : isParisOrEurope ? "Checklist: [x] Passport & Schengen Visa, [ ] Type C/E European power adapters, [ ] Comfortable walking boots, [ ] Louvre timed tickets." : "Checklist: [x] Passport & ID, [ ] Light cotton shirts (4), [ ] Travel umbrella / rain poncho, [ ] Power bank & adapter, [ ] Comfortable walking sneakers, [ ] Sunscreen & sunglasses.",
              }
            : a.id === "a5"
            ? { ...a, status: "running", message: isTechOrMacBook ? "Scheduling Apple Store deal alarms in calendar..." : isParisOrEurope ? "Scheduling flight check-in and museum tour alarms..." : "Scheduling calendar alarms and travel reminders..." }
            : a
        )
      );
      setCoordinationStep(5);
    }, 5500);

    // Step 6: Agent 6
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a5"
            ? {
                ...a,
                status: "done",
                message: isTechOrMacBook ? "3 hardware trade-in reminders scheduled." : isParisOrEurope ? "4 automated Paris travel alerts active." : "3 automated reminders scheduled.",
                output: isTechOrMacBook ? "⏰ Nov 1: Check M4 MacBook holiday pricing. ⏰ Nov 5: Back up old drive to cloud. ⏰ Nov 10: Schedule Apple Store pickup." : isParisOrEurope ? "⏰ 48h before: Online flight check-in. ⏰ 24h before: Notify bank of international travel. ⏰ Departure day: Airport express train." : "⏰ Thu 10:00 AM: Online Flight Check-in opens. ⏰ Thu 8:00 PM: Pack travel umbrella & documents. ⏰ Fri 6:00 AM: Cab pickup for airport departure.",
              }
            : a.id === "a6"
            ? { ...a, status: "running", message: "Archiving dossier to Aivora Notes & Cloud History..." }
            : a
        )
      );
      setCoordinationStep(6);
    }, 6800);

    // Step 7: Done
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "a6"
            ? {
                ...a,
                status: "done",
                message: "Saved all plans, budgets, reminders & notes!",
                output: "Synced with Aivora History & Archive. You can view the full notebook under your Notes tab anytime.",
              }
            : a
        )
      );
      setIsCoordinating(false);
      setCoordinationStep(7);

      let dossier: DossierResult;
      if (isTechOrMacBook) {
        dossier = {
          title: "M4 MacBook Pro Acquisition & Subscription Optimization",
          date: "Target: Nov 2026",
          budgetTotal: 350,
          weather: "Retail Verification: $2,050 Net Price after discounts",
          itinerary: [
            { day: "Phase 1 (Audit)", desc: "Cancelled unused streaming & duplicate cloud storage ($45/mo saved)." },
            { day: "Phase 2 (Trade-in)", desc: "Locked in $150 trade-in valuation for existing hardware." },
            { day: "Phase 3 (Purchase)", desc: "Automated monthly transfer of $150 into MacBook Pro milestone vault." },
          ],
          checklist: ["Time Machine external drive backup", "USB-C multi-port adapter hub", "AppleCare+ 3-year protection plan", "Wipe old laptop before trade-in"],
          reminders: ["Nov 1 - Check Apple educational pricing", "Nov 5 - Execute final Time Machine backup", "Nov 10 - Visit Apple Store for pickup"],
        };
      } else if (isParisOrEurope) {
        dossier = {
          title: "Paris Getaway & Euro Currency Plan",
          date: "Next Month (5 Days)",
          budgetTotal: 1450,
          weather: "24°C High / 16°C Low, Pleasant Parisian Spring",
          itinerary: [
            { day: "Day 1 (Arrival)", desc: "Check-in at Le Marais boutique hotel, evening Seine river sunset cruise." },
            { day: "Day 2 (Culture)", desc: "Morning Louvre Museum tour, afternoon coffee in Saint-Germain-des-Prés." },
            { day: "Day 3 (Icons)", desc: "Eiffel Tower summit visit, evening Montmartre exploration & dinner." },
          ],
          checklist: ["Passport & Schengen Visa documents", "Type C/E European plug adapters", "Louvre Museum timed entry tickets", "Comfortable walking boots"],
          reminders: ["48h prior - Online flight check-in", "24h prior - Notify bank of foreign card use", "Departure - CDG Airport Express train"],
        };
      } else {
        dossier = {
          title: "Delhi Getaway - Multi-Agent Dossier",
          date: "Next Friday to Sunday",
          budgetTotal: 750,
          weather: "32°C High / 26°C Low, Warm with light rain showers",
          itinerary: [
            { day: "Day 1 (Friday)", desc: "Arrival in New Delhi, check-in at boutique hotel, evening Chandni Chowk street food tour." },
            { day: "Day 2 (Saturday)", desc: "Morning visit to Qutub Minar, afternoon explore Lodhi Art District & Khan Market." },
            { day: "Day 3 (Sunday)", desc: "Sunrise at Humayun's Tomb, shopping at Connaught Place, evening flight home." },
          ],
          checklist: ["Passport & ID Cards", "Light cotton shirts (4)", "Travel umbrella / rain poncho", "Universal power adapter", "Comfortable sneakers"],
          reminders: ["Thu 10:00 AM - Online flight check-in", "Thu 8:00 PM - Pack umbrella & documents", "Fri 6:00 AM - Cab pickup to Airport"],
        };
      }

      setDossierResult(dossier);
      setShowDossierModal(true);
      showToast(`✨ All 6 agents completed! Dossier generated & saved!`);
    }, 8000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === "All" || tx.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate conic gradient for Donut Visualizer
  const getConicGradient = () => {
    if (totalSpent === 0) return "conic-gradient(#cbd5e1 0% 100%)";
    const hexColors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];
    let currentPct = 0;
    const slices = categories.map((cat, idx) => {
      const slicePct = (cat.spent / (totalSpent || 1)) * 100;
      const start = currentPct;
      const end = currentPct + slicePct;
      currentPct = end;
      return `${hexColors[idx % hexColors.length]} ${start}% ${end}%`;
    });
    return `conic-gradient(${slices.join(", ")})`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 relative selection:bg-primary/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-primary/30">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-black uppercase tracking-widest">
              Autonomous Financial Hub
            </span>
            <span className="text-xs text-on-surface-variant font-medium">• Active Cycle: July 2026</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-headline font-black text-primary mb-2">Budget Planner</h1>
          <p className="text-on-surface-variant font-body max-w-2xl text-sm lg:text-base">
            Understand complex natural language requests, coordinate specialized AI agents, and manage your financial cards in one unified dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetDemoData}
            title="Reset demo data"
            className="p-2.5 bg-surface-variant/80 hover:bg-surface-variant text-on-surface-variant hover:text-primary rounded-full transition-all flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>New Expense</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-5 py-2.5 bg-white border border-outline-variant/60 hover:border-primary text-on-surface-variant hover:text-primary rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm hover:shadow"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* =========================================================================================
          NATURAL LANGUAGE REQUEST & MULTI-AGENT COORDINATOR
          ========================================================================================= */}
      <div className="bg-gradient-to-br from-surface-container-high via-surface-container to-secondary-container/40 p-6 lg:p-8 rounded-3xl border-2 border-primary/20 shadow-xl mb-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-2xl animate-spin" style={{ animationDuration: "12s" }}>
                hub
              </span>
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-on-surface flex items-center gap-2">
                <span>AI Natural Language Multi-Agent Coordinator</span>
                <span className="bg-primary/15 text-primary text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider">
                  6 Agents Ready
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                One prompt orchestrates trip planning, hardware purchases, weather verification, budget estimation, packing lists, reminders, and cloud archiving.
              </p>
            </div>
          </div>
          {dossierResult && (
            <button
              onClick={() => setShowDossierModal(true)}
              className="px-4 py-2 bg-secondary text-white rounded-full text-xs font-bold shadow hover:scale-105 transition-transform flex items-center gap-1.5 self-start md:self-auto animate-pulse"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>View Last Saved Dossier</span>
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="relative z-10 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder='e.g. "I&#39;m visiting Delhi next Friday. Plan my trip, check the weather, estimate my budget, create a packing list, schedule reminders and save everything."'
                className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur rounded-2xl border border-outline-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/15 text-sm font-medium text-on-surface outline-none transition-all shadow-inner"
              />
            </div>
            <button
              disabled={isCoordinating || !nlQuery.trim()}
              onClick={() => runMultiAgentCoordination(nlQuery)}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm whitespace-nowrap shadow-lg transition-all flex items-center justify-center gap-2 ${
                isCoordinating || !nlQuery.trim()
                  ? "bg-outline-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 active:scale-95 shadow-primary/30"
              }`}
            >
              {isCoordinating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Coordinating Agents...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Execute Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar relative z-10">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lightbulb</span> Example Scenarios:
          </span>
          <button
            onClick={() => {
              const text = "I'm visiting Delhi next Friday. Plan my trip, check the weather, estimate my budget, create a packing list, schedule reminders and save everything.";
              setNlQuery(text);
              runMultiAgentCoordination(text);
            }}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-white text-primary border border-primary/30 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap hover:scale-102 flex items-center gap-1.5"
          >
            <span>🇮🇳</span>
            <span>{"\"Delhi Trip Getaway: Plan itinerary, weather, budget & alarms...\""}</span>
          </button>
          <button
            onClick={() => {
              const text = "Planning to buy a new M4 MacBook Pro next month. Optimize subscriptions, check Apple discount, create savings schedule, set deal alarms, and save.";
              setNlQuery(text);
              runMultiAgentCoordination(text);
            }}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-white text-secondary border border-secondary/30 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap hover:scale-102 flex items-center gap-1.5"
          >
            <span>💻</span>
            <span>{"\"Buy M4 MacBook Pro: Optimize cloud subscriptions & deal alarms...\""}</span>
          </button>
          <button
            onClick={() => {
              const text = "I am planning a 5-day vacation to Paris Europe next month. Check Euro currency rate, estimate flight budget, create Louvre itinerary and packing checklist.";
              setNlQuery(text);
              runMultiAgentCoordination(text);
            }}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-white text-tertiary border border-tertiary/30 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap hover:scale-102 flex items-center gap-1.5"
          >
            <span>🗼</span>
            <span>{"\"Paris Vacation: EUR fx rate, Le Marais hotel & Louvre itinerary...\""}</span>
          </button>
        </div>

        {/* Multi-Agent Live Execution Status Grid */}
        {(isCoordinating || coordinationStep > 0) && (
          <div className="mt-6 pt-6 border-t border-outline-variant/40 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>Agent Swarm Orchestration Status</span>
              </span>
              <span className="text-xs font-bold text-on-surface-variant">
                {coordinationStep === 7 ? "✨ All 6 Agents Completed" : `Step ${coordinationStep} of 6 in progress...`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    agent.status === "running"
                      ? "bg-white border-primary shadow-md ring-2 ring-primary/20 scale-102"
                      : agent.status === "done"
                      ? "bg-white/90 border-green-500/40 shadow-sm"
                      : "bg-white/40 border-outline-variant/30 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm ${
                          agent.status === "running" ? "bg-primary animate-bounce" : agent.status === "done" ? "bg-green-600" : "bg-outline"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{agent.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-on-surface leading-tight">{agent.name}</h4>
                        <span className="text-[10px] text-on-surface-variant font-medium">{agent.role}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        agent.status === "running"
                          ? "bg-primary/15 text-primary animate-pulse"
                          : agent.status === "done"
                          ? "bg-green-100 text-green-700"
                          : "bg-surface-variant text-on-surface-variant"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2.5 line-clamp-2 bg-surface/60 p-2 rounded-lg font-medium border border-outline-variant/20">
                    {agent.status === "done" && <span className="text-green-600 font-bold mr-1">✓</span>}
                    {agent.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================================
          THE 6 REQUESTED CARDS SECTION
          ========================================================================================= */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-headline font-black text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">dashboard</span>
          <span>Financial Overview Cards</span>
        </h2>
        <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Real-time persistence active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* CARD 1: TOTAL BUDGET */}
        <div className="bg-gradient-to-br from-primary to-primary-fixed-dim text-white p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] group relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/80 block">Card 1</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Total Budget</h3>
            </div>
            <div className="p-2.5 bg-white/20 backdrop-blur rounded-2xl">
              <span className="material-symbols-outlined text-xl text-white">account_balance</span>
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl lg:text-4xl font-black">${totalBudget.toLocaleString()}</span>
            <div className="flex items-center justify-between mt-2 text-xs text-white/90 font-bold border-t border-white/20 pt-2">
              <span>{categories.length} Active Buckets</span>
              <button
                onClick={openCapModal}
                className="underline hover:text-white font-black flex items-center gap-0.5"
              >
                <span>Adjust Cap</span>
                <span className="material-symbols-outlined text-xs">edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: REMAINING BUDGET */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 shadow-lg shadow-tertiary/5 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-tertiary block">Card 2</span>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Remaining Budget</h3>
            </div>
            <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-2xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">savings</span>
            </div>
          </div>
          <div>
            <span className={`text-3xl lg:text-4xl font-black ${remaining >= 0 ? "text-tertiary" : "text-red-500"}`}>
              ${remaining.toLocaleString()}
            </span>
            <div className="flex items-center justify-between mt-2 text-xs text-on-surface-variant font-bold border-t border-outline-variant/30 pt-2">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Safe Burn Rate
              </span>
              <span>~${Math.round(Math.max(0, remaining) / 15)}/day</span>
            </div>
          </div>
        </div>

        {/* CARD 3: EXPENSES */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 shadow-lg shadow-secondary/5 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-secondary block">Card 3</span>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Expenses</h3>
            </div>
            <div className="p-2.5 bg-secondary/10 text-secondary rounded-2xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">credit_card</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl lg:text-4xl font-black text-on-surface">${totalSpent.toLocaleString()}</span>
              <span className="text-xs font-black text-secondary">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% used</span>
            </div>
            <div className="w-full bg-surface-variant h-2.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${totalSpent > totalBudget ? "bg-red-500" : "bg-secondary"}`}
                style={{ width: `${Math.min(100, (totalSpent / (totalBudget || 1)) * 100)}%` }}
              ></div>
            </div>
            <span className="block text-[11px] text-on-surface-variant mt-1.5 font-bold truncate">
              {transactions.length} total logged items
            </span>
          </div>
        </div>

        {/* CARD 4: MONTHLY SUMMARY */}
        <div className="bg-gradient-to-br from-surface-container to-secondary-container/30 p-6 rounded-3xl border-2 border-dashed border-primary/30 shadow-lg flex flex-col justify-between h-44 transition-all hover:scale-[1.02] group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-primary block">Card 4</span>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Monthly Summary</h3>
            </div>
            <button
              onClick={() => setShowInsightsModal(true)}
              title="View Deep Dive Insights"
              className="p-2.5 bg-primary/15 text-primary rounded-2xl group-hover:rotate-12 transition-transform hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">analytics</span>
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl lg:text-4xl font-black text-primary">{savingsRate}%</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${remaining >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {remaining >= 0 ? "Healthy Margin" : "Over Budget"}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-2 line-clamp-2">
              {remaining >= 0
                ? `AI health check: Excellent! You have $${remaining.toLocaleString()} buffer remaining. Daily burn rate is $${dailyBurnRate}/day.`
                : `Warning: Expenses exceed budget by $${Math.abs(remaining).toLocaleString()}. Review category caps or reallocate.`}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================================
          GRID: CARD 5 (INTERACTIVE DONUT CHART) & CATEGORY BREAKDOWN
          ========================================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Card 5: Interactive Spend Distribution Visualizer */}
        <div className="lg:col-span-5 bg-white p-6 lg:p-8 rounded-3xl border border-outline-variant/40 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Card 5
              </span>
              <span className="text-xs font-bold text-on-surface-variant">Live Visual Analytics</span>
            </div>
            <h3 className="text-2xl font-headline font-black text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">donut_large</span>
              <span>Interactive Spend Chart</span>
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 font-body">
              Proportional distribution of expenses across your active budget buckets. Click items below to filter.
            </p>

            {/* Custom CSS Donut Visualization */}
            <div className="flex flex-col items-center justify-center my-6 relative">
              <div
                className="w-52 h-52 rounded-full relative flex items-center justify-center shadow-inner transition-all duration-700 hover:scale-105 cursor-pointer"
                style={{ background: getConicGradient() }}
                onClick={() => setShowInsightsModal(true)}
              >
                <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-md z-10 text-center p-4">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Outflow</span>
                  <span className="text-2xl font-black text-primary">${totalSpent.toLocaleString()}</span>
                  <span className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                    Live Cycle
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 border-t border-outline-variant/30 pt-4">
              {categories.map((cat, idx) => {
                const hexColors = ["bg-indigo-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500"];
                const pct = Math.round((cat.spent / (totalSpent || 1)) * 100);
                const isSelected = filterCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilterCategory(isSelected ? "All" : cat.name);
                      showToast(isSelected ? "Showing all categories" : `Filtered table to: ${cat.name}`);
                    }}
                    className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all border text-left ${
                      isSelected ? "bg-primary/10 border-primary font-bold shadow-sm" : "bg-surface/50 border-transparent hover:bg-surface-variant/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${hexColors[idx % hexColors.length]}`}></span>
                      <span className="font-bold text-on-surface truncate">{cat.name.split("&")[0]}</span>
                    </div>
                    <span className="font-black text-on-surface-variant">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">AI recommendation engine</span>
            <button
              onClick={() => setShowInsightsModal(true)}
              className="font-bold text-primary hover:underline flex items-center gap-1 group"
            >
              <span>Explore Insights</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Category Budget Breakdown Bars */}
        <div className="lg:col-span-7 bg-white p-6 lg:p-8 rounded-3xl border border-outline-variant/40 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-headline font-black text-on-surface">Category Allocation</h3>
                <p className="text-xs text-on-surface-variant">Real-time spend against targeted budget caps</p>
              </div>
              <button
                onClick={openCapModal}
                className="px-4 py-2 bg-surface-variant hover:bg-primary hover:text-white text-on-surface font-bold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Adjust Caps</span>
              </button>
            </div>

            <div className="space-y-5">
              {categories.map((cat) => {
                const pct = Math.round((cat.spent / (cat.budget || 1)) * 100);
                const isOver = cat.spent > cat.budget;
                return (
                  <div key={cat.id} className="group p-3 rounded-2xl hover:bg-surface/80 transition-colors border border-transparent hover:border-outline-variant/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl ${cat.bgClass} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                          <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm md:text-base">
                            {cat.name}
                          </h4>
                          <span className="text-xs text-on-surface-variant font-medium">Cap: ${cat.budget.toLocaleString()} / mo</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black ${isOver ? "text-red-500" : "text-on-surface"}`}>
                          ${cat.spent.toLocaleString()}
                        </span>
                        <span className={`block text-[11px] font-bold ${isOver ? "text-red-500" : "text-on-surface-variant"}`}>
                          {pct}% used
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-variant/50 h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : cat.colorClass}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-primary-container/20 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl animate-pulse">auto_fix</span>
              <p className="text-xs font-bold text-on-primary-container">
                {reallocationApplied
                  ? "✨ AI Optimization Active: $150 was successfully reallocated from Entertainment to Travel & Transit."
                  : "Aivora detects you can reallocate $150 from Entertainment to Travel & Transit without impacting daily comfort."}
              </p>
            </div>
            {!reallocationApplied ? (
              <button
                onClick={() => {
                  setCategories((prev) =>
                    prev.map((c) =>
                      c.name === "Entertainment & Leisure" ? { ...c, budget: Math.max(100, c.budget - 150) } : c.name === "Travel & Transit" ? { ...c, budget: c.budget + 150 } : c
                    )
                  );
                  setReallocationApplied(true);
                  showToast("Reallocated $150 to Travel & Transit!");
                }}
                className="px-4 py-2 bg-primary text-white rounded-full text-xs font-black shadow hover:scale-105 active:scale-95 transition-all whitespace-nowrap self-end sm:self-auto"
              >
                Reallocate Now
              </button>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-[11px] font-black rounded-full uppercase tracking-wider whitespace-nowrap">
                Applied ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================================
          CARD 6: EXPENSE LIST (COMPREHENSIVE TRANSACTION TABLE)
          ========================================================================================= */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-outline-variant/40 shadow-lg mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                Card 6
              </span>
              <span className="text-xs text-on-surface-variant font-bold">Comprehensive Audit Trail</span>
            </div>
            <h3 className="text-2xl font-headline font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              <span>Expense List &amp; Transactions</span>
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-on-surface-variant text-base">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="pl-9 pr-4 py-2 bg-surface-container rounded-full text-xs font-medium border border-transparent focus:border-primary focus:bg-white outline-none transition-all w-48 md:w-60"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-surface-container rounded-full text-xs font-bold text-on-surface border border-transparent focus:border-primary outline-none transition-all"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-secondary text-white rounded-full font-bold text-xs shadow hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-surface/50 rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <p className="font-bold text-sm text-on-surface">No expenses found matching your filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(""); setFilterCategory("All"); }}
              className="mt-3 text-xs font-bold text-primary underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[11px] font-black uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-4">Transaction / Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface/60 transition-colors group">
                    <td className="py-4 px-4 font-bold text-on-surface flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">{tx.icon}</span>
                      </div>
                      <div>
                        <span>{tx.title}</span>
                        {tx.isAiGenerated && (
                          <span className="ml-2 inline-flex items-center gap-1 bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                            AI Plan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-on-surface-variant">{tx.date}</td>
                    <td className="py-4 px-4 text-right font-black text-on-surface">-${tx.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit transaction"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id, tx.amount, tx.category)}
                          className="p-1.5 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete expense"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
          <span>Showing {filteredTransactions.length} of {transactions.length} total entries</span>
          <div className="flex items-center gap-4">
            <span className="font-bold">Total Filtered Spend: ${filteredTransactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span>
            {filteredTransactions.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Filtered CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================================
          SAVINGS GOALS & MILESTONES BENTO
          ========================================================================================= */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-headline font-black text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">flag</span>
            <span>Savings Goals &amp; Milestones</span>
          </h2>
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add New Goal</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = Math.round((goal.current / (goal.target || 1)) * 100);
            return (
              <div
                key={goal.id}
                className="bg-white p-6 rounded-3xl border border-outline-variant/40 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${goal.badgeClass}`}>
                      {goal.date}
                    </span>
                    <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                      {goal.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{goal.title}</h4>
                  <div className="mt-3 flex justify-between items-baseline text-sm">
                    <span className="font-black text-xl text-on-surface">${goal.current.toLocaleString()}</span>
                    <span className="text-on-surface-variant font-bold">of ${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-surface-variant/40 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-4">
                  <span className="text-xs font-bold text-on-surface-variant">{pct}% Completed</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickContribute(goal.id, 100)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full font-bold text-xs transition-colors flex items-center gap-1"
                      title="Quick add $100"
                    >
                      <span>+$100</span>
                    </button>
                    <button
                      onClick={() => openContributeModal(goal.id)}
                      className="p-1.5 bg-surface-variant hover:bg-secondary hover:text-white text-on-surface-variant rounded-full font-bold text-xs transition-colors flex items-center justify-center"
                      title="Custom deposit amount"
                    >
                      <span className="material-symbols-outlined text-base">more_horiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================================
          MODALS
          ========================================================================================= */}
      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-outline-variant/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-headline font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Log New Expense</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner with clients"
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-outline-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-102 active:scale-95 transition-transform"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-outline-variant/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-headline font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span>
                <span>Edit Transaction</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Title / Vendor
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCat}
                  onChange={(e) => setEditCat(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-outline-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-102 active:scale-95 transition-transform"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Budget Caps Modal */}
      {showCapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/40 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-headline font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  <span>Adjust Monthly Budget Caps</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Edit monthly spending limits for each financial bucket.</p>
              </div>
              <button onClick={() => setShowCapModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCaps} className="space-y-4">
              <div className="space-y-3">
                {tempCategories.map((cat, index) => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/40">
                    <div className={`w-9 h-9 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-xs text-on-surface truncate">{cat.name}</span>
                      <span className="text-[10px] text-on-surface-variant">Spent: ${cat.spent}</span>
                    </div>
                    <div className="w-28">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-on-surface-variant">$</span>
                        <input
                          type="number"
                          step="10"
                          required
                          value={cat.budget}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempCategories((prev) =>
                              prev.map((c, i) => (i === index ? { ...c, budget: val } : c))
                            );
                          }}
                          className="w-full pl-6 pr-2 py-1.5 bg-white rounded-xl border border-outline-variant text-xs font-black text-on-surface focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-outline hover:text-red-500 rounded-lg transition-colors"
                      title="Remove bucket"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Category Subform */}
              <div className="pt-4 border-t border-outline-variant/30">
                <span className="text-xs font-black uppercase tracking-wider text-primary block mb-2">
                  + Create New Bucket
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Bucket Name (e.g. Healthcare)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-medium outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Cap ($)"
                    value={newCatBudget}
                    onChange={(e) => setNewCatBudget(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-bold outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-4 py-2 bg-secondary text-white rounded-xl font-bold text-xs hover:scale-105 transition-transform"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowCapModal(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-outline-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-102 transition-transform"
                >
                  Save Caps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-outline-variant/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-headline font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">flag</span>
                <span>Create Savings Milestone</span>
              </h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo Trip 2027"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Target ($)
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="3000"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Initial Saved ($)
                  </label>
                  <input
                    type="number"
                    step="50"
                    placeholder="0"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Target Date / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Target: Dec 2026"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Icon Style
                </label>
                <div className="flex items-center gap-3 pt-1">
                  {["stars", "flight_takeoff", "laptop_mac", "health_and_safety", "directions_car", "home"].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setNewGoalIcon(ico)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        newGoalIcon === ico ? "bg-primary text-white scale-110 shadow-md" : "bg-surface-variant text-on-surface-variant hover:bg-outline-variant/50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{ico}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-outline-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-102 transition-transform"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Contribution Modal */}
      {showContributeModal && activeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl border border-outline-variant/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_card</span>
                <span>Add Custom Deposit</span>
              </h3>
              <button onClick={() => setShowContributeModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCustomContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low text-lg font-black text-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                {[50, 150, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributeAmount(amt.toString())}
                    className="flex-1 py-1.5 bg-surface-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all"
                  >
                    +${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-full font-bold text-sm hover:bg-outline-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:scale-102 transition-transform"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Report Choice Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-outline-variant/40 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">summarize</span>
            </div>
            <h3 className="text-xl font-headline font-black text-on-surface mb-2">Export Budget Report</h3>
            <p className="text-xs text-on-surface-variant font-medium mb-6">
              Choose your preferred file format for financial audits or backup purposes.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDownloadCSV}
                className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-primary/5 border border-outline-variant/40 hover:border-primary flex items-center gap-4 transition-all group text-left"
              >
                <div className="p-3 bg-secondary/15 text-secondary rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">table_chart</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Download CSV Report</h4>
                  <p className="text-[11px] text-on-surface-variant">Spreadsheet compatible with Excel, Apple Numbers &amp; Google Sheets</p>
                </div>
              </button>
              <button
                onClick={handlePrintReport}
                className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-primary/5 border border-outline-variant/40 hover:border-primary flex items-center gap-4 transition-all group text-left"
              >
                <div className="p-3 bg-primary/15 text-primary rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">print</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Print / Save as PDF</h4>
                  <p className="text-[11px] text-on-surface-variant">Generates formatted printer-friendly view or browser PDF save</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-6 px-6 py-2 bg-surface-variant text-on-surface-variant rounded-full text-xs font-bold hover:bg-outline-variant/50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI Financial Deep Dive Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full shadow-2xl border border-primary/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-2xl">insights</span>
                </div>
                <div>
                  <span className="text-[10px] bg-primary/15 text-primary font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    AI Health Assessment
                  </span>
                  <h3 className="text-2xl font-headline font-black text-on-surface mt-1">Deep-Dive Analytics &amp; Tips</h3>
                </div>
              </div>
              <button onClick={() => setShowInsightsModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
                  <span className="text-[10px] font-black uppercase text-on-surface-variant block">Daily Burn Rate</span>
                  <span className="text-2xl font-black text-primary mt-1 block">${dailyBurnRate}</span>
                  <span className="text-[10px] text-green-600 font-bold block mt-0.5">Optimal for current income</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
                  <span className="text-[10px] font-black uppercase text-on-surface-variant block">Top Spending Category</span>
                  <span className="text-base font-black text-on-surface mt-2 block truncate">
                    {categories.reduce((max, c) => (c.spent > max.spent ? c : max), categories[0]).name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-bold block mt-0.5">
                    ${categories.reduce((max, c) => (c.spent > max.spent ? c : max), categories[0]).spent} total
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
                  <span className="text-[10px] font-black uppercase text-on-surface-variant block">Health Score</span>
                  <span className="text-2xl font-black text-green-600 mt-1 block">{Math.min(100, Math.round(savingsRate * 4.5))}/100</span>
                  <span className="text-[10px] text-on-surface-variant font-bold block mt-0.5">Tier: Excellent</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-container/20 to-secondary-container/20 border border-primary/20">
                <h4 className="text-sm font-black text-primary flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                  <span>AI Agent Recommendations</span>
                </h4>
                <ul className="space-y-2.5 text-xs text-on-surface font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">1</span>
                    <span>
                      <strong>Vacation Milestone Acceleration:</strong> You are on track to fund your Paris 2026 Vault 45 days ahead of schedule. Keep dining spend below $600 this month.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">2</span>
                    <span>
                      <strong>Subscription Consolidation:</strong> We noticed 3 recurring charges under AI &amp; Tech Subscriptions. Bundling cloud plans could yield an additional $25/mo savings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">3</span>
                    <span>
                      <strong>Emergency Buffer Protection:</strong> Your 6-Month Emergency Fund sits at 79% completion. Consider routing next month&apos;s surplus directly to milestone #3.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-end">
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Agent Dossier Modal */}
      {showDossierModal && dossierResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full shadow-2xl border border-primary/30 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <div>
                  <span className="text-[10px] bg-green-100 text-green-700 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    All 6 Agents Synced
                  </span>
                  <h3 className="text-2xl font-headline font-black text-on-surface mt-1">{dossierResult.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">Timeline: {dossierResult.date}</p>
                </div>
              </div>
              <button onClick={() => setShowDossierModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Budget & Weather Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Estimated Budget Added</span>
                  <span className="text-3xl font-black text-on-surface">${dossierResult.budgetTotal}</span>
                  <span className="text-[11px] text-on-surface-variant block mt-1 font-medium">Allocated &amp; tracked automatically</span>
                </div>
                <div className="p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20">
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1">Status / Verification</span>
                  <span className="text-sm font-black text-on-surface block">{dossierResult.weather}</span>
                  <span className="text-[11px] text-on-surface-variant block mt-1 font-medium">Verified by live AI model</span>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
                  <span>Execution Plan</span>
                </h4>
                <div className="space-y-2.5">
                  {dossierResult.itinerary.map((item: DossierItem, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs flex gap-3">
                      <span className="font-black text-primary whitespace-nowrap">{item.day}:</span>
                      <span className="text-on-surface font-medium">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packing Checklist & Reminders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30">
                  <h4 className="text-xs font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">fact_check</span>
                    <span>Action Checklist</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-on-surface">
                    {dossierResult.checklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-sm">check_box</span>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30">
                  <h4 className="text-xs font-black uppercase tracking-widest text-purple-600 mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">alarm</span>
                    <span>Scheduled Alarms</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-on-surface">
                    {dossierResult.reminders.map((rem: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">notifications_active</span>
                        <span className="font-medium">{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDossierModal(false);
                  showToast("Dossier exported to Aivora Notes & Archive!");
                }}
                className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save &amp; Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

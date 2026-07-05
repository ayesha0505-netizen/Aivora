"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface ReminderItem {
  id: string;
  title: string;
  category: string;
  categoryBadgeClass: string;
  borderColorClass: string;
  shadowClass: string;
  timeText: string;
  timeIcon: string;
  completed: boolean;
  priority: "high" | "personal" | "regular";
  footerIcon?: string;
  footerIconClass?: string;
  avatarText?: string;
  filledNotification?: boolean;
}

export function AivoraReminders() {
  const [activeFilter, setActiveFilter] = useState<string>("All Tasks");
  const [showAiCard, setShowAiCard] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ReminderItem | null>(null);

  // Form fields for New/Edit reminder
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("High Priority");
  const [formTime, setFormTime] = useState<string>("Due Today, 5:00 PM");
  const [formNotify, setFormNotify] = useState<boolean>(true);

  const [items, setItems] = useState<ReminderItem[]>([
    {
      id: "toggle1",
      title: "Review quarterly performance metrics with AI team",
      category: "High Priority",
      categoryBadgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
      borderColorClass: "border-primary",
      shadowClass: "pink-shadow",
      timeText: "Due Today, 4:00 PM",
      timeIcon: "calendar_month",
      completed: false,
      priority: "high",
      footerIcon: "repeat",
      footerIconClass: "text-primary",
      filledNotification: false,
    },
    {
      id: "toggle2",
      title: "Plan weekly groceries and meal prep",
      category: "Weekly",
      categoryBadgeClass: "bg-secondary-container text-on-secondary-container",
      borderColorClass: "border-secondary",
      shadowClass: "purple-shadow",
      timeText: "Every Sunday",
      timeIcon: "calendar_month",
      completed: false,
      priority: "personal",
      avatarText: "ME",
      filledNotification: true,
    },
    {
      id: "toggle3",
      title: "Call Mom for her birthday surprise",
      category: "Social",
      categoryBadgeClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      borderColorClass: "border-tertiary",
      shadowClass: "blue-shadow",
      timeText: "Tomorrow, 10:00 AM",
      timeIcon: "calendar_month",
      completed: false,
      priority: "personal",
      footerIcon: "celebration",
      footerIconClass: "text-tertiary",
      filledNotification: false,
    },
    {
      id: "toggle5",
      title: "Afternoon yoga session",
      category: "Health",
      categoryBadgeClass: "bg-secondary-container text-on-secondary-container",
      borderColorClass: "border-secondary",
      shadowClass: "purple-shadow",
      timeText: "Repeats Daily",
      timeIcon: "history",
      completed: false,
      priority: "personal",
      footerIcon: "self_improvement",
      footerIconClass: "text-secondary",
      filledNotification: true,
    },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    const handleSearch = (e: Event) => {
      setSearchQuery((e as CustomEvent).detail || "");
    };
    const handleOpenNewEntry = () => {
      setFormTitle("");
      setFormCategory("High Priority");
      setFormTime("Due Today, 5:00 PM");
      setFormNotify(true);
      setIsModalOpen(true);
    };
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    window.addEventListener("reminders-search", handleSearch);
    window.addEventListener("open-new-entry-modal", handleOpenNewEntry);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("reminders-search", handleSearch);
      window.removeEventListener("open-new-entry-modal", handleOpenNewEntry);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadApiReminders() {
      try {
        const res = await api.getDashboardSummary();
        if (res && res.active_reminders && res.active_reminders.length > 0) {
          const apiItems: ReminderItem[] = res.active_reminders.map((rem) => {
            const isDone = rem.status === "completed";
            const dtText = rem.trigger_time
              ? new Date(rem.trigger_time).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Scheduled";
            return {
              id: rem.id,
              title: rem.title,
              category: "API Reminder",
              categoryBadgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
              borderColorClass: "border-primary",
              shadowClass: "pink-shadow",
              timeText: dtText,
              timeIcon: "schedule",
              completed: isDone,
              priority: "high",
              footerIcon: "cloud",
              footerIconClass: "text-primary",
              filledNotification: true,
            };
          });
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newToAdd = apiItems.filter((i) => !existingIds.has(i.id));
            return [...newToAdd, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not fetch reminders from API:", err);
      }
    }
    loadApiReminders();
  }, []);

  const toggleItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          showToast(
            nextState
              ? `Completed: "${item.title}"`
              : `Marked incomplete: "${item.title}"`
          );
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
    try {
      if (
        !id.startsWith("toggle") &&
        !id.startsWith("ai-") &&
        !id.startsWith("rem-")
      ) {
        await api.completeReminder(id);
      }
    } catch (err) {
      console.warn("API completion sync failed:", err);
    }
  };

  const toggleNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextNotify = !item.filledNotification;
          showToast(
            nextNotify
              ? "Notifications alert enabled"
              : "Notifications alert muted"
          );
          return { ...item, filledNotification: nextNotify };
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`Deleted reminder: "${target?.title || "Reminder"}"`);
  };

  const startEditing = (item: ReminderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormTime(item.timeText);
    setFormNotify(item.filledNotification || false);
    setIsEditModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setFormTitle("");
    setFormCategory("High Priority");
    setFormTime("Due Today, 5:00 PM");
    setFormNotify(true);
    setIsModalOpen(true);
  };

  const getStylingForCategory = (cat: string) => {
    if (cat === "High Priority" || cat === "Work" || cat === "API Reminder") {
      return {
        categoryBadgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
        borderColorClass: "border-primary",
        shadowClass: "pink-shadow",
        priority: "high" as const,
        footerIcon: "flag",
        footerIconClass: "text-primary",
        avatarText: undefined,
      };
    } else if (
      cat === "Personal" ||
      cat === "Weekly" ||
      cat === "Daily Routine"
    ) {
      return {
        categoryBadgeClass:
          "bg-secondary-container text-on-secondary-container",
        borderColorClass: "border-secondary",
        shadowClass: "purple-shadow",
        priority: "personal" as const,
        footerIcon: undefined,
        footerIconClass: undefined,
        avatarText: "ME",
      };
    } else if (cat === "Health" || cat === "Wellness") {
      return {
        categoryBadgeClass:
          "bg-tertiary-fixed text-on-tertiary-fixed-variant",
        borderColorClass: "border-tertiary",
        shadowClass: "blue-shadow",
        priority: "personal" as const,
        footerIcon: "self_improvement",
        footerIconClass: "text-tertiary",
        avatarText: undefined,
      };
    } else {
      return {
        categoryBadgeClass:
          "bg-secondary-container text-on-secondary-container",
        borderColorClass: "border-secondary",
        shadowClass: "purple-shadow",
        priority: "regular" as const,
        footerIcon: "celebration",
        footerIconClass: "text-secondary",
        avatarText: undefined,
      };
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Please enter a reminder title");
      return;
    }
    const styling = getStylingForCategory(formCategory);
    const newItem: ReminderItem = {
      id: "rem-local-" + Date.now(),
      title: formTitle.trim(),
      category: formCategory,
      ...styling,
      timeText: formTime.trim() || "Due Soon",
      timeIcon:
        formTime.toLowerCase().includes("repeat") ||
        formTime.toLowerCase().includes("every")
          ? "history"
          : "calendar_month",
      completed: false,
      filledNotification: formNotify,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    showToast(`Created new reminder: "${newItem.title}"`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formTitle.trim()) {
      showToast("Please enter a reminder title");
      return;
    }
    const styling = getStylingForCategory(formCategory);
    setItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle.trim(),
              category: formCategory,
              ...styling,
              timeText: formTime.trim() || "Due Soon",
              timeIcon:
                formTime.toLowerCase().includes("repeat") ||
                formTime.toLowerCase().includes("every")
                  ? "history"
                  : "calendar_month",
              filledNotification: formNotify,
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setEditingItem(null);
    showToast(`Updated reminder: "${formTitle.trim()}"`);
  };

  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q) &&
        !item.timeText.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (activeFilter === "High Priority") return item.priority === "high";
    if (activeFilter === "Personal") return item.priority === "personal";
    if (activeFilter === "Completed") return item.completed;
    return true; // "All Tasks"
  });

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary mb-2">
            Reminders
          </h1>
          <p className="text-on-surface-variant font-body">
            Don&apos;t let the important stuff slip away.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-between w-full md:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveFilter("All Tasks")}
              className={`px-5 py-2 rounded-full font-medium text-sm bouncy-hover whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "All Tasks"
                  ? "bg-primary text-on-primary pink-shadow font-bold"
                  : "bg-white dark:bg-surface-container border-2 border-outline-variant text-on-surface-variant hover:border-primary"
              }`}
            >
              All Tasks ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter("High Priority")}
              className={`px-5 py-2 rounded-full font-medium text-sm bouncy-hover whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "High Priority"
                  ? "bg-secondary text-white purple-shadow font-bold"
                  : "bg-white dark:bg-surface-container border-2 border-secondary/20 text-secondary hover:bg-secondary/5"
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setActiveFilter("Personal")}
              className={`px-5 py-2 rounded-full font-medium text-sm bouncy-hover whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "Personal"
                  ? "bg-tertiary text-white blue-shadow font-bold"
                  : "bg-white dark:bg-surface-container border-2 border-tertiary/20 text-tertiary hover:bg-tertiary/5"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveFilter("Completed")}
              className={`px-5 py-2 rounded-full font-medium text-sm bouncy-hover whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "Completed"
                  ? "bg-on-surface-variant text-white shadow-md font-bold"
                  : "bg-white dark:bg-surface-container border-2 border-outline-variant text-on-surface-variant hover:border-on-surface-variant"
              }`}
            >
              Completed ({items.filter((i) => i.completed).length})
            </button>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="px-6 py-2 rounded-full font-bold text-sm bg-primary text-white pink-shadow bouncy-hover transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Reminders Grid (Bento Style Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              opacity: item.completed ? 0.65 : 1,
              filter: item.completed ? "grayscale(0.3)" : "none",
            }}
            className={`group bg-white dark:bg-surface-container p-6 rounded-2xl border-l-8 ${item.borderColorClass} ${item.shadowClass} relative flex flex-col justify-between h-64 bouncy-hover transition-all duration-300 border border-outline-variant/30`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.categoryBadgeClass}`}
                >
                  {item.category}
                </span>
                <div className="flex gap-1.5 relative">
                  <button
                    onClick={(e) => toggleNotification(item.id, e)}
                    title={
                      item.filledNotification
                        ? "Mute alert"
                        : "Enable alert"
                    }
                    className={`material-symbols-outlined transition-colors cursor-pointer p-1 rounded-full hover:bg-surface-variant/40 ${
                      item.borderColorClass === "border-primary"
                        ? "text-primary/70 hover:text-primary"
                        : item.borderColorClass === "border-tertiary"
                        ? "text-tertiary/70 hover:text-tertiary"
                        : "text-secondary/70 hover:text-secondary"
                    }`}
                    style={{
                      fontVariationSettings: item.filledNotification
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    {item.filledNotification
                      ? "notifications_active"
                      : "notifications"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === item.id ? null : item.id
                      );
                    }}
                    title="More options"
                    className="material-symbols-outlined text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer p-1 rounded-full hover:bg-surface-variant/40"
                  >
                    more_vert
                  </button>

                  {/* Dropdown Options Menu */}
                  {openMenuId === item.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 w-44 bg-white dark:bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant/30 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        onClick={(e) => startEditing(item, e)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                        <span>Edit Reminder</span>
                      </button>
                      <button
                        onClick={(e) => toggleNotification(item.id, e)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          {item.filledNotification
                            ? "notifications_off"
                            : "notifications"}
                        </span>
                        <span>
                          {item.filledNotification
                            ? "Mute Alert"
                            : "Enable Alert"}
                        </span>
                      </button>
                      <div className="border-t border-outline-variant/20 my-1"></div>
                      <button
                        onClick={(e) => deleteItem(item.id, e)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                        <span>Delete Reminder</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3
                onClick={(e) => startEditing(item, e)}
                className={`text-xl font-bold text-on-surface transition-colors leading-tight cursor-pointer ${
                  item.completed ? "line-through opacity-75" : ""
                } ${
                  item.borderColorClass === "border-primary"
                    ? "hover:text-primary"
                    : item.borderColorClass === "border-tertiary"
                    ? "hover:text-tertiary"
                    : "hover:text-secondary"
                }`}
                title="Click to edit reminder"
              >
                {item.title}
              </h3>
              <p className="text-on-surface-variant text-sm mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">
                  {item.timeIcon}
                </span>
                {item.timeText}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
              <div
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-2.5 cursor-pointer group/toggle select-none"
              >
                <div className="relative inline-block w-10 h-6 transition duration-200 ease-in shrink-0">
                  <input
                    id={`check-${item.id}`}
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-surface-variant appearance-none cursor-pointer z-10 transition-transform duration-200 checked:translate-x-4 checked:border-primary"
                  />
                  <label
                    htmlFor={`check-${item.id}`}
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer transition-colors duration-200"
                  ></label>
                </div>
                <span className="text-xs font-bold text-on-surface-variant group-hover/toggle:text-primary uppercase transition-colors">
                  {item.completed ? "Done" : "Mark Done"}
                </span>
              </div>
              {item.avatarText ? (
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                    {item.avatarText}
                  </div>
                </div>
              ) : item.footerIcon ? (
                <span
                  className={`material-symbols-outlined ${item.footerIconClass}`}
                >
                  {item.footerIcon}
                </span>
              ) : null}
            </div>
          </div>
        ))}


      </div>

      {/* Empty State Example - ONLY shows when NO items match the current filter */}
      {filteredItems.length === 0 && (
        <div className="mt-20 flex flex-col items-center text-center animate-fade-in">
          <div className="w-64 h-64 mb-8">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcRNddg32oH9Lee9iShrbBUSjla6ZJtKbgigoliRz8HzUmQXNfKQVS4wu-AWWZNcVbSrmxsRgX5rE-ZZuAmPiAWgLm_eAtefhSXi3N0Cfe5qQhTQxzCOoWIkYGKYWSrVaZ8kDmj7yFCUFR8zs6H0kVt3WkFQxP4MO4vcCG3s9ct54fdZeD9rAmjzsjdU0xXrFtrL2gaM3R1zTiyStGQMhB-GK-Z3sbCcEud3zJqEl0TgSwkLh_76Hlgw"
              alt="All Caught Up Garden"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-2">
            {searchQuery ? "No matching reminders found!" : "No reminders found here!"}
          </h2>
          <p className="text-on-surface-variant max-w-sm mb-8 text-sm">
            {searchQuery
              ? `We couldn't find any reminders matching "${searchQuery}". Try a different search term or add a new one.`
              : "You don't have any reminders in this view. Take a moment to breathe or add a new reminder."}
          </p>
          <button
            onClick={handleOpenNewModal}
            className="px-8 py-3 bg-primary text-on-primary rounded-full font-black shadow-lg shadow-primary/20 bouncy-hover cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Create New Reminder</span>
          </button>
        </div>
      )}

      {/* New Reminder Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-surface-container-high rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add_alert</span>
                </div>
                <h2 className="text-2xl font-headline font-black text-on-surface">
                  New Reminder
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Review quarterly performance metrics..."
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Category &amp; Priority
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm cursor-pointer"
                >
                  <option value="High Priority">
                    High Priority (Work / Urgent)
                  </option>
                  <option value="Personal">Personal (Weekly / Daily)</option>
                  <option value="Health">Health &amp; Wellness</option>
                  <option value="Social">Social &amp; Events</option>
                  <option value="General">General Task</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Due Time / Schedule
                </label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="e.g. Due Today, 4:00 PM or Every Sunday"
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  id="formNotify"
                  type="checkbox"
                  checked={formNotify}
                  onChange={(e) => setFormNotify(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <label
                  htmlFor="formNotify"
                  className="text-sm font-medium text-on-surface cursor-pointer select-none"
                >
                  Enable alert notification icon
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 rounded-full font-bold text-sm bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-full font-bold text-sm bg-primary text-white pink-shadow hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
                  <span>Add Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Reminder Modal */}
      {isEditModalOpen && editingItem && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-surface-container-high rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <h2 className="text-2xl font-headline font-black text-on-surface">
                  Edit Reminder
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Category &amp; Priority
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm cursor-pointer"
                >
                  <option value="High Priority">
                    High Priority (Work / Urgent)
                  </option>
                  <option value="Personal">Personal (Weekly / Daily)</option>
                  <option value="Health">Health &amp; Wellness</option>
                  <option value="Social">Social &amp; Events</option>
                  <option value="General">General Task</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Due Time / Schedule
                </label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  id="editFormNotify"
                  type="checkbox"
                  checked={formNotify}
                  onChange={(e) => setFormNotify(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <label
                  htmlFor="editFormNotify"
                  className="text-sm font-medium text-on-surface cursor-pointer select-none"
                >
                  Enable alert notification icon
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-5 py-3 rounded-full font-bold text-sm bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-full font-bold text-sm bg-primary text-white pink-shadow hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    save
                  </span>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

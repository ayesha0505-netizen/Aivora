"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, DashboardSummaryResponse } from "@/lib/api";


export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal State
  const [activeModal, setActiveModal] = useState<"note" | "shopping" | "event" | "expense" | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalTime, setModalTime] = useState("12:00");
  const [modalType, setModalType] = useState("generic");
  const [modalLocation, setModalLocation] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAmount, setModalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.getDashboardSummary();
        setData(res);
      } catch (err: unknown) {
        console.error("API error while fetching dashboard:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();

    const handleOpenNewEntry = () => {
      setActiveModal("note");
      setModalTitle("");
      setModalContent("");
    };

    window.addEventListener("open-new-entry-modal", handleOpenNewEntry);
    return () => window.removeEventListener("open-new-entry-modal", handleOpenNewEntry);
  }, []);

  const handleToggleShopping = async (itemId: string) => {
    if (!data) return;
    const updatedItems = data.shopping_items.map((item) =>
      item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
    );
    const newData = { ...data, shopping_items: updatedItems };
    setData(newData);
    try {
      await api.toggleShoppingItem(itemId);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeModal === "note" && modalTitle) {
        await api.createNote(modalTitle, modalContent);
      } else if (activeModal === "shopping" && modalTitle) {
        await api.createShoppingItem(modalTitle);
      } else if (activeModal === "event" && modalTitle) {
        const todayStr = new Date().toISOString().split("T")[0];
        const eventIso = new Date(`${todayStr}T${modalTime}:00`).toISOString();
        await api.createEvent(modalTitle, eventIso, modalDesc, modalLocation, modalType);
      } else if (activeModal === "expense" && modalAmount) {
        await api.createExpense(parseFloat(modalAmount), modalTitle);
      }
      const res = await api.getDashboardSummary();
      setData(res);
      setActiveModal(null);
    } catch (err) {
      console.error("Error creating entry:", err);
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for styling event types and colors
  const getEventStyling = (index: number, eventType: string) => {
    const styles = [
      {
        bg: "bg-tertiary-fixed/40 border-l-4 border-tertiary",
        textVariant: "text-on-tertiary-fixed-variant",
        textMain: "text-on-tertiary-fixed",
        iconColor: "text-tertiary",
      },
      {
        bg: "bg-secondary-fixed/40 border-l-4 border-secondary",
        textVariant: "text-on-secondary-fixed-variant",
        textMain: "text-on-secondary-fixed",
        iconColor: "text-secondary",
      },
      {
        bg: "bg-primary-fixed/30/40 border-l-4 border-primary",
        textVariant: "text-on-primary-fixed-variant",
        textMain: "text-on-primary-fixed",
        iconColor: "text-primary",
      },
    ];
    const style = styles[index % styles.length];

    let icon = "event";
    if (eventType === "video") icon = "videocam";
    else if (eventType === "restaurant") icon = "restaurant";
    else if (eventType === "fitness") icon = "fitness_center";

    return { ...style, icon };
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = ((hours + 11) % 12 + 1).toString().padStart(2, "0");
      const displayMinutes = minutes.toString().padStart(2, "0");
      return { time: `${displayHours}:${displayMinutes}`, period };
    } catch {
      return { time: "09:00", period: "AM" };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "2 hours ago";
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch {
      return "2 hours ago";
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-pulse">
        <div className="h-24 bg-surface-variant/40 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 h-80 bg-surface-variant/40 rounded-lg"></div>
          <div className="md:col-span-5 h-80 bg-surface-variant/40 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="bg-error/10 border border-error/20 p-6 rounded-xl text-center">
          <p className="text-error font-bold mb-2">Notice: Unable to display dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const spentPercent = Math.min(
    100,
    data.budget_weekly_limit > 0 ? Math.round((data.budget_spent_this_week / data.budget_weekly_limit) * 100) : 75
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 relative">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-background tracking-tight">
            Morning, <span className="text-primary italic">{data.user_name}</span>.
          </h2>
          <p className="text-on-background-variant text-lg font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">calendar_month</span>
            {data.current_date}
          </p>
        </div>
        <div className="bg-primary-fixed/30 p-4 rounded-xl flex items-start gap-4 max-w-md glass-card tinted-shadow-primary animate-in fade-in slide-in-from-right-4 duration-1000">
          <div className="p-2 rounded-full bg-primary text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            &quot;{data.ai_insight}&quot;
          </p>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Today's Schedule (Large Focus) */}
        <div className="md:col-span-6 bg-white rounded-lg p-6 shadow-sm border border-surface-variant bouncy-hover">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">event</span> Today&apos;s Schedule
            </h3>
            <span className="text-xs font-bold text-on-background-variant bg-surface-variant px-3 py-1 rounded-full">
              {data.schedule_events.length} EVENTS
            </span>
          </div>
          <div className="space-y-4">
            {data.schedule_events.length === 0 ? (
              <p className="text-sm text-on-background-variant italic py-4">No events scheduled for today.</p>
            ) : (
              data.schedule_events.map((evt, idx) => {
                const style = getEventStyling(idx, evt.event_type);
                const { time, period } = formatTime(evt.event_time);
                return (
                  <div key={evt.id} className={`flex items-center gap-4 p-4 rounded-2xl ${style.bg}`}>
                    <div className="text-center min-w-[60px]">
                      <p className={`text-xs font-bold ${style.textVariant} uppercase`}>{time}</p>
                      <p className={`text-lg font-black ${style.textMain}`}>{period}</p>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-on-background">{evt.title}</h4>
                      {evt.description && <p className="text-xs text-on-background-variant">{evt.description}</p>}
                    </div>
                    <span className={`material-symbols-outlined ${style.iconColor}`}>{style.icon}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions (Column) */}
        <div className="md:col-span-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => router.push("/assistant")}
            className="relative h-32 rounded-2xl bg-gradient-to-br from-primary to-primary-fixed text-on-primary flex flex-col items-center justify-center gap-3 bouncy-hover tinted-shadow-primary cursor-pointer overflow-hidden group border border-primary/20"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <span className="material-symbols-outlined text-4xl relative z-10 drop-shadow-md">mic</span>
            <span className="font-bold relative z-10 tracking-wide text-sm">Speak to AI</span>
          </button>
          <button
            onClick={() => {
              setActiveModal("note");
              setModalTitle("");
              setModalContent("");
            }}
            className="relative h-32 rounded-2xl bg-gradient-to-br from-tertiary to-tertiary-fixed text-on-tertiary flex flex-col items-center justify-center gap-3 bouncy-hover tinted-shadow-tertiary cursor-pointer overflow-hidden group border border-tertiary/20"
            style={{ boxShadow: "0 8px 24px -4px rgba(0, 150, 204, 0.2)" }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <span className="material-symbols-outlined text-4xl relative z-10 drop-shadow-md">add_box</span>
            <span className="font-bold relative z-10 tracking-wide text-sm">Log Activity</span>
          </button>
          <button
            onClick={() => {
              setActiveModal("event");
              setModalTitle("");
              setModalTime("12:00");
              setModalDesc("");
              setModalLocation("");
              setModalType("generic");
            }}
            className="relative h-32 rounded-2xl bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/60 flex flex-col items-center justify-center gap-3 bouncy-hover cursor-pointer group hover:bg-surface-container-high transition-colors overflow-hidden"
          >
            <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="material-symbols-outlined text-4xl text-secondary group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">map</span>
            <span className="font-bold text-on-background text-sm">Travel Mode</span>
          </button>
          <button
            onClick={() => {
              setActiveModal("shopping");
              setModalTitle("");
            }}
            className="relative h-32 rounded-2xl bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/60 flex flex-col items-center justify-center gap-3 bouncy-hover cursor-pointer group hover:bg-surface-container-high transition-colors overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">shopping_cart</span>
            <span className="font-bold text-on-background text-sm">Buy List</span>
          </button>
        </div>

        {/* Budget Summary (Small Glass Card) */}
        <div
          onClick={() => {
            setActiveModal("expense");
            setModalTitle("");
            setModalAmount("");
          }}
          className="md:col-span-4 glass-card bg-white/70 p-6 rounded-lg bouncy-hover cursor-pointer group"
          title="Click to log an expense"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-on-background-variant flex items-center gap-2 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-secondary">payments</span> Budget
            </h3>
            <span className="material-symbols-outlined text-on-background-variant group-hover:translate-x-1 transition-transform">trending_up</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-on-background-variant uppercase">Spent this week</p>
            <p className="text-3xl font-black text-on-background">
              ${data.budget_spent_this_week.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-4 h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${spentPercent}%` }}></div>
          </div>
          <p className="mt-2 text-xs font-medium text-on-background-variant">
            {spentPercent}% of your ${data.budget_weekly_limit.toLocaleString()} weekly limit
          </p>
        </div>

        {/* Recent Trips (Map integration feel) */}
        {data.upcoming_trip ? (
          <div className="md:col-span-8 bg-primary-fixed/30est rounded-lg overflow-hidden relative group bouncy-hover min-h-[180px]">
            <div className="absolute inset-0 z-0">
              <Image
                className="object-cover"
                fill
                alt={`Minimalist map of ${data.upcoming_trip.destination}`}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEC_Kgyv7J-Pj1-XRNr0xqe2HDBjmjmqlHoMJ9m3ucdFgnrjBrE7GpIFxLafaybydzLbCtJFP6ioNcDWIMJwTLI8d3UEY9rHzBA6fgoJN6qHf8Vcrmk3X6jofnz-8o4S3CwrlN091CasVe0SlNABmrexym8DTs_E003mbGb4yB7objolpvagz2Bx12GRJkxHA_H_gpZPMYa14thfOPMEWzkmScHiru5J2RSklbVFIJtyjVF-3fhlGy5A"
                unoptimized
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest via-surface-container-highest/60 to-transparent z-10 p-6 flex flex-col justify-center">
              <div className="relative z-20 space-y-2">
                <span className="bg-primary text-on-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Upcoming Trip</span>
                <h3 className="text-2xl font-black text-on-background">{data.upcoming_trip.destination}</h3>
                <p className="text-sm font-medium text-on-background-variant max-w-xs">
                  {data.upcoming_trip.start_date} - {data.upcoming_trip.end_date}. {data.upcoming_trip.bookings_count} bookings confirmed by Aivora Assistant.
                </p>
                <button
                  onClick={() => router.push("/assistant")}
                  className="mt-2 text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                >
                  View Full Itinerary <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 bg-primary-fixed/30 rounded-lg p-6 flex flex-col justify-center items-center text-center bouncy-hover min-h-[180px]">
            <span className="material-symbols-outlined text-4xl text-on-background-variant mb-2">flight_takeoff</span>
            <h3 className="text-lg font-bold text-on-background">No Upcoming Trips</h3>
            <p className="text-xs text-on-background-variant max-w-sm mt-1">Ask Aivora Assistant to plan your next vacation or business trip in seconds.</p>
          </div>
        )}

        {/* Recent Notes (Bento List) */}
        <div className="md:col-span-4 bg-white p-6 rounded-lg border border-surface-variant bouncy-hover flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span> Recent Notes
            </h3>
            <div className="space-y-4">
              {data.recent_notes.length === 0 ? (
                <p className="text-xs text-on-background-variant italic">No recent notes found.</p>
              ) : (
                data.recent_notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveModal("note");
                      setModalTitle(note.title);
                      setModalContent(note.content || "");
                    }}
                    className="group cursor-pointer"
                  >
                    <h4 className="font-bold text-on-background group-hover:text-primary transition-colors">{note.title}</h4>
                    {note.content && <p className="text-xs text-on-background-variant line-clamp-1">{note.content}</p>}
                    <p className="text-[10px] mt-1 font-bold text-outline uppercase tracking-tight">{formatRelativeTime(note.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setActiveModal("note");
              setModalTitle("");
              setModalContent("");
            }}
            className="mt-6 w-full py-2 border-2 border-dashed border-primary-fixed text-primary font-bold rounded-xl hover:bg-primary-fixed/30/20 transition-all text-sm cursor-pointer"
          >
            + Add New Note
          </button>
        </div>

        {/* Shopping Preview & Reminders (Split) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-tertiary-container/10 p-6 rounded-lg border border-tertiary-fixed-dim/30 bouncy-hover flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-tertiary flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span> Shopping
              </h3>
              <span className="text-xs font-bold text-tertiary">{data.shopping_items.length} ITEMS</span>
            </div>
            <div className="space-y-2 flex-1">
              {data.shopping_items.length === 0 ? (
                <p className="text-xs text-on-background-variant italic">Shopping list is empty.</p>
              ) : (
                data.shopping_items.slice(0, 4).map((item) => (
                  <label
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleShopping(item.id);
                    }}
                    className={`flex items-center gap-3 cursor-pointer group ${item.is_completed ? "opacity-50" : ""}`}
                  >
                    {item.is_completed ? (
                      <div className="w-5 h-5 rounded-md bg-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-on-tertiary">check</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-tertiary/40 group-hover:border-tertiary transition-all"></div>
                    )}
                    <span className={`text-sm font-medium text-on-background ${item.is_completed ? "line-through" : ""}`}>{item.name}</span>
                  </label>
                ))
              )}
            </div>
            <button
              onClick={() => {
                setActiveModal("shopping");
                setModalTitle("");
              }}
              className="mt-4 text-xs font-bold text-tertiary text-left cursor-pointer hover:underline"
            >
              + Add shopping item
            </button>
          </div>

          <div className="bg-secondary-container/10 p-6 rounded-lg border border-secondary-fixed-dim/30 bouncy-hover flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined">notification_important</span> Reminders
              </h3>
              <span className="text-xs font-bold text-secondary">DUE SOON</span>
            </div>
            <div className="space-y-3">
              {data.active_reminders.length === 0 ? (
                <p className="text-xs text-on-background-variant italic">No pending reminders.</p>
              ) : (
                data.active_reminders.slice(0, 3).map((rem, idx) => (
                  <div
                    key={rem.id}
                    onClick={async () => {
                      try {
                        await api.completeReminder(rem.id);
                        const res = await api.getDashboardSummary();
                        setData(res);
                      } catch (err) {
                        console.error("Failed to complete reminder:", err);
                      }
                    }}
                    className="flex items-start gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-secondary/10 transition-colors"
                    title="Click to complete reminder"
                  >
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5 group-hover:text-primary transition-colors">
                      {idx === 0 ? "priority_high" : "update"}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-on-background group-hover:line-through transition-all">{rem.title}</p>
                      <p className={`text-[10px] font-bold ${idx === 0 ? "text-error" : "text-on-background-variant"}`}>
                        {new Date(rem.trigger_time).toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <button
        onClick={() => {
          setActiveModal("note");
          setModalTitle("");
          setModalContent("");
        }}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl shadow-primary/40 z-40 bouncy-hover cursor-pointer"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>

      {/* Quick Creation Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
              <h3 className="text-xl font-black font-headline text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {activeModal === "note" && "edit_note"}
                  {activeModal === "shopping" && "shopping_bag"}
                  {activeModal === "event" && "event"}
                  {activeModal === "expense" && "payments"}
                </span>
                {activeModal === "note" && "New Note / Activity"}
                {activeModal === "shopping" && "Add to Buy List"}
                {activeModal === "event" && "Schedule Event"}
                {activeModal === "expense" && "Log Expense"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-on-background-variant hover:text-on-background p-1 rounded-full hover:bg-surface-variant/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {activeModal === "shopping" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Avocados (x3)"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              )}

              {activeModal === "note" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gift Ideas for Leo"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Content / Checklist</label>
                    <textarea
                      rows={3}
                      placeholder="Write your note details here..."
                      value={modalContent}
                      onChange={(e) => setModalContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium resize-none"
                    ></textarea>
                  </div>
                </>
              )}

              {activeModal === "event" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lunch with Michael"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={modalTime}
                        onChange={(e) => setModalTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Type</label>
                      <select
                        value={modalType}
                        onChange={(e) => setModalType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium bg-white"
                      >
                        <option value="generic">Generic</option>
                        <option value="video">Video Call</option>
                        <option value="restaurant">Restaurant / Dining</option>
                        <option value="fitness">Gym / Fitness</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Location (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Soho or Zoom"
                      value={modalLocation}
                      onChange={(e) => setModalLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Meeting notes or link"
                      value={modalDesc}
                      onChange={(e) => setModalDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </>
              )}

              {activeModal === "expense" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 45.00"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-background-variant mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Grocery shopping or Dinner"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-background-variant font-bold text-sm hover:bg-surface-variant/30 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

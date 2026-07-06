"use client";

import React, { useState } from "react";
import { api } from "../../lib/api";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  category: string;
  badgeClass: string;
  items: ChecklistItem[];
  pinned: boolean;
}

export function AivoraList() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  const [newChkTitle, setNewChkTitle] = useState("");
  const [newChkCat, setNewChkCat] = useState("General Task");
  const [newChkItemText, setNewChkItemText] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChkTitle.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await api.generateChecklist(newChkTitle);
      setChecklists([
        {
          id: "chk-" + Date.now(),
          title: generated.title,
          category: generated.category || newChkCat,
          badgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
          pinned: false,
          items: generated.items,
        },
        ...checklists,
      ]);
      setNewChkTitle("");
    } catch (err) {
      console.error("AI list generation failed:", err);
      setChecklists([
        {
          id: "chk-" + Date.now(),
          title: newChkTitle,
          category: newChkCat,
          badgeClass: "bg-primary-fixed text-on-primary-fixed-variant",
          pinned: false,
          items: [
            { id: "init-1", text: "First action item", completed: false },
            { id: "init-2", text: "Second action item", completed: false },
          ],
        },
        ...checklists,
      ]);
      setNewChkTitle("");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleChecklistItem = (chkId: string, itemId: string) => {
    setChecklists(
      checklists.map((chk) =>
        chk.id === chkId
          ? {
              ...chk,
              items: chk.items.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)),
            }
          : chk
      )
    );
  };

  const addChecklistItem = (chkId: string) => {
    const text = newChkItemText[chkId]?.trim();
    if (!text) return;

    setChecklists(
      checklists.map((chk) =>
        chk.id === chkId
          ? {
              ...chk,
              items: [...chk.items, { id: "item-" + Date.now(), text, completed: false }],
            }
          : chk
      )
    );

    setNewChkItemText({ ...newChkItemText, [chkId]: "" });
  };

  const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null);

  const handleAiBreakdown = async (chkId: string) => {
    const chk = checklists.find(c => c.id === chkId);
    if (!chk) return;
    
    setIsBreakingDown(chkId);
    try {
      const prompt = `Give me 3 sub-tasks or action items for a checklist titled "${chk.title}" in category "${chk.category}".`;
      const generated = await api.generateChecklist(prompt);
      
      setChecklists(
        checklists.map((c) =>
          c.id === chkId
            ? {
                ...c,
                items: [
                  ...c.items,
                  ...generated.items,
                ],
              }
            : c
        )
      );
    } catch (err) {
      console.error("AI breakdown failed", err);
      setChecklists(
        checklists.map((c) =>
          c.id === chkId
            ? {
                ...c,
                items: [
                  ...c.items,
                  { id: "ai-1-" + Date.now(), text: "AI Suggestion: Verify backup cloud storage", completed: false },
                  { id: "ai-2-" + Date.now(), text: "AI Suggestion: Set calendar notification reminder", completed: false },
                ],
              }
            : c
        )
      );
    } finally {
      setIsBreakingDown(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-black text-primary mb-2">My Checklists</h1>
        <p className="text-on-surface-variant font-body">Organize your structured checklists with AI assistance.</p>
      </div>

      <div className="animate-fade-in">
        {/* Create Checklist Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm mb-10">
          <h3 className="text-xl font-headline font-black text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">playlist_add</span>
            <span>Create New Checklist</span>
          </h3>
          <form onSubmit={handleCreateChecklist} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              required
              placeholder="Checklist Title (e.g., Weekly Workout Plan, Grocery List)..."
              value={newChkTitle}
              onChange={(e) => setNewChkTitle(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-variant/10 text-sm font-bold outline-none focus:bg-white focus:border-primary"
            />
            <select
              value={newChkCat}
              onChange={(e) => setNewChkCat(e.target.value)}
              className="px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-variant/10 text-sm font-bold outline-none focus:bg-white focus:border-primary w-full sm:w-48"
            >
              <option value="General Task">General Task</option>
              <option value="Travel Prep">Travel Prep</option>
              <option value="Work & Tech">Work & Tech</option>
              <option value="Chore List">Chore List</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              )}
              <span>{isGenerating ? "Generating..." : "AI Generate"}</span>
            </button>
          </form>
        </div>

        {/* Checklists Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {checklists.map((chk) => {
            const totalItems = chk.items.length;
            const compItems = chk.items.filter((i) => i.completed).length;
            const pct = totalItems > 0 ? Math.round((compItems / totalItems) * 100) : 0;
            const allDone = totalItems > 0 && compItems === totalItems;

            return (
              <div
                key={chk.id}
                className={`bg-white p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  allDone ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10" : "border-outline-variant/30"
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${chk.badgeClass}`}>
                        {chk.category}
                      </span>
                      {allDone && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 animate-pulse">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span>All Completed</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAiBreakdown(chk.id)}
                      disabled={isBreakingDown === chk.id}
                      className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      title="AI will generate actionable sub-tasks"
                    >
                      {isBreakingDown === chk.id ? (
                        <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      )}
                      <span>AI Breakdown</span>
                    </button>
                  </div>

                  <h4 className="text-2xl font-black text-on-surface mb-3 leading-tight">{chk.title}</h4>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className={allDone ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-primary"}>
                        {compItems} of {totalItems} completed ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Checkbox Items */}
                  <div className="space-y-2.5 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {chk.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(chk.id, item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          item.completed
                            ? "bg-surface-variant/30 border-transparent opacity-60 line-through text-on-surface-variant"
                            : "bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40 text-on-surface font-medium shadow-2xs"
                        }`}
                      >
                        <div className="relative inline-block w-6 h-6 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}}
                            className="w-6 h-6 rounded-md text-primary focus:ring-primary border-outline-variant cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="text-sm flex-1 leading-snug">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Sub-Task Input */}
                <div className="pt-4 border-t border-outline-variant/20 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new checklist task..."
                    value={newChkItemText[chk.id] || ""}
                    onChange={(e) => setNewChkItemText({ ...newChkItemText, [chk.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem(chk.id);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-variant/20 text-xs font-medium outline-none focus:bg-white focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => addChecklistItem(chk.id)}
                    className="px-4 py-2 bg-surface-variant hover:bg-primary hover:text-white text-on-surface-variant rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

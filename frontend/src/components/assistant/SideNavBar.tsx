"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProfileMenu } from "@/components/layout/SidebarProfileMenu";

export interface Conversation {
  id: string;
  title: string;
  time: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  filled?: boolean;
  subItems?: { id: string; label: string; href: string; icon: string }[];
}

interface SideNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onNewEntry?: () => void;
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string, e: React.MouseEvent) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function SideNavBar({
  activeTab = "assistant",
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
  onNewEntry,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isSidebarOpen = true,
  onToggleSidebar,
}: SideNavBarProps) {
  const pathname = usePathname() || "";
  const [listOpen, setListOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "apps">("chats");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = (conversations || []).filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard" },
    { id: "assistant", label: "AI Assistant", icon: "smart_toy", href: "/assistant", filled: true },
    { id: "calendar", label: "Calendar", icon: "calendar_today", href: "/calendar" },
    { id: "notes", label: "Notes", icon: "description", href: "/notes" },
    { id: "reminders", label: "Reminders", icon: "notifications", href: "/reminders" },
    { id: "weather", label: "Weather", icon: "partly_cloudy_day", href: "/weather" },
    { id: "budget", label: "Budget Planner", icon: "account_balance_wallet", href: "/budget" },
    { id: "diary", label: "Personal Diary", icon: "auto_stories", href: "/diary" },
    {
      id: "list",
      label: "List",
      icon: "list_alt",
      href: "/list",
      subItems: [
        { id: "simple-note", label: "Simple Note", href: "/list?tab=note", icon: "note" },
        { id: "checklist", label: "Checklist", href: "/list?tab=checklist", icon: "check_box" },
      ],
    },
  ];

  const bottomItems: { id: string; label: string; icon: string; href: string }[] = [];

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    if (id === "assistant" && onTabChange) {
      e.preventDefault();
      onTabChange(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="h-full flex flex-col p-4 bg-surface-container-low dark:bg-surface-container-lowest w-64 shadow-lg shadow-primary/5 border-r border-outline-variant/30">


      <button
        onClick={onNewEntry}
        className="mb-4 w-full flex items-center justify-start gap-3 py-2.5 px-4 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl font-bold border border-outline-variant/30 transition-colors group shrink-0 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">
          add_comment
        </span>
        New Chat
      </button>

      {conversations !== undefined && (
        <div className="flex bg-surface-container-high rounded-full p-1 mb-3 border border-outline-variant/30 shrink-0">
          <button
            onClick={() => setSidebarTab("chats")}
            className={`flex-1 py-1.5 px-3 rounded-full text-label-md font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sidebarTab === "chats"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Chats</span>
          </button>
          <button
            onClick={() => setSidebarTab("apps")}
            className={`flex-1 py-1.5 px-3 rounded-full text-label-md font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sidebarTab === "apps"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">apps</span>
            <span>Apps</span>
          </button>
        </div>
      )}

      {conversations !== undefined && sidebarTab === "chats" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/50 focus-within:border-primary mb-2 shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-sm w-full text-on-surface placeholder:text-on-surface-variant/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="material-symbols-outlined text-xs text-on-surface-variant hover:text-primary cursor-pointer"
              >
                close
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/60 text-body-sm">
                No chats found
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isActive = chat.id === activeConversationId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (onSelectConversation) onSelectConversation(chat.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`p-2.5 rounded-xl transition-all group cursor-pointer relative flex items-center justify-between ${
                      isActive
                        ? "bg-primary/15 border border-primary/30 text-primary shadow-sm font-bold"
                        : "hover:bg-surface-variant/60 text-on-surface"
                    }`}
                  >
                    <div className="overflow-hidden flex-1 pr-2">
                      <p className={`text-body-sm truncate ${isActive ? "font-bold text-primary" : "font-medium"}`}>
                        {chat.title}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                        {chat.time}
                      </p>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => onDeleteConversation(chat.id, e)}
                          className="p-1 text-on-surface-variant hover:text-error rounded-full hover:bg-error/10 transition-colors cursor-pointer"
                          title="Delete Chat"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === "reminders" && (activeTab === "reminders" || activeTab === "remainder")) || (typeof window !== "undefined" && window.location.pathname.startsWith(item.href));
            const hasSubItems = Boolean(item.subItems);
            const isSubOpen = hasSubItems && (isActive || listOpen);

            return (
              <div key={item.id} className="space-y-1">
                {hasSubItems ? (
                  <div className="flex flex-col">
                    <div
                      onClick={() => setListOpen(!listOpen)}
                      className={`flex items-center justify-between px-4 py-2 rounded-full transition-all duration-300 cursor-pointer group ${
                        isActive
                          ? "bg-primary-container dark:bg-on-primary-fixed-variant text-on-primary-container dark:text-primary-fixed shadow-md shadow-primary/20 font-bold"
                          : "text-on-surface-variant hover:bg-primary-fixed-dim/20 hover:translate-x-1"
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavClick(item.id, e)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <span
                          className={`material-symbols-outlined transition-colors ${
                            isActive ? "" : "text-on-surface-variant group-hover:text-primary"
                          }`}
                          style={{ fontVariationSettings: item.filled || isActive ? '"FILL" 1' : '"FILL" 0' }}
                        >
                          {item.icon}
                        </span>
                        <span className="font-body text-label-lg">{item.label}</span>
                      </Link>
                      <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                    {isSubOpen && item.subItems && (
                      <div className="pl-9 pr-2 space-y-1 py-1 border-l-2 border-primary/20 ml-6 mt-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = typeof window !== "undefined" && window.location.search.includes(sub.href.split("?")[1] || "");
                          return (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              onClick={(e) => handleNavClick(sub.id, e)}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-sm font-body transition-all duration-200 ${
                                isSubActive
                                  ? "bg-primary/15 text-primary font-bold"
                                  : "text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-variant/50"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">{sub.icon}</span>
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(item.id, e)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer group ${
                      isActive
                        ? "bg-primary-container dark:bg-on-primary-fixed-variant text-on-primary-container dark:text-primary-fixed shadow-md shadow-primary/20 font-bold"
                        : "text-on-surface-variant hover:bg-primary-fixed-dim/20 hover:translate-x-1"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined transition-colors ${
                        isActive ? "" : "text-on-surface-variant group-hover:text-primary"
                      }`}
                      style={{ fontVariationSettings: item.filled || isActive ? '"FILL" 1' : '"FILL" 0' }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-body text-label-lg">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      )}

      <SidebarProfileMenu />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isSidebarOpen !== false ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-none"
      }`}>
        <div className="w-64 h-full shrink-0">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 h-full"
            >
              {content}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

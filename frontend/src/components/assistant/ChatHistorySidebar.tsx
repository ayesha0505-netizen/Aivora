"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Conversation {
  id: string;
  title: string;
  time: string;
}

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export function ChatHistorySidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
}: ChatHistorySidebarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hidden lg:flex flex-col ml-64 w-72 bg-surface-container border-r border-outline-variant/20 h-full p-4 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <span className="text-label-md font-bold text-on-surface-variant tracking-wider uppercase">
          Recent Chats
        </span>
        <button
          onClick={() => setIsSearching(!isSearching)}
          className={`material-symbols-outlined p-1 rounded-full hover:bg-surface-variant transition-colors cursor-pointer ${
            isSearching ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary"
          }`}
          title="Filter Chats"
        >
          search
        </button>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/50 focus-within:border-primary">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
                filter_list
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter chats..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-sm w-full text-on-surface placeholder:text-on-surface-variant/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="material-symbols-outlined text-xs text-on-surface-variant hover:text-primary"
                >
                  close
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant/60 text-body-sm">
            No chats found
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = chat.id === activeId;
            return (
              <div
                key={chat.id}
                onClick={() => onSelect(chat.id)}
                className={`p-3 rounded-lg transition-colors group cursor-pointer relative ${
                  isActive
                    ? "bg-surface-container-high border border-primary/20 shadow-sm"
                    : "hover:bg-surface-variant"
                }`}
              >
                <p
                  className={`text-body-md font-medium truncate pr-6 ${
                    isActive ? "text-primary font-bold" : "text-on-surface"
                  }`}
                >
                  {chat.title}
                </p>
                <p className="text-body-sm text-on-surface-variant opacity-60">
                  {chat.time}
                </p>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  {onDelete && (
                    <button
                      onClick={(e) => onDelete(chat.id, e)}
                      className="p-1 text-on-surface-variant hover:text-error rounded-full hover:bg-error/10 transition-colors"
                      title="Delete Chat"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Chat options menu");
                    }}
                    className="p-1 text-on-surface-variant hover:text-primary rounded-full transition-colors"
                    title="More Options"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      more_horiz
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-tertiary-container/30 border border-tertiary/20">
        <div className="flex items-center gap-2 text-on-tertiary-container mb-1">
          <span className="material-symbols-outlined text-[18px]">
            workspace_premium
          </span>
          <span className="text-label-sm font-bold">Aivora Pro</span>
        </div>
        <p className="text-body-sm text-on-tertiary-container opacity-80 leading-snug">
          Get unlimited chats &amp; custom AI personas.
        </p>
      </div>
    </div>
  );
}

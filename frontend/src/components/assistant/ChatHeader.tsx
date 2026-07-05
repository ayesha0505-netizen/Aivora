"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHeaderProps {
  title: string;
  status?: string;
  onOpenMobileNav: () => void;
  onShare?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatHeader({
  title,
  status = "Optimized",
  onOpenMobileNav,
  onShare,
  isSidebarOpen = true,
  onToggleSidebar,
}: ChatHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      setShowShareModal(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 glass-panel border-b border-outline-variant/10 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {isSidebarOpen === false && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title="Open sidebar"
              className="hidden lg:flex items-center justify-center p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors cursor-pointer mr-1 animate-in fade-in duration-300"
            >
              <span className="material-symbols-outlined text-[22px]">left_panel_open</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
        
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-medium hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Share Modal Dialog */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 bg-surface-container-lowest dark:bg-surface-container-highest p-6 rounded-3xl shadow-2xl border border-outline-variant/40 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-on-surface">Share Chat</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded-full"
                >
                  close
                </button>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Share a read-only link of this conversation with colleagues or friends.
              </p>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  readOnly
                  value="https://aivora.app/share/c/wkly-prod-recap"
                  className="flex-1 bg-surface-container px-4 py-2 rounded-xl text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-label-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-5 py-2 rounded-full bg-surface-variant hover:bg-outline-variant/40 text-on-surface font-bold text-label-md transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

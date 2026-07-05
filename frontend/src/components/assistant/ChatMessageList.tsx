"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface MessageAction {
  label: string;
  actionId: string;
  primary?: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  stats?: {
    done: number | string;
    missed: number | string;
    score: string;
  };
  actions?: MessageAction[];
}

interface ChatMessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onPromptSelect: (prompt: string) => void;
  onActionClick?: (actionId: string, messageId: string) => void;
  userName?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  isTyping = false,
  onPromptSelect,
  onActionClick,
  userName = "Alexander",
  messagesEndRef,
}: ChatMessageListProps) {
  const [reactionFeedback, setReactionFeedback] = useState<{ [key: string]: string }>({});

  const handleReaction = (msgId: string, type: "like" | "dislike" | "copy", text: string) => {
    if (type === "copy") {
      navigator.clipboard.writeText(text);
      setReactionFeedback((prev) => ({ ...prev, [msgId]: "Copied!" }));
    } else if (type === "like") {
      setReactionFeedback((prev) => ({ ...prev, [msgId]: "Thanks for the feedback!" }));
    } else {
      setReactionFeedback((prev) => ({ ...prev, [msgId]: "We will improve this!" }));
    }
    setTimeout(() => {
      setReactionFeedback((prev) => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
    }, 2500);
  };

  // Simple markdown-ish parser for **bold** text and basic formatting
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-primary dark:text-primary-fixed">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full relative no-scrollbar">
      {messages.length === 0 ? (
        /* Welcome View (Empty State) */
        <div
          id="welcome-message"
          className="flex flex-col items-center justify-center py-16 md:py-20 text-center animate-in fade-in duration-700"
        >
          <div className="mb-6 animate-float">
            <img src="/logo-icon.png" alt="Aivora AI" className="w-24 h-24 object-contain drop-shadow-xl" />
          </div>
          <h3 className="text-headline-md font-headline font-bold text-on-surface mb-2">
            Hello, {userName}.
          </h3>
          <p className="text-on-surface-variant max-w-md mx-auto mb-10 leading-relaxed">
            How can I help you organize your life today? Ask me about your calendar,
            take a note, or plan something new.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
            <button
              onClick={() =>
                onPromptSelect("Based on my calendar, how should I spend my morning?")
              }
              className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container hover:border-primary/50 transition-all text-left group bouncy-hover shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">
                auto_awesome
              </span>
              <p className="font-bold text-on-surface text-label-md">
                Suggest a routine
              </p>
              <p className="text-on-surface-variant text-body-sm mt-1">
                Based on my calendar, how should I spend my morning?
              </p>
            </button>
            <button
              onClick={() =>
                onPromptSelect("Turn my messy project notes into a checklist.")
              }
              className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container hover:border-primary/50 transition-all text-left group bouncy-hover shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-tertiary mb-2 group-hover:scale-110 transition-transform">
                edit_note
              </span>
              <p className="font-bold text-on-surface text-label-md">
                Summarize my notes
              </p>
              <p className="text-on-surface-variant text-body-sm mt-1">
                Turn my messy project notes into a checklist.
              </p>
            </button>
          </div>
        </div>
      ) : (
        /* Active Chat Thread */
        <div className="space-y-10">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              if (message.sender === "user") {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col items-end gap-3 max-w-[85%] ml-auto"
                  >
                    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-[0_8px_24px_rgba(224,64,160,0.2)]">
                      <p className="text-body-md leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium opacity-60">
                      {message.time}
                    </span>
                  </motion.div>
                );
              }

              /* AI Message */
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex gap-4 max-w-[90%]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md pink-glow shrink-0 mt-1">
                    <img src="/logo-icon.png" alt="Aivora Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
                  </div>
                  <div>
                    <div className="bg-surface-container-high p-5 rounded-2xl rounded-tl-sm border border-outline-variant/20 shadow-sm prose prose-pink max-w-none">
                      <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(message.text)}
                      </p>

                      {/* Stats Grid Widget */}
                      {message.stats && (
                        <div className="grid grid-cols-3 gap-3 my-4">
                          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col items-center shadow-xs">
                            <span className="text-primary font-black text-headline-sm">
                              {message.stats.done}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">
                              Done
                            </span>
                          </div>
                          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col items-center shadow-xs">
                            <span className="text-secondary font-black text-headline-sm">
                              {message.stats.missed}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">
                              Missed
                            </span>
                          </div>
                          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col items-center shadow-xs">
                            <span className="text-tertiary font-black text-headline-sm">
                              {message.stats.score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">
                              Score
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-2">
                          {message.actions.map((act) => (
                            <button
                              key={act.actionId}
                              onClick={() =>
                                onActionClick && onActionClick(act.actionId, message.id)
                              }
                              className={`px-4 py-2 rounded-full text-label-sm font-bold transition-all bouncy-hover ${
                                act.primary
                                  ? "border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white shadow-xs"
                                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                              }`}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer / Reaction Icons */}
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-on-surface-variant font-medium opacity-60">
                          {message.time}
                        </span>
                        {reactionFeedback[message.id] && (
                          <span className="text-[11px] text-primary font-bold animate-pulse">
                            {reactionFeedback[message.id]}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReaction(message.id, "like", message.text)}
                          className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                          title="Helpful"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            thumb_up
                          </span>
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, "dislike", message.text)}
                          className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                          title="Not helpful"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            thumb_down
                          </span>
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, "copy", message.text)}
                          className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                          title="Copy text"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            content_copy
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* AI Typing State */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 max-w-[90%] pb-10"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md pink-glow shrink-0 mt-1">
                <img src="/logo-icon.png" alt="Aivora Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div className="bg-surface-variant/50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-primary typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-primary typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-primary typing-dot"></div>
              </div>
            </motion.div>
          )}

          {/* Scroll bottom anchor */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}
    </section>
  );
}

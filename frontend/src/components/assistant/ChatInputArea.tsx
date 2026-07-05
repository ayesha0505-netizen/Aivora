"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  onPromptSelect: (prompt: string) => void;
  isListening?: boolean;
  onToggleVoice?: () => void;
  disabled?: boolean;
  isCentered?: boolean;
}

export function ChatInputArea({
  onSendMessage,
  onPromptSelect,
  isListening = false,
  onToggleVoice,
  disabled = false,
  isCentered = false,
}: ChatInputAreaProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const suggestedPrompts = [
    { label: "📊 Analyze my spend", text: "Can you analyze my spend this month and categorize my expenses?" },
    { label: "📝 Draft email to boss", text: "Draft a concise update email to my boss about our Q3 goals." },
    { label: "🧘 Suggest a meditation", text: "Suggest a quick 5-minute evening meditation routine." },
    { label: "✈️ Hawaii travel tips", text: "What are the top 5 travel tips and hidden gems for a week in Hawaii?" },
  ];

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`Attached file: ${files[0].name}. File analysis ready!`);
    }
  };

  const content = (
    <>
      {!isCentered && (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {suggestedPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onPromptSelect(item.text)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container border border-outline-variant/30 text-body-sm font-medium text-on-surface-variant hover:border-secondary hover:text-secondary transition-all bouncy-hover shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-[2rem] opacity-0 group-within:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="relative flex items-end gap-2 bg-surface-container-high border-2 border-transparent group-within:border-primary/20 rounded-[1.5rem] p-2 transition-all shadow-lg shadow-black/5">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="flex items-center gap-1 mb-1 ml-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors group/btn relative cursor-pointer"
              title="Attach file"
            >
              <span className="material-symbols-outlined">attach_file</span>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-background px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md">
                Upload
              </div>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 py-3 resize-none max-h-48 scrollbar-hide font-body text-body-md"
            placeholder={isListening ? "Listening... speak now" : "Ask Aivora anything..."}
            rows={1}
          />

          <div className="flex items-center gap-1 mb-1 mr-1">
            <button
              onClick={onToggleVoice}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-tertiary/20 text-tertiary animate-pulse scale-105"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isListening ? '"FILL" 1' : '"FILL" 0' }}
              >
                {isListening ? "graphic_eq" : "mic"}
              </span>
            </button>
            
            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                text.trim() && !disabled
                  ? "bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-outline-variant/40 text-on-surface-variant/40 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                send
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <p className="text-[10px] text-on-surface-variant font-medium opacity-40 text-center">
          Aivora may occasionally provide inaccurate info. Verification recommended.
        </p>
      </div>
    </>
  );

  if (isCentered) {
    return <div className="w-full max-w-3xl mx-auto z-20 px-4">{content}</div>;
  }

  return (
    <footer className="p-4 md:p-6 glass-panel border-t border-outline-variant/10 z-20 shrink-0">
      <div className="max-w-4xl mx-auto">{content}</div>
    </footer>
  );
}

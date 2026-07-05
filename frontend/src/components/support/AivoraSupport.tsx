"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function getNowTimeString(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AivoraSupport() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "Hello Elena! 👋 I'm your Aivora 24/7 AI Support Assistant. I can help you set up integrations, configure your biometric vault, or optimize your daily schedules. How can I help you today?",
      timestamp: "Just now",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    "How do I enable FaceID biometric lock for my Diary?",
    "Can I sync Aivora reminders with Google Calendar?",
    "How do I export my monthly budget to a PDF report?",
    "What are the API rate limits for the AI Assistant?",
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "How does Aivora protect my personal diary and financial data?",
      answer:
        "All entries in your Personal Diary and Budget Planner are secured using AES-256 end-to-end encryption. When you enable the Privacy Lock, your vault requires biometric verification (FaceID / TouchID or hardware PIN) before decrypting data locally on your device.",
    },
    {
      id: "faq-2",
      question: "Can I connect Aivora to third-party tools like Notion, Linear, or Google Calendar?",
      answer:
        "Yes! As a Pro Account user, you have full access to our API & Integrations suite. You can configure 2-way real-time webhooks in Profile & Settings > Integrations to automatically sync tasks, calendar invites, and research notes.",
    },
    {
      id: "faq-3",
      question: "How does the AI Subscription Optimizer analyze my spending?",
      answer:
        "The Budget Planner uses a local privacy-preserving NLP model to scan recurring transaction titles and amounts. It identifies overlapping service categories (e.g., multiple cloud storage providers or AI tools) and suggests bundled alternatives without sending raw transaction data to external servers.",
    },
    {
      id: "faq-4",
      question: "How do I upgrade, downgrade, or cancel my Pro Subscription?",
      answer:
        "You can manage your subscription tier anytime under Settings > Billing & Plans. Changes take effect at the end of your current billing cycle, and you can export your entire data archive in JSON or CSV format at zero cost.",
    },
    {
      id: "faq-5",
      question: "What should I do if my local weather radar map won't load?",
      answer:
        "Ensure your browser or device permissions allow location services for Aivora. If you are on VPN, try manually selecting your target city using the city pill selector at the top of the Weather page.",
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId("user"),
      sender: "user",
      text,
      timestamp: getNowTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "";
      const lower = text.toLowerCase();

      if (lower.includes("faceid") || lower.includes("biometric") || lower.includes("lock") || lower.includes("diary")) {
        botReply =
          "To enable FaceID / Biometric Lock:\n1. Navigate to **Personal Diary** (`/diary`).\n2. Click the **'Lock Diary'** button in the top right header.\n3. Your device will prompt for biometric authorization. Once confirmed, your vault will lock automatically after 5 minutes of inactivity!";
      } else if (lower.includes("calendar") || lower.includes("sync") || lower.includes("google")) {
        botReply =
          "To sync with Google Calendar:\n1. Open **Profile & Settings** from the sidebar or top header.\n2. Scroll down to **'Connected Integrations'**.\n3. Toggle **Google Workspace** to **ON** and authorize the read/write permissions for events.";
      } else if (lower.includes("export") || lower.includes("pdf") || lower.includes("report") || lower.includes("budget")) {
        botReply =
          "To export your monthly financial report:\n1. Go to **Budget Planner** (`/budget`).\n2. Click the **'Export Report'** button in the header.\n3. Choose **PDF Summary** or **CSV Raw Transactions**. Aivora will generate a styled document with all your category charts included!";
      } else if (lower.includes("api") || lower.includes("rate limit") || lower.includes("token")) {
        botReply =
          "For **Pro Account** users, the Aivora Assistant API allows up to **500 requests per minute** and 100,000 tokens per day. You can generate custom API keys and monitor real-time latency graphs under Settings > Developer Access.";
      } else {
        botReply =
          `I understand you're asking about "${text}". Our engineering team is continuously updating Aivora's capabilities! I have logged this query for priority review. In the meantime, would you like me to schedule a 1-on-1 Zoom onboarding call with an engineer?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateId("bot"),
          sender: "bot",
          text: botReply,
          timestamp: getNowTimeString(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-12 animate-fade-in">
      {/* Hero Support Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary text-white p-8 lg:p-12 rounded-3xl pink-shadow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md">
            Aivora Help Center
          </span>
          <h1 className="text-4xl lg:text-5xl font-headline font-black tracking-tight">
            How can we help you today, Elena?
          </h1>
          <p className="text-white/90 font-body text-sm lg:text-base leading-relaxed">
            Search our knowledge base, explore interactive guides, or chat instantly with your AI Support Specialist below.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => alert("Connecting you to a priority Human Support Engineer... Current wait time: < 2 mins.")}
            className="px-6 py-3.5 bg-white text-primary rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">support_agent</span>
            <span>Talk to Human Support</span>
          </button>
          <button
            onClick={() => alert("Opening interactive video walkthroughs for Aivora Pro features!")}
            className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 backdrop-blur-md whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            <span>Video Walkthroughs</span>
          </button>
        </div>
      </div>

      {/* Main Support Grid: Live AI Chatbot + Help Bento Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live AI Support Chatbox */}
        <div className="lg:col-span-2 bg-white dark:bg-surface rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col h-[550px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md pink-glow shrink-0">
                <img src="/logo-icon.png" alt="Aivora Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                  <span>Aivora Support Specialist</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Online
                  </span>
                </h3>
                <p className="text-xs text-on-surface-variant">Instant AI resolution &amp; troubleshooting</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 rounded-full text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-variant/40 transition-colors text-xs font-bold"
              title="Clear chat history"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-surface-container-low/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs font-body ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none pink-shadow"
                      : "bg-white dark:bg-surface-container-highest text-on-surface rounded-bl-none border border-outline-variant/30"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-on-surface-variant/60 font-bold mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-4 bg-white dark:bg-surface-container-highest rounded-2xl rounded-bl-none border border-outline-variant/30 w-fit">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant ml-1">Aivora is analyzing...</span>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Quick Question Prompts */}
          <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant/20 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="px-3 py-1 rounded-full bg-surface-variant/60 hover:bg-primary/10 hover:text-primary text-on-surface-variant text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border border-outline-variant/20"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a support question (e.g., 'How do I sync Notion?')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-surface-variant/30 border border-outline-variant/40 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim()}
              className="p-3 bg-primary text-white rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>

        {/* Right Col: Help Categories Bento */}
        <div className="space-y-4 flex flex-col justify-between">
          <h3 className="text-xl font-headline font-black text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">explore</span>
            <span>Explore Knowledge Base</span>
          </h3>

          <div
            onClick={() => handleSendMessage("Tell me about Getting Started and Onboarding")}
            className="bg-white dark:bg-surface p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-pointer bouncy-hover group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">rocket_launch</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Getting Started</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Quick setup guides, workspace custom roots, and navigation basics.</p>
            </div>
          </div>

          <div
            onClick={() => handleSendMessage("How do I manage Billing and Pro Subscription?")}
            className="bg-white dark:bg-surface p-5 rounded-2xl border border-outline-variant/30 hover:border-secondary/50 shadow-sm hover:shadow-md transition-all cursor-pointer bouncy-hover group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">credit_card</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">Billing &amp; Plans</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Manage Pro account invoices, payment methods, and cycle dates.</p>
            </div>
          </div>

          <div
            onClick={() => handleSendMessage("How does Aivora handle Data Privacy and Biometric Lock?")}
            className="bg-white dark:bg-surface p-5 rounded-2xl border border-outline-variant/30 hover:border-tertiary/50 shadow-sm hover:shadow-md transition-all cursor-pointer bouncy-hover group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface group-hover:text-tertiary transition-colors">Privacy &amp; Vaults</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">AES-256 local encryption, FaceID pins, and zero-data retention rules.</p>
            </div>
          </div>

          <div
            onClick={() => handleSendMessage("Tell me about Developer API and Custom Integrations")}
            className="bg-white dark:bg-surface p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-pointer bouncy-hover group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">extension</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface group-hover:text-purple-600 transition-colors">API &amp; Webhooks</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Custom agent definitions, MCP server endpoints, and token quotas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="bg-white dark:bg-surface rounded-3xl p-6 lg:p-10 border border-outline-variant/30 shadow-sm">
        <h3 className="text-2xl font-headline font-black text-primary mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">quiz</span>
          <span>Frequently Asked Questions</span>
        </h3>
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isOpen
                    ? "bg-surface-container-low border-primary/40 shadow-xs"
                    : "bg-surface-container-lowest border-outline-variant/30 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className={`font-bold text-base ${isOpen ? "text-primary" : "text-on-surface"}`}>{faq.question}</h4>
                  <span
                    className={`material-symbols-outlined text-xl transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : "text-on-surface-variant/40"
                    }`}
                  >
                    expand_more
                  </span>
                </div>
                {isOpen && <p className="mt-3 text-sm text-on-surface-variant leading-relaxed font-body pt-3 border-t border-outline-variant/20 animate-fade-in">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

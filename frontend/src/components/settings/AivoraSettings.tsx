"use client";

import React, { useState } from "react";


interface ConnectedAccount {
  id: string;
  name: string;
  detail: string;
  icon: string;
  bgColor: string;
  active: boolean;
}

export function AivoraSettings() {


  // AI Intelligence state
  const [proactiveAssistance, setProactiveAssistance] = useState(true);
  const [communicationTone, setCommunicationTone] = useState("Playful & Energetic");
  const [refreshFrequency, setRefreshFrequency] = useState("Real-time Sync");

  // Notifications state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [calendarReminders, setCalendarReminders] = useState(false);

  // Integrations state
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "google",
      name: "Google Workspace",
      detail: "elena.r@gmail.com",
      icon: "mail",
      bgColor: "bg-[#4285F4]",
      active: true,
    },
    {
      id: "notion",
      name: "Notion Calendar",
      detail: "Active",
      icon: "calendar_month",
      bgColor: "bg-[#000000]",
      active: true,
    },
  ]);

  // UI Feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSave = () => {
    showToast("Settings saved successfully!", "success");
  };

  const handleDiscard = () => {

    setProactiveAssistance(true);
    setCommunicationTone("Playful & Energetic");
    setRefreshFrequency("Real-time Sync");
    setPushNotifications(true);
    setWeeklySummary(true);
    setCalendarReminders(false);
    showToast("Changes discarded. Reset to defaults.", "info");
  };


  const toggleDisconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, active: !acc.active, detail: !acc.active ? (acc.id === "google" ? "elena.r@gmail.com" : "Active") : "Disconnected" }
          : acc
      )
    );
  };

  const handleConnectNew = () => {
    const newId = `slack-${Date.now()}`;
    setAccounts((prev) => [
      ...prev,
      {
        id: newId,
        name: "Slack Workspace",
        detail: "#aivora-updates",
        icon: "chat",
        bgColor: "bg-[#4A154B]",
        active: true,
      },
    ]);
    showToast("Connected Slack Workspace successfully!", "success");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 animate-bounce transition-all duration-300">
          <div
            className={`px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-3 text-white ${
              toast.type === "success" ? "bg-primary pill-shadow-primary" : "bg-secondary pill-shadow-secondary"
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-black text-on-background tracking-tight">Settings</h2>
          <p className="text-on-surface-variant mt-2 font-medium">Manage your app preferences, AI intelligence, and notifications</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleDiscard}
            className="flex-1 sm:flex-initial px-6 py-2.5 border-2 border-primary text-primary rounded-full font-bold bouncy-hover active-scale transition-all cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-8 py-2.5 bg-primary text-white rounded-full font-bold pill-shadow-primary bouncy-hover active-scale transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">


        {/* AI Preferences (Wide Card) */}
        <section className="col-span-12 lg:col-span-7 bg-white dark:bg-surface-container-low rounded-lg p-8 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">psychology</span> AI Intelligence
              </h3>
              <p className="text-on-surface-variant text-sm">Customize how your AI assistant interacts with you</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
              <div>
                <h4 className="font-bold text-on-surface">Proactive Assistance</h4>
                <p className="text-sm text-on-surface-variant">Allow Aivora to suggest tasks based on context</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={proactiveAssistance}
                  onChange={(e) => {
                    setProactiveAssistance(e.target.checked);
                    showToast(`Proactive Assistance ${e.target.checked ? "Enabled" : "Disabled"}`, "info");
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-tertiary"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant ml-2">Communication Tone</label>
                <select
                  value={communicationTone}
                  onChange={(e) => {
                    setCommunicationTone(e.target.value);
                    showToast(`Tone updated to: ${e.target.value}`, "info");
                  }}
                  className="w-full px-4 py-3 bg-surface-container-low dark:bg-surface-container-lowest border-none rounded-full focus:ring-2 focus:ring-tertiary font-bold outline-none cursor-pointer"
                >
                  <option>Playful &amp; Energetic</option>
                  <option>Professional &amp; Brief</option>
                  <option>Deeply Collaborative</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant ml-2">Data Refresh Frequency</label>
                <select
                  value={refreshFrequency}
                  onChange={(e) => {
                    setRefreshFrequency(e.target.value);
                    showToast(`Refresh frequency updated to: ${e.target.value}`, "info");
                  }}
                  className="w-full px-4 py-3 bg-surface-container-low dark:bg-surface-container-lowest border-none rounded-full focus:ring-2 focus:ring-tertiary font-bold outline-none cursor-pointer"
                >
                  <option>Real-time Sync</option>
                  <option>Every 15 Minutes</option>
                  <option>Manual Only</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Accounts */}
        <section className="col-span-12 lg:col-span-5 bg-white dark:bg-surface-container-low rounded-lg p-8 shadow-sm border border-outline-variant/20">
          <h3 className="text-xl font-bold text-on-background mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">link</span> Integrations
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">Connected external data sources</p>
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container dark:bg-surface-container-highest transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${acc.bgColor} rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: acc.icon === "mail" ? "'FILL' 1" : "'FILL' 0" }}>
                      {acc.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{acc.name}</p>
                    <p className={`text-xs ${acc.active ? "text-on-surface-variant" : "text-error font-medium"}`}>{acc.detail}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleDisconnect(acc.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    acc.active
                      ? "text-error hover:bg-error-container/50"
                      : "text-tertiary bg-tertiary/10 hover:bg-tertiary/20"
                  }`}
                >
                  {acc.active ? "Disconnect" : "Reconnect"}
                </button>
              </div>
            ))}
            <button
              onClick={handleConnectNew}
              className="w-full mt-4 border-2 border-dashed border-outline-variant py-3.5 rounded-2xl text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-variant/40 hover:border-primary/50 transition-all cursor-pointer active-scale"
            >
              <span className="material-symbols-outlined">add_link</span>
              <span>Connect New Account</span>
            </button>
          </div>
        </section>

        {/* Privacy & Notifications */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary/5 rounded-lg p-8 border border-primary/10">
            <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">notifications_active</span> Notifications
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-on-surface">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => {
                    setPushNotifications(e.target.checked);
                    showToast(`Push Notifications ${e.target.checked ? "enabled" : "disabled"}`, "info");
                  }}
                  className="w-5 h-5 rounded-md text-primary focus:ring-primary border-outline-variant bg-white cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-on-surface">Weekly AI Summary</span>
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={(e) => {
                    setWeeklySummary(e.target.checked);
                    showToast(`Weekly AI Summary ${e.target.checked ? "enabled" : "disabled"}`, "info");
                  }}
                  className="w-5 h-5 rounded-md text-primary focus:ring-primary border-outline-variant bg-white cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-on-surface">Calendar Reminders</span>
                <input
                  type="checkbox"
                  checked={calendarReminders}
                  onChange={(e) => {
                    setCalendarReminders(e.target.checked);
                    showToast(`Calendar Reminders ${e.target.checked ? "enabled" : "disabled"}`, "info");
                  }}
                  className="w-5 h-5 rounded-md text-primary focus:ring-primary border-outline-variant bg-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary/5 rounded-lg p-8 border border-secondary/10">
            <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">verified_user</span> Privacy &amp; Security
            </h4>
            <div className="space-y-4">
              <button
                onClick={() => showToast("Password reset link sent to your email!", "info")}
                className="w-full text-left font-medium flex justify-between items-center group text-on-surface py-1 cursor-pointer"
              >
                <span>Change Account Password</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-on-surface-variant">chevron_right</span>
              </button>
              <button
                onClick={() => showToast("Two-Factor Authentication configuration modal opening...", "info")}
                className="w-full text-left font-medium flex justify-between items-center group text-on-surface py-1 cursor-pointer"
              >
                <span>Two-Factor Authentication</span>
                <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded text-[10px] font-bold">ENABLED</span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete your account and all data? This action cannot be undone.")) {
                    showToast("Account deletion request initiated.", "info");
                  }
                }}
                className="w-full text-left font-medium flex justify-between items-center group text-error py-1 cursor-pointer hover:text-error/80 transition-colors"
              >
                <span>Delete Account &amp; Data</span>
                <span className="material-symbols-outlined">delete_forever</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Floating Visual */}
      <footer className="mt-16 pt-12 border-t border-outline-variant/20 flex flex-col items-center">
        <div className="relative w-full h-48 rounded-2xl overflow-hidden pill-shadow-secondary mb-8 bg-gradient-to-tr from-secondary-container/40 via-primary-container/20 to-tertiary-container/30 border border-secondary/10 flex items-center justify-center">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-white dark:from-surface-container-lowest via-transparent to-transparent">
            <h5 className="text-2xl font-black text-secondary">Your Space, Your Rules.</h5>
            <p className="max-w-md text-on-surface-variant font-medium text-sm mt-2">
              Aivora evolves with you. Every setting is a step towards a more personalized digital experience.
            </p>
          </div>
        </div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-12">
          Aivora Intelligent Systems © 2026
        </p>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";

export function AivoraPersonalization() {
  const [fullName, setFullName] = useState("Elena Rodriguez");
  const [username, setUsername] = useState("ElenaR");
  const [bio, setBio] = useState(
    "Creative Director and AI enthusiast. Living at the intersection of productivity and playful design. Part-time traveler, full-time dreamer."
  );
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSave = () => {
    showToast("Profile identity and username saved successfully!", "success");
  };

  const handleDiscard = () => {
    setFullName("Elena Rodriguez");
    setUsername("ElenaR");
    setBio(
      "Creative Director and AI enthusiast. Living at the intersection of productivity and playful design. Part-time traveler, full-time dreamer."
    );
    showToast("Changes discarded. Reset to defaults.", "info");
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
          <h2 className="text-4xl font-black text-on-background tracking-tight">Personalization (My Profile)</h2>
          <p className="text-on-surface-variant mt-2 font-medium">Manage your identity, username, and public profile representation</p>
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
            Save Profile
          </button>
        </div>
      </header>

      {/* Bento Grid Layout for Personalization */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Identity Card */}
        <section className="col-span-12 lg:col-span-8 bg-white dark:bg-surface-container-low rounded-lg p-8 shadow-sm border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
            <div className="relative group self-center sm:self-start">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-fixed pill-shadow-primary relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvY6bjQSK7q7-zakJI3meU7o9ayqMh9ogRvIgyZAhyS3Wt3uNTKiQx5l7ht4tsIWrpBOW61w3l5WLFHTIDEeVwBrKBB8haw3VTWUvb6UWRj68i8UVNEP2XN4QpqVq13KZgAnwSOD4fM3Lp7snQ5EzqbtvjewfwyKeFdAf79V8nV9LN551PDxzNN_xa_wEQ29YUlUaMGkaHtw6NOzTmZ8uS7U4tNVmK0MBccyZDUylKAda1NbP0cJHt3g"
                  alt="Elena Rodriguez"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                onClick={() => showToast("Avatar upload dialog opening soon...", "info")}
                className="absolute bottom-1 right-1 bg-secondary text-white p-2.5 rounded-full bouncy-hover active-scale shadow-lg flex items-center justify-center cursor-pointer"
                title="Edit Photo"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-full focus:ring-2 focus:ring-primary font-medium outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-full focus:ring-2 focus:ring-primary font-medium outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary font-medium min-h-[100px] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Profile Representation Info Card */}
        <section className="col-span-12 lg:col-span-4 bg-primary/5 rounded-lg p-6 border border-primary/10 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">verified_user</span> Identity Recognition
            </h3>
            <p className="text-sm text-on-surface-variant/80 mb-4 leading-relaxed">
              Your <strong>Username</strong> is unique across all shared lists and collaborative workspaces.
            </p>
            <div className="bg-white dark:bg-surface-container rounded-2xl p-4 border border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <span className="text-xs font-medium text-on-surface">Proactive AI personalized greetings</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <span className="text-xs font-medium text-on-surface">Custom avatar sync across devices</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function TopNavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/30 transition-all">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 group hover:scale-105 transition-transform duration-300"
        >
          <img src="/logo-icon.png" alt="Aivora Logo" className="w-[55px] h-[55px] object-contain drop-shadow-md group-hover:rotate-6 transition-transform duration-300" />
          <span className="font-headline font-black text-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Aivora
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center font-body text-sm font-bold">
          <a
            className="text-primary border-b-2 border-primary transition-all duration-300 hover:scale-[1.03]"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-on-surface-variant hover:bg-surface-variant/50 transition-all duration-300 hover:scale-[1.03] px-3 py-1 rounded-full"
            href="#workflow"
          >
            Workflow
          </a>
          <a
            className="text-on-surface-variant hover:bg-surface-variant/50 transition-all duration-300 hover:scale-[1.03] px-3 py-1 rounded-full"
            href="#testimonials"
          >
            Testimonials
          </a>
          <a
            className="text-on-surface-variant hover:bg-surface-variant/50 transition-all duration-300 hover:scale-[1.03] px-3 py-1 rounded-full"
            href="#faq"
          >
            FAQ
          </a>
          <Link
            href="/assistant"
          >
            Assistant
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:flex items-center bg-surface-container-low/80 px-4 py-2 rounded-full border border-outline-variant focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-32 placeholder:text-on-surface-variant/60"
            placeholder="Search..."
            type="text"
          />
        </div>
        <button
          onClick={() => alert("No new notifications")}
          className="material-symbols-outlined text-primary p-2 rounded-full hover:bg-surface-variant/50 transition-all cursor-pointer"
          title="Notifications"
        >
          notifications
        </button>
        
        {mounted && isAuthenticated ? (
          <div className="flex items-center gap-2">

            <Link href="/assistant" className="relative group" title={user?.full_name || user?.email || "Account"}>
              {user?.full_name ? (
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.full_name[0].toUpperCase()}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all bouncy-hover"
            >
              Sign In
            </Link>

          </div>
        )}
      </div>
    </nav>
  );
}

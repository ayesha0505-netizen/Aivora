"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { SocialAuthButtons } from "./SocialAuthButtons";

type AuthTab = "login" | "signup" | "forgot";

export function AuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignupSuccess = (email: string) => {
    setSuccessMessage(`Account created! Please log in with ${email}.`);
    setActiveTab("login");
  };

  return (
    <div className="w-full max-w-md relative bg-surface border border-white/50 backdrop-blur-xl rounded-xl candy-shadow p-8 md:p-10 transition-all duration-500 shadow-xl">
      {/* Toggle Navigation (Only visible on Login / Sign Up tabs) */}
      {activeTab !== "forgot" && (
        <div className="flex bg-surface-variant/50 p-1.5 rounded-full mb-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
              activeTab === "login"
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
              activeTab === "signup"
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && activeTab === "login" && (
        <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-600 text-xs font-medium">
          {successMessage}
        </div>
      )}

      {/* Form Sections with AnimatePresence */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "login" && (
            <LoginForm
              key="login"
              onForgotClick={() => setActiveTab("forgot")}
            />
          )}
          {activeTab === "signup" && <SignUpForm key="signup" onSuccess={handleSignupSuccess} />}
          {activeTab === "forgot" && (
            <ForgotPasswordForm
              key="forgot"
              onBackClick={() => setActiveTab("login")}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Social Auth Divider & Buttons (Only visible on Login / Sign Up tabs) */}
      {activeTab !== "forgot" && (
        <>
          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-outline-variant/30" />
            <span className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
              or continue with
            </span>
            <div className="h-[1px] flex-1 bg-outline-variant/30" />
          </div>

          <SocialAuthButtons />
        </>
      )}

      {/* Footer Support Links */}
      <div className="mt-8 flex justify-center gap-6 text-xs font-bold text-on-surface-variant/70">
        <a href="#" className="hover:text-primary transition-colors">
          Help Center
        </a>
        <a href="#" className="hover:text-primary transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-primary transition-colors">
          Cookies
        </a>
      </div>
    </div>
  );
}

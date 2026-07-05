"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

interface ForgotPasswordFormProps {
  onBackClick: () => void;
}

export function ForgotPasswordForm({ onBackClick }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process request. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={onBackClick}
        className="flex items-center gap-2 text-tertiary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back to login
      </button>

      <h2 className="text-2xl font-bold mb-2 text-on-surface">
        Forgot Password?
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        No worries! It happens. Enter your email and we&apos;ll send you a recovery
        link.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {sent ? (
        <div className="bg-tertiary-fixed/40 border border-tertiary/30 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-tertiary text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="font-bold text-on-tertiary-container">
            Check your inbox
          </h3>
          <p className="text-xs text-on-surface-variant">
            We sent a password recovery link to <strong>{email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs font-bold text-tertiary hover:underline block mx-auto pt-2 cursor-pointer"
          >
            Try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary ml-2 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="hello@example.com"
              className="w-full bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-5 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-on-secondary font-bold py-4 rounded-full bouncy candy-shadow hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Recovery Email"}
          </button>
        </form>
      )}
    </motion.div>
  );
}

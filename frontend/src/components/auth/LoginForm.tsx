"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onForgotClick: () => void;
}

export function LoginForm({ onForgotClick }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/assistant");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
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
      <h2 className="text-2xl font-bold mb-2 text-on-surface">Welcome back!</h2>
      <p className="text-on-surface-variant text-sm mb-6">
        Log in to your Aivora dashboard.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-1">
          <div className="flex justify-between items-center ml-2">
            <label className="text-xs font-bold text-secondary">Password</label>
            <button
              type="button"
              onClick={onForgotClick}
              className="text-xs font-bold text-tertiary hover:underline cursor-pointer"
            >
              Forgot?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-5 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-bold py-4 rounded-full mt-4 bouncy candy-shadow hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </motion.div>
  );
}

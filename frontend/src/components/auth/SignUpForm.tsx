"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SignUpFormProps {
  onSuccess?: (email: string) => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter();
  const { signup, logout } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await signup(email, password, fullName, firstName, lastName);
      logout(); // Clear session so they have to log in manually
      if (onSuccess) {
        onSuccess(email);
      } else {
        router.push("/auth?mode=login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again.";
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
      <h2 className="text-2xl font-bold mb-2 text-on-surface">Join Aivora</h2>
      <p className="text-on-surface-variant text-sm mb-6">
        Start your journey with joyful AI.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary ml-2 block">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Joy"
              className="w-full bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-5 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-secondary ml-2 block">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Doe"
              className="w-full bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-5 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all text-sm"
            />
          </div>
        </div>

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
          <label className="text-xs font-bold text-secondary ml-2 block">
            Create Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full px-5 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all text-sm"
          />
        </div>

        <div className="flex items-start gap-3 px-2 pt-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded-sm text-primary focus:ring-primary border-outline-variant cursor-pointer"
          />
          <p className="text-xs text-on-surface-variant">
            I agree to the{" "}
            <span className="text-secondary font-bold cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-secondary font-bold cursor-pointer hover:underline">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-bold py-4 rounded-full mt-2 bouncy candy-shadow hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </motion.div>
  );
}

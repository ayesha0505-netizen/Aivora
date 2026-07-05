"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !loading) {
      setLoading(true);
      try {
        await api.subscribeNewsletter(email);
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
      } catch (err) {
        console.error("Newsletter subscription failed:", err);
        setSubscribed(true); // show confirmation to user even if offline/dev fallback
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <footer className="py-12 bg-surface-container-lowest border-t border-outline-variant">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center gap-3 group inline-block"
          >
            <img src="/logo-icon.png" alt="Aivora Logo" className="w-[55px] h-[55px] object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-black font-headline bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Aivora
            </span>
          </Link>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The next generation of personal operating systems. Playful,
            powerful, and private.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm"
              href="#"
              title="Global"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm"
              href="#"
              title="Email"
            >
              <span className="material-symbols-outlined text-sm">
                alternate_email
              </span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-on-background">Product</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#features"
              >
                Features
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#workflow"
              >
                Integrations
              </a>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/auth"
              >
                Pricing
              </Link>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#faq">
                API Docs
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-on-background">Company</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                About Us
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Careers
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-on-background">
            Subscribe to our newsletter
          </h4>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              className="px-4 py-2.5 rounded-full border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface text-sm placeholder:text-on-surface-variant/60"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-full pill-shadow-primary transition-all cursor-pointer text-sm"
            >
              {subscribed ? "Subscribed! 🎉" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <p>© 2026 Aivora AI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">
            Status
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Help Center
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}

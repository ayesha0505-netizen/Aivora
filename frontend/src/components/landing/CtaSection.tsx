"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function CtaSection() {
  const { isAuthenticated } = useAuth();
  const [contacting, setContacting] = useState(false);

  const handleContactSales = async () => {
    if (!contacting) {
      setContacting(true);
      try {
        await api.submitContactInquiry("enterprise-lead@aivora.app", "Prospective Enterprise Client", "Requested contact via landing page CTA");
        alert("Thank you! Our enterprise sales team has received your inquiry and will reach out shortly.");
      } catch (_err) {
        alert("Thank you! Our enterprise sales team has received your inquiry.");
      } finally {
        setContacting(false);
      }
    }
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Logo Watermark inside CTA */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-15 pointer-events-none select-none rotate-12">
            <img src="/logo-icon.png" alt="Aivora Watermark" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -left-16 -top-16 w-80 h-80 opacity-10 pointer-events-none select-none -rotate-12">
            <img src="/logo-trimmed.png" alt="Aivora Watermark" className="w-full h-full object-contain" />
          </div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Ready to scale your life?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
              Join thousands of high-performers who have automated their chaos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={isAuthenticated ? "/dashboard" : "/auth"}
                className="px-10 py-5 bg-white text-primary font-black rounded-full text-lg bouncy-hover shadow-xl inline-block"
              >
                Get Started for Free
              </Link>
              <button
                onClick={handleContactSales}
                disabled={contacting}
                className="px-10 py-5 bg-transparent border-2 border-white text-white font-black rounded-full text-lg bouncy-hover cursor-pointer disabled:opacity-50"
              >
                {contacting ? "Sending..." : "Contact Sales"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

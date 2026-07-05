"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqSection() {
  const faqs = [
    {
      question: "Which apps does Aivora connect with?",
      answer:
        "Aivora integrates natively with Google Workspace, Microsoft 365, Slack, Notion, GitHub, and over 1,500+ other apps via our secure API gateway.",
    },
    {
      question: "Is my personal data secure?",
      answer:
        "Security is our bedrock. We use SOC2 Type II certified servers and end-to-end encryption. Your data is never used to train global models; your AI is yours alone.",
    },
    {
      question: "Does Aivora support voice commands?",
      answer:
        "Yes! Aivora features state-of-the-art natural language understanding. You can speak to it via our mobile app or desktop companion for hands-free productivity.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-black text-center mb-16"
        >
          Questions? Answers.
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card rounded-xl overflow-hidden border border-outline-variant transition-all duration-300 shadow-sm ${
                  isOpen
                    ? idx === 0
                      ? "bg-primary/5 border-primary/30"
                      : idx === 1
                      ? "bg-secondary/5 border-secondary/30"
                      : "bg-tertiary/5 border-tertiary/30"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-6 cursor-pointer text-left font-bold text-lg text-on-background focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`material-symbols-outlined transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 text-on-surface-variant leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

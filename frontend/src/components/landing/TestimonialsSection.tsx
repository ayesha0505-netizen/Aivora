"use client";

import React from "react";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        '"Aivora reclaimed at least 10 hours of my week. It\'s like having a chief of staff in my pocket."',
      name: "Elena Vance",
      role: "CEO, Lumina Studios",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBFyLFFnzJMPhM5qPtCPrwWQtVbVHc7DmGiJYvgCLfxLJRY9TK3OYEgt4ZuTsdCqVvZNf4gQQF_JerHbCj6-KfIBoNVb9_wpNh1l-UJ1x5uu3zkQXLlSHI_8ZEHxxNmgV_U-rpyAU3e-I8Ek5PyPDQ-BVlCSOvXDpTqwM3nBWPgOaXeCX8Ez8WwbmaK8J5Ff_TdpGT0jPUs8coZiY96M1Z6pAKgJhkkm_gcMPLpMp_hLo8Prx4qnAtDXQ",
      borderColor: "border-secondary",
      translateY: "translate-y-0",
    },
    {
      quote:
        '"The way it handles calendar conflicts is pure magic. I never have to manually check my schedule anymore."',
      name: "Marcus Chen",
      role: "Full-stack Dev",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCvVn_mP16LCg8GZo_I5yoNEOAAoBG63Ffl86wBh-AY6oTYVQgoQO7AXWUIlo9NWkO10MQd1F53CO_WiotfS2x1CXEfi-mLKBxIh0fxFTc3SNzVs4pNzIsuLnSn6hohOqNijNcFIIBmVYETBUtWpp4VA7lkuqbwOq5REjJ9YlHIgyERmvYDzf5Awa4c9NTW0AunfPihZ07CBtzpmrLw0R3CntiYeyrilorx8JY2UrXEgkQEfaRSaskFqA",
      borderColor: "border-tertiary",
      translateY: "md:translate-y-4",
    },
    {
      quote:
        '"Finally, an AI that doesn\'t just talk but actually does things. It drafted my investor updates in minutes."',
      name: "Sarah Jenkins",
      role: "Founder, BloomAI",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA0-N3ltpKXH8AxCjfK9fj_pzycxVPVLXBgWJLRjpckz4bfCZmsQryyhLPGmayQegfOJyF6ZPzG_BWeViqGl-ReePnj3kjKcr-uRlmdIxw0JIrN0ky2CPAdpG2OENXK2qGJGOEw7GvpTeSbZceJJYEQp93hehH5ayr_ATjj_lodt7ghuYy7_iW6naQvxyap6Q8LS_d-yErG18SjQrHGajCXzLat-MJhh_qb5-WbqVZSOeuOWrtcmzNawg",
      borderColor: "border-primary",
      translateY: "translate-y-0",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-24 bg-surface-container-highest/30"
    >
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-black text-center mb-16"
        >
          Loved by Life-Hackers
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className={`glass-card p-8 rounded-xl bouncy-hover space-y-4 shadow-sm flex flex-col justify-between ${t.translateY}`}
            >
              <div>
                <div className="flex gap-1 text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="italic text-on-surface leading-relaxed">
                  {t.quote}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <img
                  className={`w-12 h-12 rounded-full object-cover border-2 ${t.borderColor} shadow-sm`}
                  alt={`Portrait of ${t.name}`}
                  src={t.avatar}
                />
                <div>
                  <p className="font-bold text-on-background">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

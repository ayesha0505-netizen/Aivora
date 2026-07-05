"use client";

import React from "react";

export function AuthBackground() {
  return (
    <>
      {/* Decorative Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-tertiary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] left-[20%] w-[30%] h-[30%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Background Illustration Watermark */}
      <div className="fixed -bottom-10 -right-10 w-96 h-96 opacity-[0.07] pointer-events-none select-none rotate-12">
        <img
          className="w-full h-full object-contain"
          alt="Aivora Logo Watermark"
          src="/logo-trimmed.png"
        />
      </div>
      <div className="fixed -top-10 -left-10 w-80 h-80 opacity-[0.05] pointer-events-none select-none -rotate-12">
        <img
          className="w-full h-full object-contain"
          alt="Aivora Logo Watermark"
          src="/logo-icon.png"
        />
      </div>
    </>
  );
}

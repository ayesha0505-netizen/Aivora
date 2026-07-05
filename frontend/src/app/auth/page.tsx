import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      {/* Top Left Back Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 hover:bg-surface border border-outline-variant text-on-surface-variant hover:text-primary font-bold text-sm transition-all duration-300 shadow-sm bouncy-hover"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>
      </div>

      {/* Brand Header */}
      <div className="mb-6 text-center z-10 mt-12 md:mt-0 flex flex-col items-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300"></div>
            <img src="/logo-icon.png" alt="Aivora Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
          </div>
          <h1 className="font-headline font-black bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight text-4xl md:text-5xl mb-2 drop-shadow-sm group-hover:scale-[1.02] transition-transform">
            Aivora
          </h1>
        </Link>
        <p className="text-on-surface-variant font-bold text-sm md:text-base tracking-wide">
          One AI Agent to Organize Your Entire Life
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="w-full flex justify-center z-10">
        <AuthCard />
      </div>
    </main>
  );
}

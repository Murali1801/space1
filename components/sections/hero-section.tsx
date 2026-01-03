"use client"

import Link from "next/link"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-24 relative overflow-hidden">
      {/* Background Decorative Element - Solid & Professional */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge - solid high-contrast */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Introducing Veo 3 & Nano Banana</span>
        </div>

        {/* Headline - pure solid contrast */}
        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.95]">
          <span className="text-white block">Create beyond limits.</span>
          <span className="text-zinc-600 block mt-2">Space: The AI Playground.</span>
        </h1>

        {/* Subheadline - describe your product */}
        <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto mb-12 leading-relaxed text-balance font-medium">
          Experience the power of next-gen generative models. Create stunning images with Nano Banana and cinematic videos with Veo 3.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/signup">
            <button className="h-16 px-10 rounded-2xl bg-white text-zinc-950 text-base font-bold hover:bg-zinc-200 transition-all shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] active:scale-[0.98]">
              Start Creating Free
            </button>
          </Link>
          <Link
            href="#features"
            className="group flex items-center gap-3 px-8 py-4 text-base font-bold text-zinc-400 hover:text-white transition-all rounded-2xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            <span>Explore Models</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

      </div>
    </section>
  )
}

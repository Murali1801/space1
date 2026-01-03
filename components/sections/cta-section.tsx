import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

export function CtaSection() {
  return (
    <section className="px-6 py-32 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="p-20 rounded-[60px] bg-zinc-900/40 border border-zinc-800 text-center relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000" />

          <div className="relative z-10">
            <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Ready to create?
            </h2>
            <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the next generation of creators. Start generating professional-grade assets in seconds with Space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <button className="h-16 px-12 rounded-2xl bg-white text-black text-base font-bold hover:bg-zinc-200 transition-all shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] active:scale-[0.98]">
                  Get Started for Free
                </button>
              </Link>
              <Link
                href="#pricing"
                className="group flex items-center gap-3 px-8 py-4 text-base font-bold text-zinc-400 hover:text-white transition-all rounded-2xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
              >
                <span>View Pricing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

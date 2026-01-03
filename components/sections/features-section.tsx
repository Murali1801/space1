"use client"

import { motion } from "framer-motion"
import { Zap, BarChart3, Layers, ArrowRight, Command } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const integrationLogos = [
  { name: "Tool 1" },
  { name: "Tool 2" },
  { name: "Tool 3" },
  { name: "Tool 4" },
  { name: "Tool 5" },
  { name: "Tool 6" },
  { name: "Tool 7" },
  { name: "Tool 8" },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-32 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Core Capabilities</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Powerful features designed to help you generate high-quality assets at record speed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1 - Analytics (Real-time Dashboard) */}
          <div className="lg:col-span-8 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-500 group relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Real-time Performance</h3>
                  <p className="text-sm text-zinc-500">Monitor every generation in real-time.</p>
                </div>
              </div>

              <div className="mt-10 p-8 rounded-3xl bg-black border border-zinc-800/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Tasks</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Throughput", value: "854/s", change: "Optimal" },
                    { label: "Success Rate", value: "99.9%", change: "High" },
                    { label: "Efficiency", value: "4.2x", change: "Stable" },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{metric.value}</span>
                        <span className="text-[10px] font-bold text-emerald-500">{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 45, 90, 55, 100, 70, 85, 50, 95, 75, 40, 60, 80, 55].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-zinc-800 group-hover:bg-zinc-700 transition-colors rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Speed */}
          <div className="lg:col-span-4 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-500 group flex flex-col justify-between overflow-hidden">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-6 h-6 text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Blazing Speed</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Our infrastructure is optimized for sub-second responses and massive parallel processing.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-display font-bold text-white">4.2<span className="text-2xl text-zinc-500">s</span></span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Avg Gen Time</span>
              </div>
              <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "95%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Card 3 - Keyboard First */}
          <div className="lg:col-span-12 p-12 rounded-[40px] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-500 group overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Command className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Command Center</h3>
                <p className="text-zinc-500 leading-relaxed max-w-sm">
                  Navigate, generate, and edit without ever leaving your keyboard. The power user's dream interface.
                </p>
                <div className="flex gap-4 mt-8">
                  {["⌘", "K"].map((key) => (
                    <div key={key} className="w-14 h-14 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center shadow-xl group-hover:translate-y-[-4px] transition-transform duration-500">
                      <span className="text-lg font-mono font-bold text-zinc-300">{key}</span>
                    </div>
                  ))}
                  <div className="px-6 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:translate-y-[-4px] transition-transform duration-500 delay-75">
                    Quick Search
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {integrationLogos.map((logo, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[24px] bg-black border border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-all duration-500"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    <div className="w-6 h-6 rounded bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

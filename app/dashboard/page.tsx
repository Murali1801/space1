"use client"

import Link from "next/link"
import { ArrowRight, Image as ImageIcon, Video, History, Sparkles } from "lucide-react"
import { LiquidCard } from "@/components/dashboard/liquid-card"

export default function DashboardPage() {
    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-display font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">Your creative command center.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px]">
                {/* Image Gen Card - Large */}
                <div className="md:col-span-2 md:row-span-2 group">
                    <LiquidCard startColor="#4f46e5">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                <ImageIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Image Generation</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">
                                    Create stunning high-fidelity visuals with our Nano Banana model.
                                </p>
                                <Link
                                    href="/dashboard/image-generation"
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors"
                                >
                                    Start Generating <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                {/* Video Gen Card - Large */}
                <div className="md:col-span-2 md:row-span-2 group">
                    <LiquidCard startColor="#a855f7">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Video Generation</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">
                                    Bring your stories to life with cinematic Veo 3 video generation.
                                </p>
                                <Link
                                    href="/dashboard/video-generation"
                                    className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors"
                                >
                                    Start Generating <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                {/* History Card - Standard */}
                <div className="md:col-span-1 md:row-span-1 group">
                    <LiquidCard startColor="#10b981">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <Link href="/dashboard/history" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">History</h3>
                                <p className="text-sm text-zinc-500 mt-1">View past creations.</p>
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                {/* Stats Card - Standard */}
                <div className="md:col-span-1 md:row-span-1">
                    <LiquidCard startColor="#f59e0b">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">12</h3>
                                <p className="text-sm text-zinc-500 mt-1">Generations this week</p>
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                {/* Quick Action - Standard */}
                <div className="md:col-span-2 md:row-span-1">
                    <LiquidCard startColor="#e4e4e7">
                        <div className="h-full flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Subscription</h3>
                                <p className="text-sm text-zinc-500 mt-1">You are on the <span className="text-zinc-700 dark:text-zinc-300 font-medium">Free Plan</span></p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                                Upgrade Pro
                            </button>
                        </div>
                    </LiquidCard>
                </div>
            </div>

        </div>
    )
}

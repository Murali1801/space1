"use client"

import Link from "next/link"
import { ArrowRight, Image as ImageIcon, Video, History, Sparkles, Zap, Clock, ChevronRight, Loader2 } from "lucide-react"
import { LiquidCard } from "@/components/dashboard/liquid-card"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, onSnapshot, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { timeAgo } from "@/lib/utils"

interface Generation {
    id: string
    type: 'image' | 'video'
    url: string
    prompt: string
    createdAt: any
    modelId: string
    isCloudinary?: boolean
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [recentGenerations, setRecentGenerations] = useState<Generation[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch recent items (Real-time)
    useEffect(() => {
        if (!user) return

        setLoading(true)
        const q = query(
            collection(db, "generations"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(10)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Generation[] = []
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Generation)
            })
            setRecentGenerations(items)
            setLoading(false)
        }, (error) => {
            console.error("Real-time fetch error:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    // Fetch total count (Real-time)
    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "generations"),
            where("userId", "==", user.uid)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTotalCount(snapshot.size)
        }, (error) => {
            console.error("Count fetch error:", error)
        })

        return () => unsubscribe()
    }, [user])


    return (
        <div className="space-y-8 min-h-screen pb-20 w-full px-4 md:px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-medium text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-zinc-400 mt-1 text-base">
                        Monitor your creative output and usage.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/image-generation">
                        <button className="h-11 px-6 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Create Image
                        </button>
                    </Link>
                    <Link href="/dashboard/video-generation">
                        <button className="h-11 px-6 rounded-xl bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            New Video
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-sm font-medium">Monthly Usage</span>
                        <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{totalCount}</span>
                            <span className="text-zinc-500 text-sm">/ 500 units</span>
                        </div>
                        <div className="mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((totalCount / 500) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-sm font-medium">Generation Success</span>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">99.2%</span>
                            <span className="text-emerald-500 text-xs font-medium">+0.4% from last week</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-sm font-medium">Average Latency</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">4.2s</span>
                            <span className="text-zinc-500 text-sm">per generation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Mini-Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-medium text-white">Recent Generations</h3>
                        <Link href="/dashboard/history" className="text-sm text-zinc-500 hover:text-white transition-colors">
                            View all history
                        </Link>
                    </div>

                    <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 overflow-hidden min-h-[300px] flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
                            </div>
                        ) : recentGenerations.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <div className="p-4 rounded-2xl bg-zinc-800/50">
                                    <Sparkles className="w-8 h-8 text-zinc-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-zinc-300 font-medium">No activity yet</p>
                                    <p className="text-zinc-500 text-sm">Your generated content will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {recentGenerations.map((item) => (
                                    <div key={item.id} className="group relative aspect-square rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden cursor-pointer">
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.url}
                                                alt={item.prompt}
                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <video
                                                src={item.url}
                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                                muted
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-[10px] text-white line-clamp-2 leading-tight">
                                                {item.prompt}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 6 - recentGenerations.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-zinc-900/50 border border-zinc-800/30 border-dashed" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Tips/Quick Stats */}
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-white">System Status</h3>
                    <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">API Status</span>
                                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Model Availability</span>
                                <span className="text-zinc-200">100%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Vertex AI Engine</span>
                                <span className="text-zinc-200">v4.2 Stable</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-800">
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pro Tip</p>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    Use standard aspect ratios like 16:9 for cinematic videos or 1:1 for social media images.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

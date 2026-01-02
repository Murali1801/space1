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

    // Fetch total count (One-time)
    useEffect(() => {
        if (!user) return

        const fetchCount = async () => {
            try {
                const q = query(
                    collection(db, "generations"),
                    where("userId", "==", user.uid)
                )
                const snapshot = await getCountFromServer(q)
                setTotalCount(snapshot.data().count)
            } catch (error) {
                console.error("Count fetch error:", error)
            }
        }

        fetchCount()
    }, [user])


    return (
        <div className="space-y-6 min-h-screen pb-20">
            {/* Header Section */}
            <div className="relative rounded-3xl bg-zinc-900/50 border border-zinc-800/50 p-6 md:p-8 overflow-hidden backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-zinc-400 mt-2 text-lg max-w-xl">
                        Ready to create something extraordinary? Select a tool below to get started.
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Generation Hero */}
                <Link href="/dashboard/image-generation" className="group">
                    <div className="relative flex flex-col justify-end h-[220px] md:h-[260px] rounded-3xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-all duration-500 bg-zinc-900/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-[url('/placeholder.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />

                        <div className="relative z-10 p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 backdrop-blur-md">
                                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="text-indigo-400 font-medium text-xs md:text-sm border border-indigo-500/20 px-2 py-0.5 rounded-full bg-indigo-500/10">v2.0 Model</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display text-white mb-1">Image Generation</h3>
                            <p className="text-zinc-400 text-sm max-w-sm flex items-center gap-2 group-hover:text-white transition-colors">
                                Create ultra-realistic visuals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Video Generation Hero */}
                <Link href="/dashboard/video-generation" className="group">
                    <div className="relative flex flex-col justify-end h-[220px] md:h-[260px] rounded-3xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-500 bg-zinc-900/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-[url('/placeholder-logo.png')] opacity-20 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />

                        <div className="relative z-10 p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 backdrop-blur-md">
                                    <Video className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-purple-400 font-medium text-xs md:text-sm border border-purple-500/20 px-2 py-0.5 rounded-full bg-purple-500/10">Veo 3 Engine</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display text-white mb-1">Video Generation</h3>
                            <p className="text-zinc-400 text-sm max-w-sm flex items-center gap-2 group-hover:text-white transition-colors">
                                Cinematic motion synthesis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <LiquidCard startColor="#f59e0b" className="md:col-span-1 h-[200px]">
                    <div className="h-full flex flex-col justify-between relative z-10">
                        <div className="flex items-center justify-between">
                            <h4 className="text-zinc-400 font-medium">Total Creations</h4>
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <span className="text-4xl font-display text-white">{totalCount}</span>
                            <span className="text-zinc-500 text-sm ml-2">generations</span>
                        </div>
                    </div>
                </LiquidCard>

                {/* Recent Activity Mini-Feed */}
                <div className="md:col-span-2 h-[200px] relative rounded-3xl bg-zinc-900/40 border border-zinc-800/50 p-6 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-zinc-400" />
                            <h4 className="text-zinc-100 font-medium">Recent Activity</h4>
                        </div>
                        <Link href="/dashboard/history" className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                        </div>
                    ) : recentGenerations.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                            No recent activity. Start creating!
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-center h-full">
                            {recentGenerations.map((item) => (
                                <div key={item.id} className="flex-shrink-0 w-24 md:w-28 group cursor-pointer">
                                    <div className="aspect-square rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden relative">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted />
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-2">
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-zinc-500 truncate text-center">
                                        {item.createdAt ? timeAgo(new Date(item.createdAt.seconds * 1000)) : 'Just now'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

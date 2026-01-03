"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Loader2, Film, Image as ImageIcon, Download, History as HistoryIcon } from "lucide-react"
import { downloadMedia } from "@/lib/utils"

interface Generation {
    id: string
    type: 'image' | 'video'
    url: string
    prompt: string
    createdAt: any
    modelId: string
}

import { useRouter } from "next/navigation"

export default function HistoryPage() {
    const { user } = useAuth()
    const [generations, setGenerations] = useState<Generation[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
    const router = useRouter()

    useEffect(() => {
        if (!user) return

        setLoading(true)

        try {
            const q = query(
                collection(db, "generations"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            )

            // Real-time listener
            const unsubscribe = onSnapshot(q, (snapshot: any) => {
                const items: Generation[] = []
                snapshot.forEach((doc: any) => {
                    items.push({ id: doc.id, ...doc.data() } as Generation)
                })
                setGenerations(items)
                setLoading(false)
            }, (error: any) => {
                console.error("Error listening to history:", error)
                setLoading(false)
            })

            return () => unsubscribe()
        } catch (error) {
            console.error("Setup error for history listener:", error)
            setLoading(false)
        }
    }, [user])

    const filteredGenerations = generations.filter(item =>
        filter === 'all' ? true : item.type === filter
    )

    const handleItemClick = (item: Generation) => {
        const params = new URLSearchParams()
        params.set("prompt", item.prompt)
        params.set("result", item.url)
        router.push(`/dashboard/${item.type}-generation?${params.toString()}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-zinc-100">History</h2>
                    <p className="text-zinc-400 mt-2">View and manage your past generations.</p>
                </div>

                {/* Segmented Control */}
                <div className="flex items-center bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
                    {(['all', 'image', 'video'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === type
                                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </button>
                    ))}
                </div>
            </div>

            {filteredGenerations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20">
                    <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                        <HistoryIcon className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-300 font-medium">No generations found</p>
                    <p className="text-zinc-500 text-sm mt-1">Select a model to start creating.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGenerations.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="aspect-square relative overflow-hidden bg-zinc-950">
                                {item.type === 'image' ? (
                                    <img
                                        src={item.url}
                                        alt={item.prompt}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white">
                                            {item.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                                            {item.modelId.split('-')[0]}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                downloadMedia(item.url, `history-${item.type}-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`)
                                            }}
                                            className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-800">
                                <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed h-10">{item.prompt}</p>
                                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                                    <span>
                                        {item.createdAt?.seconds
                                            ? new Date(item.createdAt.seconds * 1000).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'Just now'
                                        }
                                    </span>
                                    <span className="uppercase tracking-wider opacity-60">{item.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

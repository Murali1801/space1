"use client"

import { Bell, Shield, Key, RefreshCw, Trash2, Globe, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { timeAgo } from "@/lib/utils"

export default function SettingsPage() {
    const { user } = useAuth()
    const [apiKey, setApiKey] = useState("sk_live_51Mh...j7k9")
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [stats, setStats] = useState({
        totalRequests: 0,
        lastUsed: "Never"
    })

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "generations"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setStats({
                totalRequests: snapshot.size,
                lastUsed: snapshot.docs.length > 0
                    ? timeAgo(snapshot.docs[0].data().createdAt)
                    : "No activity yet"
            })
        }, (error) => {
            console.error("Settings stats error:", error)
        })

        return () => unsubscribe()
    }, [user])

    const handleRegenerate = () => {
        setIsRegenerating(true)
        setTimeout(() => {
            setApiKey(`sk_live_${Math.random().toString(36).substring(7)}...${Math.random().toString(36).substring(7)}`)
            setIsRegenerating(false)
        }, 1500)
    }

    return (
        <div className="w-full space-y-10 pb-20 px-4 md:px-8">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-display font-medium text-white tracking-tight">System Settings</h2>
                <p className="text-zinc-500 mt-1">Configure your workspace and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Security */}
                <div className="p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-300">Two-Factor Auth</span>
                            </div>
                            <div className="w-10 h-5 bg-zinc-800 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-300">Public Profile</span>
                            </div>
                            <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Management - Full Width */}
                <div className="md:col-span-2 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">API Configuration</h3>
                                <p className="text-sm text-zinc-500">Access your workspace via personal access tokens.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/60 border border-zinc-800 font-mono text-sm flex items-center justify-between group">
                        <span className="text-zinc-400 select-all">{apiKey}</span>
                        <button className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <Globe size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="p-4 rounded-2xl bg-zinc-800/20 border border-zinc-800/40">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Last Activity</p>
                            <p className="text-white font-medium">{stats.lastUsed}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-800/20 border border-zinc-800/40">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Requests</p>
                            <p className="text-white font-medium">{stats.totalRequests.toLocaleString()} successful</p>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="md:col-span-2 p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Email Digest', 'Desktop Push', 'Generation Complete'].map((label) => (
                            <div key={label} className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-sm text-zinc-400">{label}</span>
                                <div className="w-10 h-5 bg-indigo-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="md:col-span-2 p-10 rounded-[40px] bg-zinc-900/40 border border-red-500/20 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                        <p className="text-sm text-zinc-500">Irreversible actions for your account.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-zinc-200 font-bold">Delete Account</h4>
                            <p className="text-xs text-zinc-500 max-w-sm">This will permanently delete your work and subscription.</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold">
                            <Trash2 className="w-4 h-4" />
                            Delete Permanent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

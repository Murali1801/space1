"use client"

import { Moon, Sun, Monitor, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-zinc-100">Settings</h2>
                    <p className="text-zinc-400 mt-2 text-lg">Customize your workspace preferences.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Appearance Card */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
                    <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-indigo-400" />
                        Appearance
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="relative group p-4 rounded-2xl border-2 border-indigo-500 bg-zinc-900/50 flex flex-col items-center gap-3 transition-transform active:scale-95">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                <Moon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-200">Dark Mode</span>
                            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        </button>
                        <button className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex flex-col items-center gap-3 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all active:scale-95">
                            <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                                <Sun className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">Light Mode</span>
                        </button>
                        <button className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex flex-col items-center gap-3 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all active:scale-95">
                            <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                                <Monitor className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">System</span>
                        </button>
                    </div>
                </div>

                {/* Notifications & Privacy */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-100">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-200">Push Notifications</p>
                                    <p className="text-xs text-zinc-500">Get alerts for finished jobs</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-500/20 rounded-full relative transition-colors border border-indigo-500/50">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-200">Email Updates</p>
                                    <p className="text-xs text-zinc-500">Weekly creative digest</p>
                                </div>
                                <div className="w-12 h-6 bg-zinc-800 rounded-full relative transition-colors border border-zinc-700">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-100">Privacy</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-200">Public Profile</p>
                                    <p className="text-xs text-zinc-500">Allow others to see your work</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-500/20 rounded-full relative transition-colors border border-indigo-500/50">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-200">Data usage</p>
                                    <p className="text-xs text-zinc-500">Allow analytics to improve AI</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-500/20 rounded-full relative transition-colors border border-indigo-500/50">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

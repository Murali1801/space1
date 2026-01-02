"use client"

import { Bell } from "lucide-react"

export function DashboardHeader() {
    return (
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-8">
            <h1 className="text-sm font-medium text-zinc-400">Welcome back, User</h1>
            <div className="flex items-center gap-4">
                <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"
                        alt="User"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        </header>
    )
}

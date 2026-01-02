"use client"

import { User, Mail, CreditCard } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

export default function ProfilePage() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-zinc-100">Profile</h2>
                    <p className="text-zinc-400 mt-2 text-lg">Manage your personal information.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* User Info Card */}
                <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1 overflow-hidden">
                    <div className="bg-zinc-900/40 rounded-[20px] p-8 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 ring-4 ring-zinc-900 overflow-hidden">
                                    <User className="h-10 w-10" />
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-500 text-white shadow-lg hover:scale-110 transition-transform">
                                    <span className="sr-only">Change</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-100">User</h3>
                                <p className="text-zinc-400">user@example.com</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Display Name</label>
                                <div className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                    <User className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        defaultValue="User"
                                        className="bg-transparent border-none p-0 text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-0 w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</label>
                                <div className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                    <Mail className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        defaultValue="user@example.com"
                                        className="bg-transparent border-none p-0 text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-0 w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-zinc-800/50">
                            <LiquidCtaButton className="!py-2 !px-6">Save Changes</LiquidCtaButton>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-100">Subscription Plan</h3>
                                <p className="text-zinc-400 text-sm mt-1">Manage your billing and credits.</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700">
                            Free Tier
                        </span>
                    </div>

                    <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-zinc-800/50 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-400">Monthly Credits</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-zinc-100">100</span>
                                <span className="text-sm text-zinc-500">remaining</span>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

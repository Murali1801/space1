"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Menu, X } from "lucide-react"

const navLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/image-generation", label: "Image Gen" },
    { href: "/dashboard/video-generation", label: "Video Gen" },
    { href: "/dashboard/history", label: "History" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/settings", label: "Settings" },
]

export function DashboardNavbar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut(auth)
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
            <nav className="w-full flex items-center justify-between h-14 px-6 rounded-full bg-white/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-lg ring-1 ring-black/5 dark:ring-white/5 relative">
                <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 z-50">
                    <span className="text-xl">Space</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-1.5 text-sm rounded-full transition-colors",
                                    isActive
                                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                )}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                    <button
                        onClick={handleSignOut}
                        className="ml-2 px-4 py-1.5 text-sm rounded-full bg-zinc-100 dark:bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 z-50"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <>
                        {/* Outer Blur Overlay */}
                        <div
                            className="fixed inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm md:hidden z-[-1]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <div className="absolute top-16 left-0 right-0 p-2 md:hidden">
                            {/* Inner Menu - Solid Background, No Blur */}
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 flex flex-col shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                                isActive
                                                    ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    )
                                })}
                                <div className="h-px bg-zinc-200 dark:bg-white/10 mx-4 my-2" />
                                <button
                                    onClick={handleSignOut}
                                    className="mx-2 px-4 py-3 text-sm rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:bg-red-500/20 transition-colors text-center"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </header>
    )
}

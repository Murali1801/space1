"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Image as ImageIcon, Video, History, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Image Generation", href: "/dashboard/image-generation", icon: ImageIcon },
    { name: "Video Generation", href: "/dashboard/video-generation", icon: Video },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-950 border-r border-zinc-800">
            <div className="flex h-16 items-center px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image src="/logo.png" alt="Space Logo" fill className="object-cover" />
                    </div>
                    <span className="text-xl font-bold font-display text-zinc-100">Space</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-zinc-800 text-zinc-100"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-zinc-800">
                <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Link>
            </div>
        </div>
    )
}

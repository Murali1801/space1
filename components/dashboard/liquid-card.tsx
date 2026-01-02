"use client"

import type React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface LiquidCardProps {
    children: React.ReactNode
    className?: string
    startColor?: string
    endColor?: string
}

export function LiquidCard({ children, className, startColor = "#4f46e5", endColor = "#ec4899" }: LiquidCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    return (
        <div
            className={cn(
                "group relative h-full rounded-3xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 transition-all duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 overflow-hidden shadow-sm dark:shadow-none",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${startColor}15, transparent 40%)`,
                }}
            />
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${startColor}40, transparent 40%)`,
                    maskImage: `linear-gradient(to bottom, black 2px, transparent 2px), linear-gradient(to right, black 2px, transparent 2px)`,
                    maskSize: '100% 100%',
                    WebkitMaskImage: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
                }}
            />

            <div className="relative z-10 p-6 h-full backdrop-blur-sm">
                {children}
            </div>
        </div>
    )
}

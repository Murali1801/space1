"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-6 px-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Space Logo" fill className="object-cover" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">SPACE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-6 bg-zinc-800 mx-4" />
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-bold text-white hover:bg-zinc-900 rounded-xl transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-[calc(100%+12px)] left-0 right-0 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="mx-2 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-4 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-zinc-800 my-1 mx-2" />
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-4 text-sm font-bold text-white hover:bg-zinc-900 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-4 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl transition-all text-center mt-1"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

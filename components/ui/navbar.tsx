"use client"
import { useState } from "react"
import Link from "next/link"
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
    <header className="fixed top-0 left-0 right-0 z-40 p-4">
      <nav className="max-w-5xl mx-auto flex items-center justify-between h-12 px-6 rounded-full bg-white/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 z-50">
          <span className="text-xl">Space</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-sm rounded-full transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-2" />
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm rounded-full transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 text-sm rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
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

            <div className="absolute top-14 left-0 right-0 p-2 md:hidden">
              {/* Inner Menu - Solid Background, No Blur */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 flex flex-col shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-4 my-2" />
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mx-2 px-4 py-3 text-sm rounded-xl bg-zinc-900 text-zinc-100 dark:bg-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center mt-1"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}

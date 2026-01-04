import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { AuthProvider } from "@/components/auth-provider"
import { ActivationProvider } from "@/components/activation-provider"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Space | AI Workspace",
  description: "Experience the next generation of AI collaboration.",
  generator: "v0.app",
  icons: {
    icon: "/space-logo.png",
    apple: "/space-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ActivationProvider>
            {children}
          </ActivationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
}

export function FooterSection() {
  return (
    <footer className="px-6 py-24 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Space Logo" fill className="object-cover" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight leading-none">SPACE</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              The next generation AI playground. Create stunning assets with world-class models at record speed.
            </p>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Space AI Inc. Designed for performance.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-zinc-600 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-zinc-600 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

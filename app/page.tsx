import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { ImpactSection } from "@/components/sections/impact-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { CtaSection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ImpactSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}

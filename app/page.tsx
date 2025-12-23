import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ServicesSection } from "@/components/services-section"
import { InvestmentsSection } from "@/components/investments-section"
import { AboutSection } from "@/components/about-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <InvestmentsSection />
      <ServicesSection />
      <AboutSection />
      <PartnersSection />
      <Footer />
    </main>
  )
}

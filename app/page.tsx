import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"

// Lazy load heavy components
const FeaturesSection = dynamic(() => import("@/components/features-section").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="h-96 bg-[#0c3a30] animate-pulse" />,
})

const ServicesSection = dynamic(() => import("@/components/services-section").then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const InvestmentsSection = dynamic(() => import("@/components/investments-section").then(mod => ({ default: mod.InvestmentsSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const AboutSection = dynamic(() => import("@/components/about-section").then(mod => ({ default: mod.AboutSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
})

const PartnersSection = dynamic(() => import("@/components/partners-section").then(mod => ({ default: mod.PartnersSection })), {
  loading: () => <div className="h-32 bg-[#0c3a30] animate-pulse" />,
})

const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64 bg-gray-900 animate-pulse" />,
})

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <Suspense fallback={<div className="h-96 bg-[#0c3a30] animate-pulse" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <InvestmentsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <ServicesSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-[#0c3a30] animate-pulse" />}>
        <PartnersSection />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-gray-900 animate-pulse" />}>
        <Footer />
      </Suspense>
    </main>
  )
}

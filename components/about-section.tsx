"use client"

import { useState } from "react"
import Image from "next/image"

export function AboutSection() {
  const [activeTab, setActiveTab] = useState("mission")

  const tabs = [
    { id: "mission", label: "Our Mission" },
    { id: "quality", label: "Our Quality" },
    { id: "vision", label: "Our Vision" },
    { id: "security", label: "Top Security" },
  ]

  const tabContent = {
    mission: {
      title: "Empowering Financial Innovation",
      description:
        "Our mission is to democratize financial services through innovative technology solutions that make banking accessible, secure, and efficient for everyone.",
      image: "/mission-statement-illustration.png",
    },
    quality: {
      title: "Excellence in Every Service",
      description:
        "We maintain the highest standards of quality in all our financial products and services, ensuring reliability and customer satisfaction.",
      image: "/quality-assurance.png",
    },
    vision: {
      title: "Future of Digital Banking",
      description:
        "We envision a world where financial services are seamlessly integrated into daily life, powered by cutting-edge technology and human-centered design.",
      image: "/future-vision.png",
    },
    security: {
      title: "Bank-Grade Security",
      description:
        "Our security infrastructure employs multiple layers of protection, including encryption, biometric authentication, and real-time fraud detection.",
      image: "/security-technology.png",
    },
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="lg:col-span-7">
            <div className="space-y-4">
              <span className="inline-block bg-[#0c3a30]/10 text-[#0c3a30] px-4 py-2 rounded-full text-sm font-semibold">
                ABOUT US
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Leveraging Technology <span className="text-[#9edd05]">For</span> Secure & Banking
              </h2>
            </div>
          </div>
          <div className="lg:col-span-5">
            <p className="text-gray-600 text-lg">
              By integrating advanced technology with financial expertise we provide a comprehensive suite of services
              that cater to both individuals and businesses
            </p>
          </div>
        </div>

        {/* About Content */}
        <div className="bg-[#edf1ee] rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Tabs */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id ? "bg-[#0c3a30] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {tabContent[activeTab as keyof typeof tabContent].title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {tabContent[activeTab as keyof typeof tabContent].description}
                </p>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Image
                  src={tabContent[activeTab as keyof typeof tabContent].image || "/placeholder.svg"}
                  alt={tabContent[activeTab as keyof typeof tabContent].title}
                  width={500}
                  height={256}
                  className="w-full h-64 object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

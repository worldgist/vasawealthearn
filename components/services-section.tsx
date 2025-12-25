import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowRight, ArrowLeft, Home, Coins, TrendingUp, Percent, Shield, Zap, Clock, Globe } from "lucide-react"
import Link from "next/link"

export function ServicesSection() {
  const services = [
    {
      title: "Real Estate Investment",
      description: "Invest in premium real estate properties with guaranteed returns. Build wealth through property investments with our curated selection of high-yield opportunities.",
      image: "/hus1.png",
      icon: Home,
      href: "/dashboard/real-estate",
      color: "bg-orange-50",
      iconColor: "bg-orange-500",
      highlights: [
        { label: "Avg Return", value: "10.5%", icon: Percent },
        { label: "Min Investment", value: "$5,000", icon: Shield },
        { label: "Risk Level", value: "Low-Medium", icon: Shield },
      ],
      features: ["Property Management", "Tax Benefits", "Passive Income", "Inflation Hedge"]
    },
    {
      title: "Cryptocurrency Investment",
      description: "Diversify your portfolio with leading cryptocurrencies. Trade Bitcoin, Ethereum, and other digital assets with secure, instant transactions.",
      image: "/placeholder-81n9k.png",
      icon: Coins,
      href: "/dashboard/save-invest",
      color: "bg-yellow-50",
      iconColor: "bg-yellow-500",
      highlights: [
        { label: "Avg Return", value: "15-25%", icon: Percent },
        { label: "Min Investment", value: "$100", icon: Shield },
        { label: "24/7 Trading", value: "Available", icon: Clock },
      ],
      features: ["20+ Cryptocurrencies", "Real-time Trading", "Cold Storage", "Low Fees"]
    },
    {
      title: "Stock Investments",
      description: "Access global stock markets and build a diversified portfolio. Invest in blue-chip stocks, ETFs, and index funds with professional guidance.",
      image: "/personal-loan-illustration.png",
      icon: TrendingUp,
      href: "/dashboard/stocks",
      color: "bg-blue-50",
      iconColor: "bg-blue-500",
      highlights: [
        { label: "Avg Return", value: "12-15%", icon: Percent },
        { label: "Min Investment", value: "$500", icon: Shield },
        { label: "Global Markets", value: "Access", icon: Globe },
      ],
      features: ["Blue-chip Stocks", "ETFs & Index Funds", "Dividend Income", "Professional Guidance"]
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <span className="inline-block bg-[#0c3a30]/10 text-[#0c3a30] px-4 py-2 rounded-full text-sm font-semibold">
                OUR SERVICES
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Investment <span className="text-[#9edd05]">Opportunities</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Diversify your portfolio with our comprehensive investment options. From real estate to cryptocurrencies and stocks, grow your wealth with confidence.
              </p>
              <Link href="/signup">
                <Button className="bg-[#0c3a30] hover:bg-[#0c3a30]/90">
                  Start Investing <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right - Services Cards */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <Link key={index} href={service.href || "#"}>
                    <div className="group cursor-pointer">
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-3xl relative">
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                            <IconComponent className={`w-6 h-6 ${service.iconColor.replace('bg-', 'text-')}`} />
                          </div>
                        </div>
                        <div className={`${service.color} rounded-3xl p-6 space-y-4 group-hover:shadow-lg transition-shadow duration-300`}>
                          <div className={`w-12 h-12 ${service.iconColor}/20 rounded-xl flex items-center justify-center`}>
                            <IconComponent className={`w-6 h-6 ${service.iconColor.replace('bg-', 'text-')}`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                          
                          {/* Highlights */}
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                            {service.highlights.map((highlight, idx) => {
                              const HighlightIcon = highlight.icon
                              return (
                                <div key={idx} className="text-center">
                                  <HighlightIcon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                  <div className="text-xs font-semibold text-gray-900">{highlight.value}</div>
                                  <div className="text-xs text-gray-500">{highlight.label}</div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Features */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {service.features.map((feature, idx) => (
                                <span key={idx} className="text-xs bg-white/60 px-2 py-1 rounded-full text-gray-700 font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[#0c3a30] font-semibold group-hover:gap-3 transition-all pt-2">
                            Invest Now <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

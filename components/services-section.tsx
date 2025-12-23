import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowRight, ArrowLeft, Home, Coins, TrendingUp } from "lucide-react"
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
    },
    {
      title: "Cryptocurrency Investment",
      description: "Diversify your portfolio with leading cryptocurrencies. Trade Bitcoin, Ethereum, and other digital assets with secure, instant transactions.",
      image: "/placeholder-81n9k.png",
      icon: Coins,
      href: "/dashboard/save-invest",
      color: "bg-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "Stock Investments",
      description: "Access global stock markets and build a diversified portfolio. Invest in blue-chip stocks, ETFs, and index funds with professional guidance.",
      image: "/personal-loan-illustration.png",
      icon: TrendingUp,
      href: "/dashboard",
      color: "bg-blue-50",
      iconColor: "bg-blue-500",
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
                          <div className="flex items-center gap-2 text-[#0c3a30] font-semibold group-hover:gap-3 transition-all">
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

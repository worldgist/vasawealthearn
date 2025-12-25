import { Home, Coins, TrendingUp, ArrowRight, Shield, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function InvestmentsSection() {
  const investments = [
    {
      title: "Real Estate Investment",
      description: "Invest in premium properties with guaranteed returns. Our curated selection includes residential, commercial, and industrial real estate opportunities.",
      icon: Home,
      features: ["Guaranteed Returns", "Property Management", "Diversified Portfolio"],
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/dashboard/real-estate",
    },
    {
      title: "Cryptocurrency Investment",
      description: "Trade and invest in leading cryptocurrencies including Bitcoin, Ethereum, USDT, and more. Secure, instant transactions with real-time market data.",
      icon: Coins,
      features: ["Multiple Cryptocurrencies", "Real-time Trading", "Secure Wallets"],
      color: "from-yellow-500 to-yellow-600",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      href: "/dashboard/save-invest",
    },
    {
      title: "Stock Investments",
      description: "Access global stock markets with professional guidance. Invest in blue-chip stocks, ETFs, index funds, and build a diversified portfolio.",
      icon: TrendingUp,
      features: ["Global Markets", "Professional Guidance", "Diversified Options"],
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/dashboard",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#0c3a30]/10 text-[#0c3a30] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            INVESTMENT OPTIONS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Grow Your <span className="text-[#9edd05]">Wealth</span> With Confidence
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Diversify your portfolio across multiple asset classes. From real estate to digital assets and traditional stocks, 
            we offer comprehensive investment solutions tailored to your financial goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {investments.map((investment, index) => {
            const IconComponent = investment.icon
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-br ${investment.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className={`${investment.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className={`w-8 h-8 ${investment.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{investment.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{investment.description}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Shield className="w-4 h-4 text-[#0c3a30]" />
                      <span className="font-medium">Key Features:</span>
                    </div>
                    <ul className="space-y-2">
                      {investment.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-[#9edd05] rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={investment.href}>
                      <Button className="w-full mt-6 bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white group-hover:shadow-lg transition-all">
                        Explore Investment
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <DollarSign className="w-8 h-8 text-[#9edd05] mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-2">$2.5B+</div>
            <div className="text-gray-600 text-sm">Assets Under Management</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <BarChart3 className="w-8 h-8 text-[#9edd05] mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-2">15%+</div>
            <div className="text-gray-600 text-sm">Average Annual Returns</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <TrendingUp className="w-8 h-8 text-[#9edd05] mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
            <div className="text-gray-600 text-sm">Active Investors</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Shield className="w-8 h-8 text-[#9edd05] mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600 text-sm">Secure & Regulated</div>
          </div>
        </div>
      </div>
    </section>
  )
}






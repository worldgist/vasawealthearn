import { Home, Coins, TrendingUp, ArrowRight, Shield, DollarSign, BarChart3, Percent, Clock, Globe, Zap, Building2, TrendingDown, Lock, Users, Award, Target, PieChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function InvestmentsSection() {
  const investments = [
    {
      title: "Real Estate Investment",
      description: "Invest in premium properties with guaranteed returns. Our curated selection includes residential, commercial, and industrial real estate opportunities.",
      icon: Home,
      features: [
        "Guaranteed Returns (8-12% annually)",
        "Professional Property Management",
        "Diversified Portfolio Options",
        "Low Volatility Investment",
        "Tax Benefits & Deductions",
        "Passive Income Generation"
      ],
      benefits: [
        "Stable long-term returns",
        "Inflation hedge",
        "Tangible asset ownership",
        "Portfolio diversification"
      ],
      stats: {
        averageReturn: "10.5%",
        minInvestment: "$5,000",
        riskLevel: "Low-Medium",
        liquidity: "Medium"
      },
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/dashboard/real-estate",
    },
    {
      title: "Cryptocurrency Investment",
      description: "Trade and invest in leading cryptocurrencies including Bitcoin, Ethereum, USDT, and more. Secure, instant transactions with real-time market data.",
      icon: Coins,
      features: [
        "20+ Cryptocurrencies Available",
        "Real-time Market Data & Trading",
        "Cold Storage Security",
        "24/7 Market Access",
        "Low Transaction Fees",
        "Instant Settlement"
      ],
      benefits: [
        "High growth potential",
        "Global accessibility",
        "Decentralized assets",
        "Portfolio diversification"
      ],
      stats: {
        averageReturn: "15-25%",
        minInvestment: "$100",
        riskLevel: "High",
        liquidity: "High"
      },
      color: "from-yellow-500 to-yellow-600",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      href: "/dashboard/save-invest",
    },
    {
      title: "Stock Investments",
      description: "Access global stock markets with professional guidance. Invest in blue-chip stocks, ETFs, index funds, and build a diversified portfolio.",
      icon: TrendingUp,
      features: [
        "Global Stock Market Access",
        "Professional Investment Guidance",
        "Diversified ETF & Index Funds",
        "Dividend Income Options",
        "Research & Analytics Tools",
        "Automated Portfolio Rebalancing"
      ],
      benefits: [
        "Proven long-term growth",
        "Dividend income",
        "Liquidity & flexibility",
        "Professional management"
      ],
      stats: {
        averageReturn: "12-15%",
        minInvestment: "$500",
        riskLevel: "Medium",
        liquidity: "High"
      },
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/dashboard/stocks",
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
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden flex flex-col">
                <div className={`bg-gradient-to-br ${investment.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className={`${investment.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className={`w-8 h-8 ${investment.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{investment.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-4">{investment.description}</p>
                    
                    {/* Stats Badge */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Percent className="w-3 h-3" />
                        <span className="font-semibold">{investment.stats.averageReturn}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-semibold">From {investment.stats.minInvestment}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Shield className="w-4 h-4 text-[#0c3a30]" />
                      <span className="font-medium">Key Features:</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {investment.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle className="w-4 h-4 text-[#9edd05] mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Benefits Section */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Award className="w-4 h-4 text-[#0c3a30]" />
                        <span className="font-medium">Key Benefits:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {investment.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 bg-[#9edd05] rounded-full"></div>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk & Stats */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-gray-500 mb-1">Risk Level</div>
                          <div className="font-semibold text-gray-900">{investment.stats.riskLevel}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Liquidity</div>
                          <div className="font-semibold text-gray-900">{investment.stats.liquidity}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link href={investment.href} className="mt-6">
                    <Button className="w-full bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white group-hover:shadow-lg transition-all">
                        Explore Investment
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
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

        {/* Investment Comparison Table */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Compare Investment <span className="text-[#9edd05]">Options</span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect investment option that matches your risk tolerance and financial goals
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0c3a30] to-[#0c3a30]/90 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Investment Type</th>
                    <th className="px-6 py-4 text-center font-semibold">Average Return</th>
                    <th className="px-6 py-4 text-center font-semibold">Min Investment</th>
                    <th className="px-6 py-4 text-center font-semibold">Risk Level</th>
                    <th className="px-6 py-4 text-center font-semibold">Liquidity</th>
                    <th className="px-6 py-4 text-center font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {investments.map((investment, idx) => {
                    const IconComponent = investment.icon
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`${investment.iconBg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                              <IconComponent className={`w-5 h-5 ${investment.iconColor}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{investment.title}</div>
                              <div className="text-sm text-gray-500">{investment.stats.riskLevel} Risk</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-[#9edd05]">{investment.stats.averageReturn}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">{investment.stats.minInvestment}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            investment.stats.riskLevel === "Low-Medium" ? "bg-green-100 text-green-700" :
                            investment.stats.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {investment.stats.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">{investment.stats.liquidity}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={investment.href}>
                            <Button variant="outline" size="sm" className="border-[#0c3a30] text-[#0c3a30] hover:bg-[#0c3a30] hover:text-white">
                              Learn More
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Investment Strategies Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Diversification Strategy</h4>
              <p className="text-gray-600 text-sm mb-4">
                Spread your investments across stocks, crypto, and real estate to minimize risk and maximize returns.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Reduce portfolio volatility</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Capture growth opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Balance risk and reward</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Portfolio Rebalancing</h4>
              <p className="text-gray-600 text-sm mb-4">
                Automatically adjust your portfolio allocation to maintain your target investment mix.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Maintain target allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Lock in gains automatically</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Optimize tax efficiency</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Long-Term Growth</h4>
              <p className="text-gray-600 text-sm mb-4">
                Build wealth over time with our proven investment strategies and professional guidance.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Compound returns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Professional management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#9edd05]" />
                  <span>Regular performance reviews</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-[#0c3a30] to-[#0c3a30]/90 border-0 shadow-xl">
            <CardContent className="p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Investing?
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of investors who are already growing their wealth with our comprehensive investment platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-[#9edd05] hover:bg-[#9edd05]/90 text-[#0c3a30] font-semibold px-8">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}






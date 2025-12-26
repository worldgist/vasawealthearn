import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="inline-block bg-[#0c3a30]/10 text-[#0c3a30] px-4 py-2 rounded-full text-sm font-semibold">
                WELCOME TO Vasawealthearn
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Invest in <span className="text-[#9edd05]">Real Estate</span>, <span className="text-[#9edd05]">Crypto</span> & <span className="text-[#9edd05]">Stocks</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white px-8 py-3 text-lg">
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#0c3a30] text-[#0c3a30] hover:bg-[#0c3a30] hover:text-white px-8 py-3 text-lg bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            <p className="text-lg text-gray-600 leading-relaxed">
              Diversify your portfolio with our comprehensive investment platform. Invest in real estate properties, 
              trade cryptocurrencies, and build wealth through stock investments—all in one secure, user-friendly platform.
            </p>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* User Avatars */}
              <div className="flex items-center bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex -space-x-2">
                  <Image
                    src="/professional-woman-avatar.png"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    loading="lazy"
                  />
                  <Image
                    src="/professional-man-avatar.png"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    loading="lazy"
                  />
                  <Image
                    src="/business-person-avatar.png"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    loading="lazy"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#9edd05] flex items-center justify-center text-sm font-bold text-[#0c3a30] border-2 border-white">
                    8k+
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-lg">
                    4.9/5 <span className="font-normal text-gray-600">Rating</span>
                  </div>
                  <div className="text-sm text-gray-500">From over 1000+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#9edd05]/20 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-[#9edd05] rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Create A Card That Is Unique And Customized</h3>
              <div className="bg-[#def1ee] rounded-2xl p-6">
                <Image src="/modern-credit-card.png" alt="Credit Card" width={400} height={128} className="w-full h-32 object-contain" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#9edd05]/20 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-[#9edd05] rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Advanced Security & Protection</h3>
              <div className="bg-[#def1ee] rounded-2xl p-6">
                <Image src="/security-shield-icon.png" alt="Security" width={400} height={128} className="w-full h-32 object-contain" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#9edd05]/20 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-[#9edd05] rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real-time Analytics & Insights</h3>
              <div className="bg-[#def1ee] rounded-2xl p-6">
                <Image src="/financial-analytics-dashboard.png" alt="Analytics" width={400} height={128} className="w-full h-32 object-contain" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

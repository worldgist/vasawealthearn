import { Users, CreditCard, Globe } from "lucide-react"
import Image from "next/image"

export function FeaturesSection() {
  return (
    <section className="bg-[#0c3a30] py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div className="bg-[#9edd05] rounded-3xl p-8 relative overflow-hidden">
              <Image
                src="/modern-banking-app.png"
                alt="Banking App"
                width={600}
                height={320}
                className="w-full h-80 object-contain relative z-10"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="inline-block bg-[#9edd05]/20 text-[#9edd05] px-4 py-2 rounded-full text-sm font-semibold">
                TOP FEATURES
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Let's Take Your <span className="text-[#9edd05]">Analytics</span> To The Next Level
              </h2>
              <p className="text-white/80 text-lg">
                With a robust suite of products ranging from digital banking and payment processing to wealth management
                and blockchain applications we empower our clients.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#29594b] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9edd05]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#9edd05]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Local Business Finance</h3>
                    <p className="text-white/80">
                      Our commitment to security transparency and customer centricity ensures that every transaction is
                      no.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#29594b] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9edd05]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-[#9edd05]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Built For Global Payments</h3>
                    <p className="text-white/80">
                      Our commitment to security transparency and customer centricity ensures that every transaction is
                      no.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#29594b] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9edd05]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-[#9edd05]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Make Internet Of Money</h3>
                    <p className="text-white/80">
                      Our commitment to security transparency and customer centricity ensures that every transaction is
                      no.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

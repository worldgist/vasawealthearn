import Image from "next/image"

export function PartnersSection() {
  const partners = [
    "/abstract-tech-logo.png",
    "/financial-services-logo.png",
    "/startup-logo.png",
    "/placeholder.svg?height=60&width=120",
    "/placeholder.svg?height=60&width=120",
  ]

  return (
    <section className="bg-[#0c3a30] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-white/80 text-sm font-semibold tracking-wider">
            TRUSTED BY INDUSTRY LEADING COMPANIES AROUND THE GLOBE
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
          {partners.map((partner, index) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
              <Image
                src={partner || "/placeholder.svg"}
                alt={`Partner ${index + 1}`}
                width={120}
                height={48}
                className="h-12 w-auto object-contain filter brightness-0 invert"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

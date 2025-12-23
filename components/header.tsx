"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Menu, X } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top Header */}
      <div className="bg-[#0c3a30] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 md:mb-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4" />
                <span>
                  <strong>Call:</strong> +16466539023
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4" />
                <span>
                  <strong>Mail:</strong> support@vasawealthearn.com
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-transparent border border-white/20 rounded px-2 py-1 text-white text-sm">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-sm py-4 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="Vasawealthearn" className="h-8 w-auto" />
                <span className="text-xl lg:text-2xl font-bold text-[#0c3a30] hover:text-[#0c3a30]/90">
                  Vasawealthearn
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium">
                Services
              </a>
              <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium">
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" className="bg-transparent text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-sm px-3 lg:px-4">Get Started</Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t lg:hidden z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium py-2">
                    Services
                  </a>
                  <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium py-2">
                    About
                  </a>
                  <a href="#" className="text-gray-700 hover:text-[#0c3a30] font-medium py-2">
                    Contact
                  </a>
                  <div className="pt-4 border-t sm:hidden">
                    <Link href="/login">
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

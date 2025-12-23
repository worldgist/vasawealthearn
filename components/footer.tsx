import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0c3a30] pt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Newsletter */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Subscribe Newsletter</h2>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter Your Email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-[#9edd05] hover:bg-[#9edd05]/90 text-[#0c3a30] font-semibold">
                Subscribe <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Blog & News
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Mobile App
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Mobile Banking
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Advanced Security
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Digital Wallet
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Budgeting Tools
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Making Transactions
                </a>
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Get In Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#9edd05] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold">Location:</span>
                  <p className="text-white/80">34th St NW, Washington, DC 20007</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#9edd05] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold">Email:</span>
                  <p className="text-white/80">support@vasawealthearn.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#9edd05] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold">Phone:</span>
                  <p className="text-white/80">+16466539023</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 py-8">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <p className="text-white/80 text-center md:text-left">
              © 2025 <span className="text-white font-semibold">Vasawealthearn</span> All rights reserved.
            </p>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Vasawealthearn</div>
            </div>
            <ul className="flex justify-center md:justify-end gap-6">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

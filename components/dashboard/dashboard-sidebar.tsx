"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Download,
  PiggyBank,
  Coins,
  Home,
  FileText,
  Clock,
  Settings,
  HelpCircle,
  Shield,
  User,
  LogOut,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Transactions", href: "/dashboard/transactions" },
  { icon: CreditCard, label: "Cards", href: "/dashboard/cards" },
]

const transferItems = [
  { icon: Download, label: "Deposit", href: "/dashboard/deposit" },
]

const investmentItems = [
  { icon: Coins, label: "Crypto Investment", href: "/dashboard/save-invest" },
  { icon: Home, label: "Real Estate Investment", href: "/dashboard/real-estate" },
  { icon: BarChart3, label: "Stock Investment", href: "/dashboard/stocks" },
]

const serviceItems = [
  { icon: FileText, label: "Loan Request", href: "/dashboard/loan-request" },
  { icon: Clock, label: "Loan History", href: "/dashboard/loan-history" },
]

const accountItems = [
  { icon: Settings, label: "Settings", href: "/dashboard/account/settings" },
  { icon: HelpCircle, label: "Support Ticket", href: "/dashboard/account/support" },
]

interface DashboardSidebarProps {
  activeItem?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ activeItem, isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState("User")
  const [userInitials, setUserInitials] = useState("U")
  const [accountNumber, setAccountNumber] = useState("")

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile) {
          const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
          setUserName(fullName || user.email?.split("@")[0] || "User")
          setAccountNumber(profile.account_number || "")
          
          // Generate initials
          if (profile.first_name && profile.last_name) {
            setUserInitials(
              `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
            )
          } else if (profile.first_name) {
            setUserInitials(profile.first_name[0].toUpperCase())
          } else if (user.email) {
            setUserInitials(user.email[0].toUpperCase())
          }
        } else {
          // Fallback to user email
          setUserName(user.email?.split("@")[0] || "User")
          setUserInitials(user.email?.[0].toUpperCase() || "U")
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const isActive = (href: string) => {
    if (activeItem) {
      return pathname === href
    }
    return pathname === href
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  const handleMobileNavigation = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">{title}</h3>
      <nav className="space-y-1">
        {items.map((item, index) => (
          <Link key={index} href={item.href} prefetch={true} onClick={handleMobileNavigation}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-normal",
                isActive(item.href) && "bg-[#c4d626] text-[#0c3a30] hover:bg-[#c4d626]/90 font-medium",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  )

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        "fixed top-0 left-0 z-50",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#c4d626] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-[#0c3a30]">{userInitials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{userName}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
          <Link href="/dashboard/kyc-verification" prefetch={true} className="text-xs sm:text-sm text-orange-600 hover:text-orange-700">
            Verify KYC
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Link href="/dashboard/profile" prefetch={true} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </Button>
                </Link>
          <Button variant="default" size="sm" className="flex-1 bg-gray-800 hover:bg-gray-900 text-xs sm:text-sm" onClick={handleLogout}>
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <MenuSection title="MAIN MENU" items={mainMenuItems} />
        <MenuSection title="TRANSFERS" items={transferItems} />
        <MenuSection title="INVESTMENTS" items={investmentItems} />
        <MenuSection title="SERVICES" items={serviceItems} />
        <MenuSection title="ACCOUNT" items={accountItems} />
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
          <Shield className="h-3 w-3" />
          <span>Secure Banking</span>
        </div>
        <div className="text-xs text-gray-400">v1.2.0</div>
      </div>
    </aside>
  )
}

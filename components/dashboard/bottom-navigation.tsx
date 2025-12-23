"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, BarChart3, Grid3x3, CreditCard, User, LayoutDashboard, TrendingUp, Download, Coins, FileText, Clock, History, X, Lock, Settings, HelpCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [fabMenuOpen, setFabMenuOpen] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userInitials, setUserInitials] = useState("U")
  const [kycStatus, setKycStatus] = useState("pending")

  useEffect(() => {
    // Load user profile in background, don't block UI
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
          .select("first_name, last_name, kyc_status")
          .eq("id", user.id)
          .single()

        if (profile) {
          const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.email?.split("@")[0] || "User"
          setUserName(name)
          setUserInitials(name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U")
          setKycStatus(profile.kyc_status || "pending")
        } else {
          const name = user.email?.split("@")[0] || "User"
          setUserName(name)
          setUserInitials(name[0].toUpperCase())
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Banking menu items matching the image layout (5 rows x 3 columns)
  const bankingMenuItems = [
    // Row 1
    { icon: Home, label: "Home", href: "/dashboard", color: "bg-green-100" },
    { icon: TrendingUp, label: "Activity", href: "/dashboard/transactions", color: "bg-yellow-100" },
    { icon: CreditCard, label: "Cards", href: "/dashboard/cards", color: "bg-green-100" },
    // Row 2
    { icon: Download, label: "Deposit", href: "/dashboard/deposit", color: "bg-yellow-100" },
    // Row 3
    { icon: Coins, label: "Save and Invest", href: "/dashboard/save-invest", color: "bg-green-100" },
    { icon: FileText, label: "Loan", href: "/dashboard/loan-request", color: "bg-yellow-100" },
    // Row 4
    { icon: Settings, label: "Settings", href: "/dashboard/account/settings", color: "bg-green-100" },
    { icon: HelpCircle, label: "Support", href: "/dashboard/account/support", color: "bg-yellow-100" },
    { icon: LogOut, label: "Logout", href: "#", color: "bg-pink-100", action: handleLogout },
  ]

  const handleFeatureClick = (item: typeof bankingMenuItems[0]) => {
    if (item.action) {
      item.action()
    } else {
      setFabMenuOpen(false)
      // Use router.push for faster client-side navigation
      router.push(item.href)
    }
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: CreditCard, label: "Cards", href: "/dashboard/cards" },
    { icon: Clock, label: "History", href: "/dashboard/transactions" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] shadow-lg rounded-t-2xl">
      <div className="relative flex items-center justify-around h-16 px-2 pb-2 pt-1">
        {/* Left side items: Home and Cards */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors py-1",
                isActive ? "text-[#0c3a30]" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-[#0c3a30]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Center Floating Action Button (FAB) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-7 z-10">
          <Button
            onClick={() => setFabMenuOpen(true)}
            className={cn(
              "w-14 h-14 rounded-full shadow-2xl transition-all border-2 border-white",
              "bg-[#0c3a30] text-white hover:bg-[#0c3a30]/90 active:scale-95",
              "flex items-center justify-center hover:shadow-3xl"
            )}
          >
            <Grid3x3 className="h-6 w-6" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Right side items: History and Profile */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors py-1",
                isActive ? "text-[#0c3a30]" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-[#0c3a30]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* FAB Menu Dialog */}
      <Dialog open={fabMenuOpen} onOpenChange={setFabMenuOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
          {/* User Profile Section */}
          <div className="bg-white border-b border-gray-200 p-4 relative">
            <button
              onClick={() => setFabMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 pr-8">
              <div className="w-12 h-12 bg-[#c4d626] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-[#0c3a30]">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{userName}</h3>
                <Link
                  href="/dashboard/kyc-verification"
                  prefetch={true}
                  onClick={() => setFabMenuOpen(false)}
                  className="inline-flex items-center space-x-1 mt-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <Lock className="h-3 w-3" />
                  <span>Verify Account</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Banking Menu Section */}
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Banking Menu</h2>
              <p className="text-sm text-gray-600 mt-1">Select an option to continue</p>
            </div>

            {/* Grid Layout - 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              {bankingMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleFeatureClick(item)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg transition-all",
                    "hover:scale-105 active:scale-95",
                    item.color,
                    item.label === "Logout" ? "bg-pink-100 hover:bg-pink-200" : "hover:opacity-90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 mb-2",
                      item.label === "Activity" || item.label === "Transfer" || item.label === "Loan" || item.label === "Support"
                        ? "text-yellow-600"
                        : item.label === "Logout"
                        ? "text-pink-600"
                        : "text-gray-800"
                    )}
                  />
                  <span className="text-xs font-medium text-center text-gray-900 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}


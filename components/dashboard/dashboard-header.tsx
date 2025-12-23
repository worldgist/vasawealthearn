"use client"

import { useState } from "react"
import { ChevronDown, User, Settings, HelpCircle, LogOut, Menu, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationDropdown } from "./notification-dropdown"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between space-x-2 lg:space-x-4">
          {/* Left side - Hamburger menu (mobile) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop - Logo/Brand (optional) */}
          <div className="hidden lg:flex items-center space-x-2">
            <img src="/logo.png" alt="Vasawealthearn" className="h-8 w-auto" />
            <span className="text-lg font-bold text-[#0c3a30]">Vasawealthearn</span>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center space-x-2 lg:space-x-4 ml-auto">
            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-1 lg:p-2 h-auto">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#c4d626] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-[#0c3a30]" />
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                       <DropdownMenuItem asChild>
                         <Link href="/dashboard/account/info" prefetch={true} className="flex items-center">
                           <User className="mr-2 h-4 w-4" />
                           Account Info
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href="/dashboard/kyc-verification" prefetch={true} className="flex items-center">
                           <Shield className="mr-2 h-4 w-4" />
                           Verification
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href="/dashboard/account/settings" prefetch={true} className="flex items-center">
                           <Settings className="mr-2 h-4 w-4" />
                           Settings
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href="/dashboard/account/support" prefetch={true} className="flex items-center">
                           <HelpCircle className="mr-2 h-4 w-4" />
                           Support Ticket
                         </Link>
                       </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

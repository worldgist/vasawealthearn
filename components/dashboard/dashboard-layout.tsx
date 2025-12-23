"use client"

import type React from "react"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { BottomNavigation } from "./bottom-navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeItem?: string
}

export function DashboardLayout({ children, activeItem }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex">
        <DashboardSidebar
          activeItem={activeItem}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0 transition-all duration-300 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  )
}

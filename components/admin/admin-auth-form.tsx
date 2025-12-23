"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield } from "lucide-react"

export function AdminAuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate admin authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push("/admin/dashboard")
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="admin-email" className="text-gray-700">
          Admin Email Address
        </Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="admin@vasawealthearn.com"
          className="mt-1 focus:ring-[#c4d626] focus:border-[#c4d626]"
          required
        />
      </div>

      <div>
        <Label htmlFor="admin-password" className="text-gray-700">
          Admin Password
        </Label>
        <div className="relative mt-1">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your admin password"
            className="pr-10 focus:ring-[#c4d626] focus:border-[#c4d626]"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember-admin"
          type="checkbox"
          className="h-4 w-4 text-[#c4d626] focus:ring-[#c4d626] border-gray-300 rounded"
        />
        <Label htmlFor="remember-admin" className="ml-2 text-sm text-gray-700">
          Keep me signed in
        </Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-[#0c3a30] hover:bg-[#0a2f26] text-white">
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing In...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Access Admin Portal
          </div>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">Secure admin access • All activities are logged and monitored</p>
      </div>
    </form>
  )
}

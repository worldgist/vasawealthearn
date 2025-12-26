"use client"

export const dynamic = 'force-dynamic'

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Key, Copy, HelpCircle, ArrowRight, Save, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const [accountNumber, setAccountNumber] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        setErrorMessage("Failed to load profile data")
        return
      }

      if (profile) {
        setAccountNumber(profile.account_number || "")
        setFormData({
          first_name: profile.first_name || "",
          middle_name: profile.middle_name || "",
          last_name: profile.last_name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth
            ? new Date(profile.date_of_birth).toISOString().split("T")[0]
            : "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip_code: profile.zip_code || "",
          country: profile.country || "United States",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setErrorMessage("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage("")
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("You must be logged in to update your profile")
        return
      }

      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        setErrorMessage("First name and last name are required")
        return
      }

      // Validate email format
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setErrorMessage("Please enter a valid email address")
        return
      }

      // Validate date of birth if provided
      if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth)
        const today = new Date()
        if (dob > today) {
          setErrorMessage("Date of birth cannot be in the future")
          return
        }
      }

      const updateData: any = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        country: formData.country || "United States",
        updated_at: new Date().toISOString(),
      }

      // Only update email if it's different from auth email
      const { data: authUser } = await supabase.auth.getUser()
      if (formData.email && formData.email !== authUser.user?.email) {
        // Note: Email updates typically require verification, so we might want to handle this differently
        // For now, we'll just update the profile email field
        updateData.email = formData.email
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        setErrorMessage("Failed to update profile. Please try again.")
        return
      }

      setSuccessMessage("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrorMessage("")
    loadProfile() // Reload original data
  }

  const copyAccountNumber = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("account_number").eq("id", user.id).single()
      if (profile?.account_number) {
        navigator.clipboard.writeText(profile.account_number)
        setSuccessMessage("Account number copied to clipboard!")
        setTimeout(() => setSuccessMessage(""), 2000)
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4d626] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 p-6 border-r border-gray-200 bg-gray-50">
          {/* User Profile Card */}
          <Card className="mb-6 bg-gradient-to-br from-[#0c3a30] to-[#1a5a4a] text-white">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-xl font-bold text-white">
                  {formData.first_name?.[0] || ""}
                  {formData.last_name?.[0] || ""}
                </span>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {formData.first_name} {formData.middle_name} {formData.last_name}
              </h3>
              <p className="text-sm text-gray-300">
                {formData.email || "No email"}
              </p>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <Tabs defaultValue="profile" className="mb-6">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger
                value="profile"
                className="w-full justify-start bg-[#c4d626] text-[#0c3a30] data-[state=active]:bg-[#c4d626] data-[state=active]:text-[#0c3a30] hover:bg-[#c4d626]/90 py-3"
              >
                <User className="mr-2 h-4 w-4" />
                Profile Information
              </TabsTrigger>
              <Link href="/dashboard/account/settings/security">
                <TabsTrigger
                  value="security"
                  className="w-full justify-start bg-white text-gray-600 data-[state=active]:bg-[#c4d626] data-[state=active]:text-[#0c3a30] hover:bg-gray-50 py-3"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </TabsTrigger>
              </Link>
              <Link href="/dashboard/account/settings/pin">
                <TabsTrigger
                  value="pin"
                  className="w-full justify-start bg-white text-gray-600 data-[state=active]:bg-[#c4d626] data-[state=active]:text-[#0c3a30] hover:bg-gray-50 py-3"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Transaction PIN
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>

          {/* Help Section */}
          <Card className="bg-[#c4d626]/10 border-[#c4d626]/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-[#0c3a30]" />
                </div>
                <h4 className="font-semibold text-gray-900">Need Help?</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team if you need assistance with your account settings or have any questions.
              </p>
              <Link href="/dashboard/account/support/contact">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Contact Support
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
                </div>
                <p className="text-gray-600">Your personal information and account details</p>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#c4d626] hover:bg-[#b8c423] text-black"
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-[#c4d626] hover:bg-[#b8c423] text-black">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50 border-gray-200" : ""}`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Middle Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="middle_name"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50 border-gray-200" : ""}`}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50 border-gray-200" : ""}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                  Account Number
                </Label>
                <div className="relative">
                  <Input
                    id="accountNumber"
                    value={accountNumber || "Loading..."}
                    className="pr-10 bg-gray-50 border-gray-200"
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={copyAccountNumber}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">This is your unique account identifier</p>
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Changing your email may require verification
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 mb-2 block">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1234567890"
                  className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${!isEditing ? "bg-gray-50 border-gray-200" : ""} min-h-[100px]`}
                  placeholder="Street address"
                />
              </div>

              {/* City, State, Zip Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700 mb-2 block">
                    Zip Code
                  </Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 border-gray-200" : ""}
                />
              </div>

              {/* Information Notice */}
              {!isEditing && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Profile Information</h4>
                        <p className="text-sm text-blue-800">
                          Click "Edit Profile" to update your personal information. Some changes may require
                          verification.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

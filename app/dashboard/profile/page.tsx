"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Settings,
  HelpCircle,
  User,
  LogOut,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [userName, setUserName] = useState("User")
  const [accountNumber, setAccountNumber] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [profileData, setProfileData] = useState({
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
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Error getting user:", userError)
        toast({
          title: "Error",
          description: "Failed to load user information. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view your profile.",
          variant: "destructive",
        })
        router.push("/login")
        setIsLoading(false)
        return
      }

      // Set user email from auth
      setUserEmail(user.email || "")

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error loading profile:", profileError)
        
        // If profile doesn't exist, create one with data from user metadata
        if (profileError.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || "",
              middle_name: user.user_metadata?.middle_name || "",
              last_name: user.user_metadata?.last_name || "",
              phone: user.user_metadata?.phone || "",
              country: user.user_metadata?.country || "United States",
            })
            .select()
            .single()

          if (createError) {
            console.error("Error creating profile:", createError)
            toast({
              title: "Error",
              description: "Failed to create profile. Please try again.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          // Use the newly created profile, with fallback to user metadata
          if (newProfile) {
            const firstName = newProfile.first_name || user.user_metadata?.first_name || ""
            const middleName = newProfile.middle_name || user.user_metadata?.middle_name || ""
            const lastName = newProfile.last_name || user.user_metadata?.last_name || ""
            const phone = newProfile.phone || user.user_metadata?.phone || ""
            
            setUserName(`${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "User")
            setAccountNumber(newProfile.account_number || "")
            setProfileData({
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              email: newProfile.email || user.email || "",
              phone: phone,
              date_of_birth: newProfile.date_of_birth
                ? new Date(newProfile.date_of_birth).toISOString().split("T")[0]
                : "",
              address: newProfile.address || "",
              city: newProfile.city || "",
              state: newProfile.state || "",
              zip_code: newProfile.zip_code || "",
              country: newProfile.country || user.user_metadata?.country || "United States",
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile. Please try again.",
            variant: "destructive",
          })
        }
        setIsLoading(false)
        return
      }

      if (profile) {
        // Get data from profile, fallback to user metadata if profile fields are empty
        const firstName = profile.first_name || user.user_metadata?.first_name || ""
        const middleName = profile.middle_name || user.user_metadata?.middle_name || ""
        const lastName = profile.last_name || user.user_metadata?.last_name || ""
        const phone = profile.phone || user.user_metadata?.phone || ""
        
        const fullName = `${firstName} ${lastName}`.trim()
        setUserName(fullName || user.email?.split("@")[0] || "User")
        setAccountNumber(profile.account_number || "")
        
        // Load full profile data for editing, prioritizing profile data but using metadata as fallback
        setProfileData({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email: profile.email || user.email || "",
          phone: phone,
          date_of_birth: profile.date_of_birth
            ? new Date(profile.date_of_birth).toISOString().split("T")[0]
            : "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip_code: profile.zip_code || "",
          country: profile.country || user.user_metadata?.country || "United States",
        })
      } else {
        // If no profile exists, use user metadata from signup
        const firstName = user.user_metadata?.first_name || ""
        const middleName = user.user_metadata?.middle_name || ""
        const lastName = user.user_metadata?.last_name || ""
        const phone = user.user_metadata?.phone || ""
        const fullName = `${firstName} ${lastName}`.trim()
        
        setUserName(fullName || user.email?.split("@")[0] || "User")
        setProfileData({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email: user.email || "",
          phone: phone,
          date_of_birth: "",
          address: "",
          city: "",
          state: "",
          zip_code: "",
          country: user.user_metadata?.country || "United States",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        })
        return
      }

      // Validate required fields
      if (!profileData.first_name || !profileData.last_name) {
        toast({
          title: "Validation Error",
          description: "First name and last name are required",
          variant: "destructive",
        })
        return
      }

      // Validate email format
      if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return
      }

      // Validate date of birth if provided
      if (profileData.date_of_birth) {
        const dob = new Date(profileData.date_of_birth)
        const today = new Date()
        if (dob > today) {
          toast({
            title: "Validation Error",
            description: "Date of birth cannot be in the future",
            variant: "destructive",
          })
          return
        }
      }

      const updateData: any = {
        first_name: profileData.first_name,
        middle_name: profileData.middle_name || null,
        last_name: profileData.last_name,
        phone: profileData.phone || null,
        date_of_birth: profileData.date_of_birth || null,
        address: profileData.address || null,
        city: profileData.city || null,
        state: profileData.state || null,
        zip_code: profileData.zip_code || null,
        country: profileData.country || "United States",
        updated_at: new Date().toISOString(),
      }

      // Only update email if it's different from auth email
      const { data: authUser } = await supabase.auth.getUser()
      if (profileData.email && profileData.email !== authUser.user?.email) {
        updateData.email = profileData.email
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      setEditDialogOpen(false)
      loadUserProfile() // Reload to update displayed name
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditDialogOpen(false)
    loadUserProfile() // Reload original data
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const accountItems = [
    { icon: User, label: "Account Info", href: "/dashboard/account/info", color: "bg-cyan-50 text-cyan-700", action: null },
    { icon: Shield, label: "Verification", href: "/dashboard/kyc-verification", color: "bg-blue-50 text-blue-700", action: null },
    { icon: Settings, label: "Settings", href: "/dashboard/account/settings", color: "bg-gray-50 text-gray-700", action: null },
    { icon: HelpCircle, label: "Support Ticket", href: "/dashboard/account/support", color: "bg-slate-50 text-slate-700", action: null },
    { icon: LogOut, label: "Logout", href: "#", color: "bg-red-50 text-red-700", action: handleLogout },
  ]

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, index) => {
          if (item.action) {
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          }
          return (
            <Link key={index} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 lg:pb-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-[#0c3a30] to-[#1a5a4a] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0c3a30]">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{isLoading ? "Loading..." : userName}</h1>
                  {userEmail && (
                    <p className="text-gray-300 text-sm mt-1">{userEmail}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Sections */}
        <div className="space-y-6">
          <MenuSection title="Account" items={accountItems} />
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information and account details</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="First Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Middle Name
                  </Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    value={profileData.middle_name}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 mb-2 block">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Street Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700 mb-2 block">
                    ZIP Code
                  </Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={profileData.zip_code}
                    onChange={handleInputChange}
                    placeholder="12345"
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
                  value={profileData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-[#c4d626] hover:bg-[#b8c423] text-[#0c3a30]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}


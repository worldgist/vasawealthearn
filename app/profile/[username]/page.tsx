"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Globe,
  Building,
} from "lucide-react"
import Link from "next/link"

interface PublicProfile {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
  kyc_status: string
  account_status: string
  is_verified: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params?.username as string
  const supabase = createClient()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get profile - first try RPC function, then fallback to direct query
      let profileData = null
      
      try {
        // Try RPC function first (if it exists)
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_profile", {
          profile_username: username,
          profile_id: username,
        })

        if (rpcData && rpcData.length > 0) {
          profileData = rpcData[0]
        } else if (rpcError && rpcError.code !== "P0001") {
          // If RPC function doesn't exist or fails, try direct query
          const { data: directData, error: directError } = await supabase
            .from("profiles")
            .select("id, username, first_name, last_name, created_at, kyc_status, account_status")
            .or(`username.eq.${username},id.eq.${username}`)
            .eq("kyc_status", "verified")
            .single()

          if (directError && directError.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is expected if profile doesn't exist
            throw directError
          }

          if (directData) {
            profileData = {
              ...directData,
              is_verified: directData.kyc_status === "verified",
              account_status: directData.account_status || "active",
            }
          }
        }
      } catch (err: any) {
        // Fallback to direct query if RPC fails
        const { data: directData, error: directError } = await supabase
          .from("profiles")
          .select("id, username, first_name, last_name, created_at, kyc_status, account_status")
          .or(`username.eq.${username},id.eq.${username}`)
          .eq("kyc_status", "verified")
          .single()

        if (directError && directError.code !== "PGRST116") {
          throw directError
        }

        if (directData) {
          profileData = {
            ...directData,
            is_verified: directData.kyc_status === "verified",
            account_status: directData.account_status || "active",
          }
        }
      }

      if (!profileData) {
        setError("Profile not found or not publicly available")
      } else {
        setProfile(profileData)
      }
    } catch (err: any) {
      console.error("Error loading profile:", err)
      setError(err.message || "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || ""
    const second = lastName?.[0] || ""
    return `${first}${second}`.toUpperCase() || "U"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-6 mb-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "This profile is not available or does not exist."}
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0c3a30] to-[#1a5a4a] text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#c4d626] rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0c3a30]">
                    {getInitials(profile.first_name, profile.last_name)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white mb-1">
                    {profile.first_name && profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.username || "User"}
                  </CardTitle>
                  {profile.username && (
                    <p className="text-gray-200 text-sm">@{profile.username}</p>
                  )}
                </div>
              </div>
              <Badge
                variant={profile.is_verified ? "default" : "secondary"}
                className={
                  profile.is_verified
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }
              >
                {profile.is_verified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Pending
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#0c3a30]" />
                  Profile Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-base font-medium text-gray-900">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : "Not provided"}
                    </p>
                  </div>

                  {profile.username && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-base font-medium text-gray-900">@{profile.username}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#0c3a30]" />
                  Account Status
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">KYC Status</label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          profile.kyc_status === "verified"
                            ? "default"
                            : profile.kyc_status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          profile.kyc_status === "verified"
                            ? "bg-green-500 hover:bg-green-600"
                            : profile.kyc_status === "pending"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {profile.kyc_status.charAt(0).toUpperCase() + profile.kyc_status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Status</label>
                    <div className="mt-1">
                      <Badge
                        variant={profile.account_status === "active" ? "default" : "secondary"}
                        className={
                          profile.account_status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        }
                      >
                        {profile.account_status.charAt(0).toUpperCase() +
                          profile.account_status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {profile.is_verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-base font-medium text-gray-900">Verified User</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-yellow-500" />
                          <span className="text-base font-medium text-gray-900">
                            Verification Pending
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-[#0c3a30]/5 rounded-lg p-6 text-center">
                <Globe className="h-8 w-8 text-[#0c3a30] mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Join Our Platform
                </h4>
                <p className="text-gray-600 mb-4">
                  Create your account and start managing your finances today.
                </p>
                <div className="flex justify-center space-x-3">
                  <Link href="/signup">
                    <Button className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


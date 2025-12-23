"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { uploadKYCDocument } from "@/lib/supabase/storage"
import {
  Shield,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Address Verification", icon: MapPin },
  { id: 3, title: "Document Upload", icon: FileText },
  { id: 4, title: "Identity Verification", icon: Camera },
]

export default function KYCVerificationPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [kycStatus, setKycStatus] = useState<"pending" | "approved" | "rejected" | null>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    ssn: "",

    // Driver License Information
    licenseNumber: "",
    licenseState: "",
    licenseExpiry: "",

    // Address Information
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Document Uploads
    licenseFront: null as File | null,
    licenseBack: null as File | null,
    selfie: null as File | null,
  })

  const [uploadPreviews, setUploadPreviews] = useState({
    licenseFront: "",
    licenseBack: "",
    selfie: "",
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Load existing KYC submission
      const { data: kycSubmission, error: kycError } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single()

      if (kycSubmission && !kycError) {
        setExistingSubmission(kycSubmission)
        setKycStatus(kycSubmission.status)
        
        // Load existing submission data into form
        setFormData((prev) => ({
          ...prev,
          firstName: kycSubmission.first_name || "",
          middleName: kycSubmission.middle_name || "",
          lastName: kycSubmission.last_name || "",
          dateOfBirth: kycSubmission.date_of_birth
            ? new Date(kycSubmission.date_of_birth).toISOString().split("T")[0]
            : "",
          ssn: kycSubmission.ssn || "",
          licenseNumber: kycSubmission.license_number || "",
          licenseState: kycSubmission.license_state || "",
          licenseExpiry: kycSubmission.license_expiry
            ? new Date(kycSubmission.license_expiry).toISOString().split("T")[0]
            : "",
          streetAddress: kycSubmission.street_address || "",
          city: kycSubmission.city || "",
          state: kycSubmission.state || "",
          zipCode: kycSubmission.zip_code || "",
          country: kycSubmission.country || "United States",
        }))

        // Load existing document URLs as previews
        if (kycSubmission.license_front_url) {
          setUploadPreviews((prev) => ({
            ...prev,
            licenseFront: kycSubmission.license_front_url,
          }))
        }
        if (kycSubmission.license_back_url) {
          setUploadPreviews((prev) => ({
            ...prev,
            licenseBack: kycSubmission.license_back_url,
          }))
        }
        if (kycSubmission.selfie_url) {
          setUploadPreviews((prev) => ({
            ...prev,
            selfie: kycSubmission.selfie_url,
          }))
        }
      }

      // Load profile data to fill in missing fields
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profile) {
        // Only fill in fields that aren't already set from KYC submission
        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || profile.first_name || user.user_metadata?.first_name || "",
          middleName: prev.middleName || profile.middle_name || user.user_metadata?.middle_name || "",
          lastName: prev.lastName || profile.last_name || user.user_metadata?.last_name || "",
          streetAddress: prev.streetAddress || profile.address || "",
          city: prev.city || profile.city || "",
          state: prev.state || profile.state || "",
          zipCode: prev.zipCode || profile.zip_code || "",
          country: prev.country || profile.country || "United States",
          dateOfBirth: prev.dateOfBirth || (profile.date_of_birth
            ? new Date(profile.date_of_birth).toISOString().split("T")[0]
            : ""),
        }))

        // Set KYC status from profile if no submission exists
        if (!kycSubmission && profile.kyc_status) {
          setKycStatus(profile.kyc_status as "pending" | "approved" | "rejected")
        }
      } else {
        // Use user metadata if profile doesn't exist
        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || user.user_metadata?.first_name || "",
          middleName: prev.middleName || user.user_metadata?.middle_name || "",
          lastName: prev.lastName || user.user_metadata?.last_name || "",
          country: prev.country || user.user_metadata?.country || "United States",
        }))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreviews((prev) => ({
          ...prev,
          [field]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
      setFormData((prev) => ({ ...prev, [field]: file }))
    }
  }

  const removeFile = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: null }))
    setUploadPreviews((prev) => ({ ...prev, [field]: "" }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Check if already approved
    if (kycStatus === "approved") {
      toast({
        title: "Already Approved",
        description: "Your KYC verification has already been approved. No further action is needed.",
        variant: "default",
      })
      return
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.ssn) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required personal information fields.",
        variant: "destructive",
      })
      return
    }

    if (!formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required address fields.",
        variant: "destructive",
      })
      return
    }

    // Check if documents are uploaded (either new files or existing URLs)
    const hasLicenseFront = formData.licenseFront || uploadPreviews.licenseFront
    const hasLicenseBack = formData.licenseBack || uploadPreviews.licenseBack
    const hasSelfie = formData.selfie || uploadPreviews.selfie

    if (!hasLicenseFront || !hasLicenseBack || !hasSelfie) {
      toast({
        title: "Validation Error",
        description: "Please upload all required documents (license front, back, and selfie).",
        variant: "destructive",
      })
      return
    }

    if (!formData.licenseNumber || !formData.licenseState || !formData.licenseExpiry) {
      toast({
        title: "Validation Error",
        description: "Please fill in all driver's license information.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit KYC verification.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload documents to storage (only if new files are provided)
      let licenseFrontUrl = uploadPreviews.licenseFront || ""
      let licenseBackUrl = uploadPreviews.licenseBack || ""
      let selfieUrl = uploadPreviews.selfie || ""

      try {
        if (formData.licenseFront) {
          const frontUpload = await uploadKYCDocument(formData.licenseFront, user.id, "license-front")
          licenseFrontUrl = frontUpload.url
        }

        if (formData.licenseBack) {
          const backUpload = await uploadKYCDocument(formData.licenseBack, user.id, "license-back")
          licenseBackUrl = backUpload.url
        }

        if (formData.selfie) {
          const selfieUpload = await uploadKYCDocument(formData.selfie, user.id, "selfie")
          selfieUrl = selfieUpload.url
        }
      } catch (uploadError) {
        console.error("Error uploading documents:", uploadError)
        toast({
          title: "Upload Error",
          description: "Failed to upload documents. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Prepare submission data
      const submissionData = {
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth || null,
        ssn: formData.ssn || null,
        license_number: formData.licenseNumber,
        license_state: formData.licenseState,
        license_expiry: formData.licenseExpiry || null,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        license_front_url: licenseFrontUrl,
        license_back_url: licenseBackUrl,
        selfie_url: selfieUrl,
        status: "pending",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      }

      let submissionError

      // Update existing submission if it exists, otherwise create new one
      if (existingSubmission) {
        const { error } = await supabase
          .from("kyc_submissions")
          .update(submissionData)
          .eq("id", existingSubmission.id)
        submissionError = error
      } else {
        const { error } = await supabase
          .from("kyc_submissions")
          .insert({
            user_id: user.id,
            ...submissionData,
          })
        submissionError = error
      }

      if (submissionError) {
        console.error("Error saving KYC submission:", submissionError)
        toast({
          title: "Submission Error",
          description: "Failed to submit KYC verification. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Update profile KYC status
      await supabase
        .from("profiles")
        .update({ kyc_status: "pending" })
        .eq("id", user.id)

      // Reload data to reflect new status
      await loadUserData()
      setKycStatus("pending")

      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error submitting KYC:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const FileUploadCard = ({
    title,
    field,
    accept,
    icon: Icon,
    description,
  }: {
    title: string
    field: string
    accept: string
    icon: any
    description: string
  }) => {
    const preview = uploadPreviews[field as keyof typeof uploadPreviews]
    const hasFile = formData[field as keyof typeof formData] || preview
    const isExistingFile = preview && !formData[field as keyof typeof formData]

    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-[#c4d626] transition-colors">
        <CardContent className="p-6">
          {hasFile ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeFile(field)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isExistingFile ? "Previously uploaded" : "Uploaded successfully"}
                </span>
              </div>
              {isExistingFile && (
                <p className="text-xs text-gray-500">
                  You can upload a new file to replace this one
                </p>
              )}
            </div>
          ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <div>
              <input
                type="file"
                accept={accept}
                onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
                className="hidden"
                id={field}
              />
              <Label htmlFor={field}>
                <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </Label>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const currentStepData = steps[currentStep - 1]

  if (isLoading) {
    return (
      <DashboardLayout activeItem="KYC Verification">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c4d626]"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="KYC Verification">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-[#0c3a30]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
            <p className="text-gray-600 mt-2">Complete your identity verification to unlock all banking features</p>
          </div>
        </div>

        {/* Status Banner */}
        {kycStatus && (
          <Card className={kycStatus === "approved" ? "bg-green-50 border-green-200" : kycStatus === "rejected" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {kycStatus === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : kycStatus === "rejected" ? (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${kycStatus === "approved" ? "text-green-900" : kycStatus === "rejected" ? "text-red-900" : "text-yellow-900"}`}>
                    {kycStatus === "approved"
                      ? "KYC Verification Approved"
                      : kycStatus === "rejected"
                      ? "KYC Verification Rejected"
                      : "KYC Verification Pending"}
                  </h3>
                  <p className={`text-sm mt-1 ${kycStatus === "approved" ? "text-green-700" : kycStatus === "rejected" ? "text-red-700" : "text-yellow-700"}`}>
                    {kycStatus === "approved"
                      ? "Your KYC verification has been approved. You now have full access to all banking features."
                      : kycStatus === "rejected"
                      ? existingSubmission?.rejection_reason
                        ? `Reason: ${existingSubmission.rejection_reason}. Please update your information and resubmit.`
                        : "Your KYC verification was rejected. Please update your information and resubmit."
                      : existingSubmission
                      ? `Your verification was submitted on ${new Date(existingSubmission.submitted_at).toLocaleDateString()}. We will get back to you once the review is complete.`
                      : "Your verification is being reviewed. We will get back to you once the review is complete."}
                  </p>
                  {existingSubmission && (
                    <p className={`text-xs mt-2 ${kycStatus === "approved" ? "text-green-600" : kycStatus === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                      Submitted: {new Date(existingSubmission.submitted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.id <= currentStep ? "bg-[#c4d626] text-[#0c3a30]" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-center font-medium text-gray-600 max-w-20">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStepData.icon && <currentStepData.icon className="h-5 w-5" />}
              <span>{currentStepData.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssn">Social Security Number *</Label>
                    <Input
                      id="ssn"
                      value={formData.ssn}
                      onChange={(e) => handleInputChange("ssn", e.target.value)}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Important Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Please ensure all information matches your government-issued ID exactly. Any discrepancies may
                        delay your verification process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Address Verification</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This address must match the address on your driver's license or government-issued ID.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Upload Your Driver's License</h3>
                  <p className="text-gray-600 mt-1">
                    Please upload clear photos of both sides of your driver's license
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadCard
                    title="Front of License"
                    field="licenseFront"
                    accept="image/*"
                    icon={FileText}
                    description="Upload the front side of your driver's license"
                  />

                  <FileUploadCard
                    title="Back of License"
                    field="licenseBack"
                    accept="image/*"
                    icon={FileText}
                    description="Upload the back side of your driver's license"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Driver's License Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        placeholder="Enter license number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseState">Issuing State *</Label>
                      <Input
                        id="licenseState"
                        value={formData.licenseState}
                        onChange={(e) => handleInputChange("licenseState", e.target.value)}
                        placeholder="e.g., TX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseExpiry">Expiry Date *</Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Photo Guidelines</h4>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Ensure all text is clearly visible and readable</li>
                        <li>• Take photos in good lighting conditions</li>
                        <li>• Avoid glare, shadows, or blurry images</li>
                        <li>• Include all four corners of the license</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={nextStep} 
                    className="bg-[#c4d626] hover:bg-[#b8c423] text-black"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Identity Verification */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Take a Selfie</h3>
                  <p className="text-gray-600 mt-1">Take a clear selfie to verify your identity</p>
                </div>

                <div className="max-w-md mx-auto">
                  <FileUploadCard
                    title="Selfie Photo"
                    field="selfie"
                    accept="image/*"
                    icon={Camera}
                    description="Take a clear photo of yourself"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Selfie Guidelines</h4>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Look directly at the camera</li>
                        <li>• Ensure your face is clearly visible</li>
                        <li>• Remove sunglasses or hats</li>
                        <li>• Use good lighting (avoid shadows)</li>
                        <li>• Keep a neutral expression</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Final Step</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once you submit your verification, our team will review your documents within 24-48 hours.
                        You'll receive an email notification once your verification is complete.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">Review Process</h4>
                      <p className="text-sm text-blue-700">
                        Your verification is being reviewed. We will get back to you once the review is complete.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#c4d626] hover:bg-[#b8c423] text-black min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Verification
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="bg-[#c4d626] hover:bg-[#b8c423] text-black">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#c4d626] hover:bg-[#b8c423] text-black"
            >
              {isSubmitting ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Verification
                </>
              )}
            </Button>
          )}
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                Your verification is being reviewed. We will get back to you once the review is complete.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => {
                  setShowSuccessDialog(false)
                  router.push("/dashboard")
                }}
                className="bg-[#c4d626] hover:bg-[#b8c423] text-black w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

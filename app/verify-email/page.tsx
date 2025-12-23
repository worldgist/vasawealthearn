import { OTPVerification } from "@/components/auth/otp-verification"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <OTPVerification />
      </div>
    </div>
  )
}

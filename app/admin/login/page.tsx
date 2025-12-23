import { AdminAuthForm } from "@/components/admin/admin-auth-form"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/logo.png" alt="Vasawealthearn" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Vasawealthearn Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your administrator account</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <AdminAuthForm />

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">This is a secure admin portal. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

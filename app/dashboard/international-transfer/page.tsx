export const dynamic = 'force-dynamic'

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Bitcoin, DollarSign, Zap, Smartphone, MoreHorizontal, Shield, ArrowRight } from "lucide-react"

const transferMethods = [
  {
    id: "wire",
    title: "Wire Transfer",
    description: "Transfer funds directly to international bank accounts.",
    icon: CreditCard,
    color: "bg-blue-50 text-blue-600",
    available: true,
  },
  {
    id: "crypto",
    title: "Cryptocurrency",
    description: "Send funds to your cryptocurrency wallet.",
    icon: Bitcoin,
    color: "bg-orange-50 text-orange-600",
    available: true,
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Transfer funds to your PayPal account.",
    icon: DollarSign,
    color: "bg-blue-50 text-blue-600",
    available: true,
  },
  {
    id: "wise",
    title: "Wise Transfer",
    description: "Transfer with lower fees using Wise.",
    icon: Zap,
    color: "bg-green-50 text-green-600",
    available: true,
  },
  {
    id: "cashapp",
    title: "Cash App",
    description: "Quick transfers to your Cash App account.",
    icon: Smartphone,
    color: "bg-purple-50 text-purple-600",
    available: true,
  },
  {
    id: "more",
    title: "More Options",
    description: "Zelle, Venmo, Revolut, and more.",
    icon: MoreHorizontal,
    color: "bg-gray-50 text-gray-600",
    available: false,
  },
]

export default function InternationalTransferPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <ArrowRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900">International Transfer</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">International Transfer</h1>
            <p className="text-gray-600 mt-1">Select Transfer Method</p>
          </div>
        </div>

        {/* Transfer Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transferMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-[#c4d626] ${
                  !method.available ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{method.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{method.description}</p>
                    </div>
                    <Button
                      className={`w-full ${
                        method.available
                          ? "bg-[#c4d626] hover:bg-[#b8c423] text-gray-900"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!method.available}
                    >
                      {method.available ? "Select Method" : "Coming Soon"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Security Notice */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Secure Transaction</h4>
                <p className="text-sm text-green-700 mt-1">
                  All transfers are encrypted and processed securely. Never share your PIN with anyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

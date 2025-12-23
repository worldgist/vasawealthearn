"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calculator, 
  TrendingUp, 
  DollarSign,
  Home,
  MapPin,
  Percent,
  Calendar,
  BarChart3,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react"

interface InvestmentEstimate {
  propertyValue: number
  downPayment: number
  loanAmount: number
  monthlyRent: number
  annualRent: number
  monthlyMortgagePayment: number
  monthlyExpenses: number
  annualExpenses: number
  netOperatingIncome: number
  cashFlow: number
  annualCashFlow: number
  capRate: number
  cashOnCashReturn: number
  roi: number
  grossYield: number
  debtServiceCoverage: number
  breakEvenOccupancy: number
  fiveYearAppreciation: number
  tenYearAppreciation: number
  totalReturn5Year: number
  totalReturn10Year: number
}

export default function RealEstateInvestmentEstimatorPage() {
  const [formData, setFormData] = useState({
    propertyValue: "",
    downPaymentPercent: "20",
    interestRate: "6.5",
    loanTerm: "30",
    monthlyRent: "",
    annualAppreciation: "3",
    vacancyRate: "5",
    maintenanceRate: "1",
    propertyTaxRate: "1.2",
    insuranceRate: "0.5",
    propertyManagementRate: "10",
    hoaFees: "",
    otherExpenses: "",
    location: ""
  })

  const [estimates, setEstimates] = useState<InvestmentEstimate | null>(null)

  const calculateEstimates = () => {
    const propertyValue = parseFloat(formData.propertyValue) || 0
    const downPaymentPercent = parseFloat(formData.downPaymentPercent) || 20
    const interestRate = parseFloat(formData.interestRate) || 6.5
    const loanTerm = parseFloat(formData.loanTerm) || 30
    const monthlyRent = parseFloat(formData.monthlyRent) || 0
    const annualAppreciation = parseFloat(formData.annualAppreciation) || 3
    const vacancyRate = parseFloat(formData.vacancyRate) || 5
    const maintenanceRate = parseFloat(formData.maintenanceRate) || 1
    const propertyTaxRate = parseFloat(formData.propertyTaxRate) || 1.2
    const insuranceRate = parseFloat(formData.insuranceRate) || 0.5
    const propertyManagementRate = parseFloat(formData.propertyManagementRate) || 10
    const hoaFees = parseFloat(formData.hoaFees) || 0
    const otherExpenses = parseFloat(formData.otherExpenses) || 0

    if (propertyValue <= 0 || monthlyRent <= 0) {
      return
    }

    // Calculate loan details
    const downPayment = (propertyValue * downPaymentPercent) / 100
    const loanAmount = propertyValue - downPayment

    // Calculate monthly mortgage payment
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    const monthlyMortgagePayment = 
      loanAmount > 0
        ? loanAmount * 
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0

    // Calculate annual expenses
    const annualPropertyTax = (propertyValue * propertyTaxRate) / 100
    const annualInsurance = (propertyValue * insuranceRate) / 100
    const annualMaintenance = (propertyValue * maintenanceRate) / 100
    const annualHOA = hoaFees * 12
    const annualOtherExpenses = otherExpenses * 12
    const annualPropertyManagement = (monthlyRent * 12 * propertyManagementRate) / 100
    const annualVacancyLoss = (monthlyRent * 12 * vacancyRate) / 100

    const monthlyExpenses = 
      monthlyMortgagePayment +
      (annualPropertyTax / 12) +
      (annualInsurance / 12) +
      (annualMaintenance / 12) +
      (annualHOA / 12) +
      (annualOtherExpenses / 12) +
      (annualPropertyManagement / 12) +
      (annualVacancyLoss / 12)

    const annualExpenses = monthlyExpenses * 12

    // Calculate income
    const annualRent = monthlyRent * 12
    const effectiveAnnualRent = annualRent - annualVacancyLoss
    const netOperatingIncome = effectiveAnnualRent - (
      annualPropertyTax +
      annualInsurance +
      annualMaintenance +
      annualHOA +
      annualOtherExpenses +
      annualPropertyManagement
    )

    // Calculate cash flow
    const cashFlow = monthlyRent - monthlyExpenses
    const annualCashFlow = cashFlow * 12

    // Calculate metrics
    const capRate = (netOperatingIncome / propertyValue) * 100
    const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0
    const roi = (annualCashFlow / propertyValue) * 100
    const grossYield = (annualRent / propertyValue) * 100
    const debtServiceCoverage = netOperatingIncome / (monthlyMortgagePayment * 12)
    const breakEvenOccupancy = (monthlyExpenses / monthlyRent) * 100

    // Calculate appreciation
    const fiveYearAppreciation = propertyValue * Math.pow(1 + annualAppreciation / 100, 5) - propertyValue
    const tenYearAppreciation = propertyValue * Math.pow(1 + annualAppreciation / 100, 10) - propertyValue

    // Total return (cash flow + appreciation)
    const totalReturn5Year = (annualCashFlow * 5) + fiveYearAppreciation
    const totalReturn10Year = (annualCashFlow * 10) + tenYearAppreciation

    setEstimates({
      propertyValue,
      downPayment,
      loanAmount,
      monthlyRent,
      annualRent,
      monthlyMortgagePayment,
      monthlyExpenses,
      annualExpenses,
      netOperatingIncome,
      cashFlow,
      annualCashFlow,
      capRate,
      cashOnCashReturn,
      roi,
      grossYield,
      debtServiceCoverage,
      breakEvenOccupancy,
      fiveYearAppreciation,
      tenYearAppreciation,
      totalReturn5Year,
      totalReturn10Year,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout activeItem="/dashboard/real-estate-estimator">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-8 w-8 text-[#c4d626]" />
            Real Estate Investment Estimator
          </h1>
          <p className="text-gray-600">
            Calculate investment returns and analyze the potential of real estate properties
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
                <CardDescription>Enter property information to calculate investment estimates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Property Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="location"
                      placeholder="e.g., New York, NY"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyValue">Property Value ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="propertyValue"
                      type="number"
                      placeholder="500000"
                      value={formData.propertyValue}
                      onChange={(e) => handleInputChange("propertyValue", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rental Income ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="monthlyRent"
                      type="number"
                      placeholder="3000"
                      value={formData.monthlyRent}
                      onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Loan Details</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="downPaymentPercent">Down Payment (%)</Label>
                      <Input
                        id="downPaymentPercent"
                        type="number"
                        value={formData.downPaymentPercent}
                        onChange={(e) => handleInputChange("downPaymentPercent", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => handleInputChange("interestRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                      <Input
                        id="loanTerm"
                        type="number"
                        value={formData.loanTerm}
                        onChange={(e) => handleInputChange("loanTerm", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Expenses</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="propertyTaxRate">Property Tax Rate (%)</Label>
                      <Input
                        id="propertyTaxRate"
                        type="number"
                        step="0.1"
                        value={formData.propertyTaxRate}
                        onChange={(e) => handleInputChange("propertyTaxRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
                      <Input
                        id="insuranceRate"
                        type="number"
                        step="0.1"
                        value={formData.insuranceRate}
                        onChange={(e) => handleInputChange("insuranceRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenanceRate">Maintenance Rate (%)</Label>
                      <Input
                        id="maintenanceRate"
                        type="number"
                        step="0.1"
                        value={formData.maintenanceRate}
                        onChange={(e) => handleInputChange("maintenanceRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propertyManagementRate">Property Management (%)</Label>
                      <Input
                        id="propertyManagementRate"
                        type="number"
                        step="0.1"
                        value={formData.propertyManagementRate}
                        onChange={(e) => handleInputChange("propertyManagementRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
                      <Input
                        id="vacancyRate"
                        type="number"
                        step="0.1"
                        value={formData.vacancyRate}
                        onChange={(e) => handleInputChange("vacancyRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hoaFees">Monthly HOA Fees ($)</Label>
                      <Input
                        id="hoaFees"
                        type="number"
                        value={formData.hoaFees}
                        onChange={(e) => handleInputChange("hoaFees", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherExpenses">Other Monthly Expenses ($)</Label>
                      <Input
                        id="otherExpenses"
                        type="number"
                        value={formData.otherExpenses}
                        onChange={(e) => handleInputChange("otherExpenses", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Appreciation</h3>
                  <div className="space-y-2">
                    <Label htmlFor="annualAppreciation">Annual Appreciation Rate (%)</Label>
                    <Input
                      id="annualAppreciation"
                      type="number"
                      step="0.1"
                      value={formData.annualAppreciation}
                      onChange={(e) => handleInputChange("annualAppreciation", e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateEstimates} 
                  className="w-full bg-[#c4d626] hover:bg-[#a8b821] text-[#0c3a30] font-semibold"
                  size="lg"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Investment Estimates
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {estimates ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                  <TabsTrigger value="projections">Projections</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Investment Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Cap Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900">
                            {estimates.capRate.toFixed(2)}%
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Cash-on-Cash ROI</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            {estimates.cashOnCashReturn.toFixed(2)}%
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Gross Yield</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">
                            {estimates.grossYield.toFixed(2)}%
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-700">Monthly Cash Flow</span>
                          </div>
                          <p className={`text-2xl font-bold ${estimates.cashFlow >= 0 ? 'text-orange-900' : 'text-red-600'}`}>
                            ${estimates.cashFlow >= 0 ? '+' : ''}{estimates.cashFlow.toFixed(2)}
                          </p>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <PiggyBank className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">Annual Cash Flow</span>
                          </div>
                          <p className={`text-2xl font-bold ${estimates.annualCashFlow >= 0 ? 'text-yellow-900' : 'text-red-600'}`}>
                            ${estimates.annualCashFlow >= 0 ? '+' : ''}{estimates.annualCashFlow.toFixed(2)}
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-700">DSCR</span>
                          </div>
                          <p className="text-2xl font-bold text-indigo-900">
                            {estimates.debtServiceCoverage.toFixed(2)}x
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Property Value</p>
                          <p className="text-lg font-semibold">${estimates.propertyValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Down Payment</p>
                          <p className="text-lg font-semibold">${estimates.downPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                          <p className="text-lg font-semibold">${estimates.loanAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Annual Rental Income</p>
                          <p className="text-lg font-semibold text-green-600">${estimates.annualRent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Net Operating Income</p>
                          <p className="text-lg font-semibold">${estimates.netOperatingIncome.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Annual Expenses</p>
                          <p className="text-lg font-semibold text-red-600">${estimates.annualExpenses.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Break-Even Occupancy Rate</span>
                        <span className="text-lg font-bold">{estimates.breakEvenOccupancy.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Overall ROI</span>
                        <span className="text-lg font-bold text-blue-600">{estimates.roi.toFixed(2)}%</span>
                      </div>
                      {estimates.cashFlow < 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This property has negative cash flow. Consider increasing rent or reducing expenses.
                          </p>
                        </div>
                      )}
                      {estimates.debtServiceCoverage < 1.25 && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Warning:</strong> Debt Service Coverage Ratio is below 1.25, which may affect loan approval.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Cash Flow Tab */}
                <TabsContent value="cashflow" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Cash Flow Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium text-green-700">Monthly Rental Income</span>
                          <span className="font-bold text-green-900">+${estimates.monthlyRent.toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-2 pl-4 border-l-2 border-gray-300">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mortgage Payment</span>
                            <span className="text-sm font-medium">-${estimates.monthlyMortgagePayment.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Property Tax</span>
                            <span className="text-sm font-medium">-${((estimates.propertyValue * parseFloat(formData.propertyTaxRate)) / 100 / 12).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Insurance</span>
                            <span className="text-sm font-medium">-${((estimates.propertyValue * parseFloat(formData.insuranceRate)) / 100 / 12).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Maintenance</span>
                            <span className="text-sm font-medium">-${((estimates.propertyValue * parseFloat(formData.maintenanceRate)) / 100 / 12).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Property Management</span>
                            <span className="text-sm font-medium">-${((estimates.monthlyRent * parseFloat(formData.propertyManagementRate)) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Vacancy Loss</span>
                            <span className="text-sm font-medium">-${((estimates.monthlyRent * parseFloat(formData.vacancyRate)) / 100).toFixed(2)}</span>
                          </div>
                          {parseFloat(formData.hoaFees) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">HOA Fees</span>
                              <span className="text-sm font-medium">-${parseFloat(formData.hoaFees).toFixed(2)}</span>
                            </div>
                          )}
                          {parseFloat(formData.otherExpenses) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Other Expenses</span>
                              <span className="text-sm font-medium">-${parseFloat(formData.otherExpenses).toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                          estimates.cashFlow >= 0 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-red-50 border-red-300'
                        }`}>
                          <span className={`font-bold text-lg ${
                            estimates.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'
                          }`}>
                            Net Monthly Cash Flow
                          </span>
                          <span className={`font-bold text-2xl ${
                            estimates.cashFlow >= 0 ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {estimates.cashFlow >= 0 ? '+' : ''}${estimates.cashFlow.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Annual Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                          <p className="text-2xl font-bold text-blue-900">
                            ${estimates.annualRent.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Annual Expenses</p>
                          <p className="text-2xl font-bold text-red-900">
                            ${estimates.annualExpenses.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Annual Cash Flow</p>
                          <p className={`text-3xl font-bold ${estimates.annualCashFlow >= 0 ? 'text-green-900' : 'text-red-600'}`}>
                            {estimates.annualCashFlow >= 0 ? '+' : ''}${estimates.annualCashFlow.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Projections Tab */}
                <TabsContent value="projections" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>5-Year Projection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Property Appreciation</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">
                            +${estimates.fiveYearAppreciation.toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            {((estimates.fiveYearAppreciation / estimates.propertyValue) * 100).toFixed(1)}% increase
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Cash Flow (5 Years)</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            ${(estimates.annualCashFlow * 5).toLocaleString()}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Total Return (5 Years)</span>
                          </div>
                          <p className="text-3xl font-bold text-green-900">
                            ${estimates.totalReturn5Year.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {((estimates.totalReturn5Year / estimates.downPayment) * 100).toFixed(1)}% return on investment
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>10-Year Projection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Property Appreciation</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">
                            +${estimates.tenYearAppreciation.toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            {((estimates.tenYearAppreciation / estimates.propertyValue) * 100).toFixed(1)}% increase
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Cash Flow (10 Years)</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            ${(estimates.annualCashFlow * 10).toLocaleString()}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Total Return (10 Years)</span>
                          </div>
                          <p className="text-3xl font-bold text-green-900">
                            ${estimates.totalReturn10Year.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {((estimates.totalReturn10Year / estimates.downPayment) * 100).toFixed(1)}% return on investment
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Ready to Calculate?
                  </h3>
                  <p className="text-gray-500">
                    Fill in the property details on the left and click "Calculate Investment Estimates" to see your results.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


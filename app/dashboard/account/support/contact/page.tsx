import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react"

export default function ContactSupportPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="h-5 w-5 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
          </div>
          <p className="text-gray-600">Get help with your account or report an issue</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="transactions">Transaction Problems</SelectItem>
                      <SelectItem value="cards">Card Issues</SelectItem>
                      <SelectItem value="transfers">Transfer Problems</SelectItem>
                      <SelectItem value="security">Security Concerns</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-[#c4d626] hover:bg-[#c4d626]/90 text-[#0c3a30]">Send Message</Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-VERSA-BANK</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@vasawealthearn.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Support Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monday - Friday</span>
                  <span className="text-sm font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saturday</span>
                  <span className="text-sm font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sunday</span>
                  <span className="text-sm font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">Emergency support available 24/7 for account security issues</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#c4d626]/10 border-[#c4d626]/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-[#0c3a30] mb-2">Quick Response</h4>
                <p className="text-sm text-gray-700">
                  We typically respond to support requests within 2-4 hours during business hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

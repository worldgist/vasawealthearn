"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminSettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedSettings, setEditedSettings] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("settings").select("*").order("category", { ascending: true })

      if (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        })
        return
      }

      setSettings(data || [])
      const initialEdited: { [key: string]: any } = {}
      data?.forEach((setting) => {
        initialEdited[setting.setting_key] = setting.setting_value
      })
      setEditedSettings(initialEdited)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive",
        })
        return
      }

      // Update all changed settings
      const updates = Object.entries(editedSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: String(value),
        updated_by: user.id,
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from("settings")
          .update({
            setting_value: update.setting_value,
            updated_by: update.updated_by,
          })
          .eq("setting_key", update.setting_key)

        if (error) {
          console.error(`Error updating setting ${update.setting_key}:`, error)
        }
      }

      toast({
        title: "Success",
        description: "Settings saved successfully.",
      })

      // Reload settings
      await loadSettings()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getSettingValue = (key: string) => {
    return editedSettings[key] !== undefined ? editedSettings[key] : settings.find((s) => s.setting_key === key)?.setting_value || ""
  }

  const groupedSettings = settings.reduce((acc: any, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {})

  const renderSettingInput = (setting: any) => {
    const value = getSettingValue(setting.setting_key)

    switch (setting.setting_type) {
      case "boolean":
        return (
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked.toString())}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="max-w-xs"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="max-w-xs"
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar - Same as dashboard */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#0c3a30]">AD</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Admin Portal</h3>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">OVERVIEW</p>
              <a
                href="/admin/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Dashboard
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SYSTEM</p>
              <a
                href="/admin/settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <Settings className="w-4 h-4 mr-3" />
                System Settings
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                  <p className="text-sm text-gray-500">Manage system-wide configuration</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={loadSettings} variant="outline" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button onClick={handleSave} disabled={saving || loading} className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#a8c520]">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSettings).map(([category, categorySettings]: [string, any]) => (
                  <div key={category} className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-semibold text-gray-900 capitalize">{category} Settings</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {categorySettings.map((setting: any) => (
                        <div key={setting.id} className="flex items-start justify-between">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-900">
                              {setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Label>
                            {setting.description && (
                              <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                            )}
                          </div>
                          <div className="ml-4">{renderSettingInput(setting)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

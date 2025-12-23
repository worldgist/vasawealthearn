"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Eye, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: "transaction" | "security" | "system" | "card" | "kyc" | "loan" | "deposit" | "withdrawal" | "investment" | "account" | "payment"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high" | "urgent"
  starred?: boolean
  action_url?: string
}

export function NotificationDropdown() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    loadNotifications()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as any
          if (newNotification.user_id) {
            // Check if this notification is for the current user
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && newNotification.user_id === user.id) {
                loadNotifications()
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: notificationsData, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error loading notifications:", error)
        return
      }

      const formattedNotifications = (notificationsData || []).map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: formatTimestamp(notif.created_at),
        read: notif.is_read || false,
        priority: notif.priority || "medium",
        starred: notif.is_starred || false,
        action_url: notif.action_url,
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Just now"
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error marking notification as read:", error)
        return
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking all as read:", error)
        return
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) {
        console.error("Error deleting notification:", error)
        return
      }

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return "💰"
      case "security":
        return "🔒"
      case "card":
        return "💳"
      case "kyc":
        return "🆔"
      case "loan":
        return "💵"
      case "deposit":
        return "📥"
      case "withdrawal":
        return "📤"
      case "investment":
        return "📈"
      case "system":
        return "⚙️"
      default:
        return "📢"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-6 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">
                              {notification.timestamp}
                            </span>
                            {notification.priority && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="text-xs h-6 px-2"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                        {notification.action_url && (
                          <Link href={notification.action_url}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <Link href="/dashboard/notifications">
            <Button variant="outline" className="w-full text-sm">
              View All Notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

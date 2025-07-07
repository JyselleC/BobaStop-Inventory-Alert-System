"use client"

import type React from "react"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

// Predefined users with roles
const users = [
  {
    username: "admin",
    password: "boba123",
    role: "admin",
    name: "System Admin",
    permissions: ["view", "edit", "delete", "manage_users", "analytics"],
  },
  {
    username: "ann",
    password: "boba123",
    role: "owner",
    name: "Ann (Owner)",
    permissions: ["view", "edit", "delete", "analytics"],
  },
  {
    username: "staff",
    password: "stop123",
    role: "staff",
    name: "Staff",
    permissions: ["view", "edit"],
  },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Find user in predefined list
    const user = users.find(
      (u) => u.username.toLowerCase() === formData.username.toLowerCase() && u.password === formData.password,
    )

    if (user) {
      // Store authentication and user data
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username,
          role: user.role,
          name: user.name,
          permissions: user.permissions,
        }),
      )

      // Enhanced activity logging for ALL users
      const loginActivity = {
        id: Date.now() + Math.random(), // Ensure unique IDs
        user: user.name,
        action: "LOGIN",
        details: `User ${user.name} (${user.role}) logged in successfully from ${window.location.hostname}`,
        timestamp: new Date().toISOString(),
      }

      const existingLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
      const updatedLogs = [loginActivity, ...existingLogs]

      // Keep only last 1000 logs to prevent storage issues
      if (updatedLogs.length > 1000) {
        updatedLogs.splice(1000)
      }

      localStorage.setItem("activityLogs", JSON.stringify(updatedLogs))

      console.log("Login activity logged:", loginActivity) // Debug log

      router.push("/dashboard")
    } else {
      setError("Invalid username or password")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/boba-stop-logo.png" alt="Boba Stop Logo" width={120} height={120} className="rounded-full" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Boba Stop</CardTitle>
            <CardDescription>Employee Login - Inventory Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

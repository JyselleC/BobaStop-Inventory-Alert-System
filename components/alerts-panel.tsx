"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell } from "lucide-react"
import { sendSMSAlert, formatLowStockAlert } from "@/lib/twilio"

interface Product {
  id: number
  name: string
  supplier: string
  quantity: number
  restock_threshold: number
  price: number
  unit: string
  status: string
  last_updated: string
}

interface Alert {
  id: number
  type: string
  product: string
  quantity: number
  threshold: number
  timestamp: string
  message: string
}

interface AlertsPanelProps {
  lowStockItems: Product[]
  alerts: Alert[]
  onClearAlerts: () => void
}

export function AlertsPanel({ lowStockItems, alerts, onClearAlerts }: AlertsPanelProps) {
  const [sendingAlert, setSendingAlert] = useState(false)

  const handleSendSMSAlert = async () => {
    if (lowStockItems.length === 0) {
      alert("No low stock items to alert about!")
      return
    }

    setSendingAlert(true)

    try {
      const message = formatLowStockAlert(lowStockItems)
      const result = await sendSMSAlert({
        message,
        recipients: [], // Recipients are handled in the API route
      })

      if (result && result.success) {
        const sentCount = result.results?.filter((r: any) => r.status === "sent").length || 0
        const skippedCount = result.results?.filter((r: any) => r.status === "skipped").length || 0

        let alertMessage = `✅ SMS Alert sent successfully!`
        if (sentCount > 0) alertMessage += `\n📱 Sent to ${sentCount} recipient(s)`
        if (skippedCount > 0) alertMessage += `\n⚠️ ${skippedCount} number(s) skipped (unverified)`

        alert(alertMessage)
      } else {
        throw new Error(result?.error || "Failed to send SMS")
      }
    } catch (error) {
      console.error("SMS Alert Error:", error)
      alert(`❌ Failed to send SMS alert: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSendingAlert(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Current Low Stock Alerts */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Items
            </CardTitle>
            <CardDescription>Items that need immediate attention for restocking</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No low stock alerts!</p>
              <p className="text-sm">All your inventory levels are healthy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-800">
                    {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} need restocking
                  </span>
                </div>
                <Badge variant="destructive" className="text-sm">
                  Action Required
                </Badge>
              </div>

              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Only {item.quantity} left • Supplier: {item.supplier} • Unit: {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {item.quantity} / {item.restock_threshold}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

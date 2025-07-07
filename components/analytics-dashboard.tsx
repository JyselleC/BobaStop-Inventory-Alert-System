"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, AlertTriangle, FileText, DollarSign, Package } from "lucide-react"

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

interface AnalyticsDashboardProps {
  products: Product[]
}

export function AnalyticsDashboard({ products }: AnalyticsDashboardProps) {
  const [reportType, setReportType] = useState("inventory")
  const [timeRange, setTimeRange] = useState("30days")

  // Calculate real-time analytics data
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
  const lowStockItems = products.filter((p) => p.quantity <= 2)
  const outOfStockItems = products.filter((p) => p.quantity === 0)

  // Top value products
  const topValueProducts = [...products].sort((a, b) => b.quantity * b.price - a.quantity * a.price).slice(0, 5)

  // Most critical items (low stock with high value)
  const criticalItems = [...products]
    .filter((p) => p.quantity <= 2)
    .sort((a, b) => b.price * b.restock_threshold - a.price * a.restock_threshold)
    .slice(0, 5)

  const generateReport = (type: string) => {
    const timestamp = new Date().toISOString().split("T")[0]
    let csvContent = ""
    let filename = ""

    switch (type) {
      case "inventory":
        csvContent = "Product Name,Supplier,Quantity,Restock Threshold,Unit Price,Total Value,Status,Last Updated\n"
        products.forEach((product) => {
          csvContent += `"${product.name}","${product.supplier}",${product.quantity},${product.restock_threshold},${product.price.toFixed(2)},${(product.quantity * product.price).toFixed(2)},"${product.status}","${product.last_updated}"\n`
        })
        filename = `boba-stop-inventory-${timestamp}.csv`
        break

      case "low-stock":
        csvContent = "Product Name,Supplier,Current Quantity,Restock Threshold,Unit Price,Urgency Level,Last Updated\n"
        lowStockItems.forEach((product) => {
          const urgency = product.quantity === 0 ? "CRITICAL" : product.quantity === 1 ? "HIGH" : "MEDIUM"
          csvContent += `"${product.name}","${product.supplier}",${product.quantity},${product.restock_threshold},${product.price.toFixed(2)},"${urgency}","${product.last_updated}"\n`
        })
        filename = `boba-stop-low-stock-${timestamp}.csv`
        break

      case "supplier":
        csvContent = "Supplier,Product Count,Total Value,Low Stock Items,Average Price\n"
        // Object.values(supplierStats).forEach((supplier: any) => {
        //   csvContent += `"${supplier.name}",${supplier.productCount},${supplier.totalValue.toFixed(2)},${supplier.lowStockItems},${supplier.avgPrice.toFixed(2)}\n`
        // })
        filename = `boba-stop-supplier-analysis-${timestamp}.csv`
        break

      case "valuation":
        csvContent = "Product Name,Supplier,Quantity,Unit Price,Total Value,Percentage of Total Inventory\n"
        topValueProducts.forEach((product) => {
          const productValue = product.quantity * product.price
          const percentage = ((productValue / totalValue) * 100).toFixed(2)
          csvContent += `"${product.name}","${product.supplier}",${product.quantity},${product.price.toFixed(2)},${productValue.toFixed(2)},${percentage}%\n`
        })
        filename = `boba-stop-valuation-${timestamp}.csv`
        break
    }

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Current Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Real-time Inventory Status
          </CardTitle>
          <CardDescription>Live metrics based on current stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Healthy Stock</p>
                  <p className="text-2xl font-bold text-green-900">
                    {totalProducts - lowStockItems.length - outOfStockItems.length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-900">{lowStockItems.length - outOfStockItems.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{outOfStockItems.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Reports
          </CardTitle>
          <CardDescription>Download detailed analytics reports for your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Full Inventory Report</SelectItem>
                  <SelectItem value="low-stock">Low Stock Alert Report</SelectItem>
                  <SelectItem value="supplier">Supplier Analysis Report</SelectItem>
                  <SelectItem value="valuation">Inventory Valuation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => generateReport(reportType)} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p>
              <strong>Full Inventory:</strong> Complete product list with quantities, values, and status
            </p>
            <p>
              <strong>Low Stock Alert:</strong> Items requiring immediate restocking with urgency levels
            </p>
            <p>
              <strong>Supplier Analysis:</strong> Performance metrics and statistics by supplier
            </p>
            <p>
              <strong>Inventory Valuation:</strong> Financial breakdown and top-value products
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Value Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Top Value Products
          </CardTitle>
          <CardDescription>Products with highest total inventory value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topValueProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.supplier} • {product.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(product.quantity * product.price).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Most Critical Items
          </CardTitle>
          <CardDescription>High-value items that are low in stock</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No critical items at the moment!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.supplier} • Only {product.quantity} left
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Critical</Badge>
                    <p className="text-sm text-muted-foreground mt-1">${product.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, DollarSign, Users } from "lucide-react"

interface InventoryOverviewProps {
  totalProducts: number
  lowStockItems: number
  totalValue: number
  suppliers: number
}

export function InventoryOverview({ totalProducts, lowStockItems, totalValue, suppliers }: InventoryOverviewProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Total Products</CardTitle>
          <Package className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs opacity-90">Active inventory items</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Low Stock Alerts</CardTitle>
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{lowStockItems}</div>
          <p className="text-xs opacity-90">Items need restocking</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Total Value</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">${totalValue.toFixed(2)}</div>
          <p className="text-xs opacity-90">Current inventory value</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Suppliers</CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{suppliers}</div>
          <p className="text-xs opacity-90">Active suppliers</p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Minus, Plus, Trash2, Check, X } from "lucide-react"

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

interface MobileInventoryTableProps {
  products: Product[]
  onQuantityUpdate: (productId: number, newQuantity: number) => void
  onDeleteProduct: (productId: number) => void
}

export function MobileInventoryTable({ products, onQuantityUpdate, onDeleteProduct }: MobileInventoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Low Stock":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "Out of Stock":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const handleEditQuantity = (product: Product) => {
    setEditingId(product.id)
    setEditQuantity(product.quantity.toString())
  }

  const handleSaveQuantity = (productId: number) => {
    const newQuantity = Number.parseInt(editQuantity)
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onQuantityUpdate(productId, newQuantity)
    }
    setEditingId(null)
    setEditQuantity("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditQuantity("")
  }

  const handleQuickAdjust = (productId: number, currentQuantity: number, adjustment: number) => {
    const newQuantity = Math.max(0, currentQuantity + adjustment)
    onQuantityUpdate(productId, newQuantity)
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Card key={product.id} className="border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Product Name and Supplier */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
                </div>
                <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                  {product.supplier}
                </Badge>
              </div>

              {/* Quantity and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editingId === product.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-16 h-7 text-sm"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveQuantity(product.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                        <X className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-sm">Qty: {product.quantity}</span>
                      {product.quantity <= 2 && (
                        <Badge variant="destructive" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <Badge className={`${getStatusColor(product.status)} text-xs`}>{product.status}</Badge>
              </div>

              {/* Price and Total Value */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unit: ${product.price.toFixed(2)}</span>
                <span className="font-medium">Total: ${(product.quantity * product.price).toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(product.id, product.quantity, -1)}
                    disabled={product.quantity <= 0}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(product.id, product.quantity, 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuantity(product)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-800 h-7 w-7 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

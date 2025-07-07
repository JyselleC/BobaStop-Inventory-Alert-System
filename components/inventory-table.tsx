"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Minus, Plus, Trash2, Check, X, ShoppingCart, Settings } from "lucide-react"
import { MobileInventoryTable } from "./mobile-inventory-table"

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

interface InventoryTableProps {
  products: Product[]
  onQuantityUpdate: (productId: number, newQuantity: number) => void
  onDeleteProduct: (productId: number) => void
  onEditProduct?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  userPermissions?: string[]
}

export function InventoryTable({
  products,
  onQuantityUpdate,
  onDeleteProduct,
  onEditProduct,
  onAddToCart,
  userPermissions = [],
}: InventoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState("")

  const hasEditPermission = userPermissions.includes("edit") || userPermissions.includes("manage_users")
  const hasDeletePermission = userPermissions.includes("delete") || userPermissions.includes("manage_users")

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
    <>
      {/* Mobile View */}
      <div className="block sm:hidden">
        <MobileInventoryTable
          products={products}
          onQuantityUpdate={onQuantityUpdate}
          onDeleteProduct={onDeleteProduct}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.unit}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.supplier}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-20 h-8"
                          min="0"
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSaveQuantity(product.id)}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{product.quantity}</span>
                        {product.quantity <= 2 && (
                          <Badge variant="destructive" className="text-xs">
                            Low
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {hasEditPermission && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAdjust(product.id, product.quantity, -1)}
                          disabled={product.quantity <= 0}
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAdjust(product.id, product.quantity, 1)}
                          title="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuantity(product)}
                          title="Edit quantity"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {onEditProduct && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditProduct(product)}
                            title="Edit product details"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {onAddToCart && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddToCart(product)}
                        title="Add to shopping cart"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                    {hasDeletePermission && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

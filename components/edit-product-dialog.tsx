"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  suppliers: string[]
  onProductUpdated: (updatedProduct: Product) => void
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  suppliers,
  onProductUpdated,
}: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    supplier: "",
    quantity: "",
    price: "",
    unit: "",
    restock_threshold: "",
    description: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        supplier: product.supplier,
        quantity: product.quantity.toString(),
        price: product.price.toString(),
        unit: product.unit,
        restock_threshold: product.restock_threshold.toString(),
        description: "",
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      supplier: formData.supplier,
      quantity: Number.parseInt(formData.quantity),
      price: Number.parseFloat(formData.price),
      unit: formData.unit,
      restock_threshold: Number.parseInt(formData.restock_threshold),
      status:
        Number.parseInt(formData.quantity) <= 0
          ? "Out of Stock"
          : Number.parseInt(formData.quantity) <= Number.parseInt(formData.restock_threshold)
            ? "Low Stock"
            : "In Stock",
      last_updated: new Date().toISOString().split("T")[0],
    }

    onProductUpdated(updatedProduct)
    onOpenChange(false)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product information and details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Clear Cup 16oz"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => setFormData({ ...formData, supplier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (CAD)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., 50/pack"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-threshold">Restock Threshold</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={formData.restock_threshold}
                  onChange={(e) => setFormData({ ...formData, restock_threshold: e.target.value })}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

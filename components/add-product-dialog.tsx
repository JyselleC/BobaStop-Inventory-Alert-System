"use client"

import type React from "react"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { createSupplier, createActivityLog } from "@/lib/supabase"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: string[]
  onProductAdded: (product: any) => void
  onSupplierAdded?: (supplier: any) => void
}

export function AddProductDialog({
  open,
  onOpenChange,
  suppliers,
  onProductAdded,
  onSupplierAdded,
}: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    supplier: "",
    newSupplier: "",
    quantity: "", // Changed from 0 to ""
    restock_threshold: 1,
    price: "", // Changed from 0 to ""
    unit: "",
  })
  const [isNewSupplier, setIsNewSupplier] = useState(false)
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [showSupplierForm, setShowSupplierForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      (!formData.supplier && !formData.newSupplier) ||
      !formData.quantity ||
      !formData.price ||
      Number.parseFloat(formData.quantity) < 0 ||
      Number.parseFloat(formData.price) < 0
    ) {
      alert("Please fill in all required fields with valid values")
      return
    }

    const finalSupplier = isNewSupplier ? formData.newSupplier : formData.supplier

    const newProduct = {
      name: formData.name,
      supplier: finalSupplier,
      quantity: Number.parseInt(formData.quantity) || 0,
      restock_threshold: formData.restock_threshold,
      price: Number.parseFloat(formData.price) || 0,
      unit: formData.unit,
    }

    onProductAdded(newProduct)
    onOpenChange(false)

    // Reset form
    setFormData({
      name: "",
      supplier: "",
      newSupplier: "",
      quantity: "", // Changed from 0 to ""
      restock_threshold: 1,
      price: "", // Changed from 0 to ""
      unit: "",
    })
    setIsNewSupplier(false)
    setShowSupplierForm(false)
    setNewSupplierData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    })
  }

  const handleSupplierChange = (value: string) => {
    if (value === "add-new-supplier") {
      setShowSupplierForm(true)
      setIsNewSupplier(true)
      setFormData({ ...formData, supplier: "" })
    } else {
      setIsNewSupplier(false)
      setShowSupplierForm(false)
      setFormData({ ...formData, supplier: value, newSupplier: "" })
    }
  }

  const handleCreateSupplier = async () => {
    if (!newSupplierData.name.trim()) {
      alert("Please enter a supplier name")
      return
    }

    try {
      const supplierData = {
        name: newSupplierData.name,
        contact_person: newSupplierData.contact,
        email: newSupplierData.email,
        phone: newSupplierData.phone,
        address: newSupplierData.address,
        notes: newSupplierData.notes,
      }

      const createdSupplier = await createSupplier(supplierData)

      if (!createdSupplier) {
        throw new Error("Unable to save supplier in database")
      }

      // Log the activity
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      await createActivityLog({
        user_name: user.name || "Unknown",
        action: "CREATE",
        details: `Added new supplier: ${newSupplierData.name} (by ${user.name} - ${user.role})`,
        timestamp: new Date().toISOString(),
      })

      // Update the form with the new supplier
      setFormData({ ...formData, newSupplier: newSupplierData.name })
      setShowSupplierForm(false)

      // Notify parent component
      if (onSupplierAdded) {
        onSupplierAdded(createdSupplier)
      }

      alert(`Supplier "${newSupplierData.name}" has been added successfully!`)
    } catch (error) {
      console.error("Error adding supplier:", error)
      alert(`Failed to add supplier: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleCancelSupplier = () => {
    setShowSupplierForm(false)
    setIsNewSupplier(false)
    setNewSupplierData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    })
    setFormData({ ...formData, supplier: "", newSupplier: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Add a new product to your boba shop inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ceylon Black Tea"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier *</Label>
              {!showSupplierForm ? (
                <Select value={formData.supplier} onValueChange={handleSupplierChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new-supplier" className="text-blue-600 font-medium">
                      + Add New Supplier
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Add New Supplier</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelSupplier}>
                      Cancel
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="supplier-name" className="text-sm">
                        Supplier Name *
                      </Label>
                      <Input
                        id="supplier-name"
                        value={newSupplierData.name}
                        onChange={(e) => setNewSupplierData({ ...newSupplierData, name: e.target.value })}
                        placeholder="e.g., New Tea Supplier"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="supplier-contact" className="text-sm">
                          Contact Person
                        </Label>
                        <Input
                          id="supplier-contact"
                          value={newSupplierData.contact}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, contact: e.target.value })}
                          placeholder="Contact name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="supplier-phone" className="text-sm">
                          Phone
                        </Label>
                        <Input
                          id="supplier-phone"
                          value={newSupplierData.phone}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supplier-email" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="supplier-email"
                        type="email"
                        value={newSupplierData.email}
                        onChange={(e) => setNewSupplierData({ ...newSupplierData, email: e.target.value })}
                        placeholder="supplier@email.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supplier-address" className="text-sm">
                        Address
                      </Label>
                      <Input
                        id="supplier-address"
                        value={newSupplierData.address}
                        onChange={(e) => setNewSupplierData({ ...newSupplierData, address: e.target.value })}
                        placeholder="Supplier address"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supplier-notes" className="text-sm">
                        Notes
                      </Label>
                      <Textarea
                        id="supplier-notes"
                        value={newSupplierData.notes}
                        onChange={(e) => setNewSupplierData({ ...newSupplierData, notes: e.target.value })}
                        placeholder="Additional notes..."
                        rows={2}
                      />
                    </div>

                    <Button type="button" onClick={handleCreateSupplier} className="w-full">
                      Create Supplier
                    </Button>
                  </div>
                </div>
              )}

              {isNewSupplier && formData.newSupplier && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Supplier "{formData.newSupplier}" created successfully
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="restock_threshold">Restock Threshold</Label>
                <Input
                  id="restock_threshold"
                  type="number"
                  value={formData.restock_threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, restock_threshold: Number.parseInt(e.target.value) || 1 })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (CAD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., 1kg bag"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

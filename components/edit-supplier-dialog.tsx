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
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"
import { createSupplier, createActivityLog, type Supplier } from "@/lib/supabase"

interface EditSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSupplierUpdated: (supplier: Supplier) => void
}

export function EditSupplierDialog({ open, onOpenChange, supplier, onSupplierUpdated }: EditSupplierDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      })
    }
  }, [supplier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !supplier) {
      alert("Please enter a supplier name")
      return
    }

    try {
      const updatedSupplier: Supplier = {
        ...supplier,
        name: formData.name,
        contact_person: formData.contact,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        updated_at: new Date().toISOString(),
      }

      // If this is a generated supplier (negative ID), create it in the database
      if (supplier.id < 0) {
        const supplierData = {
          name: formData.name,
          contact_person: formData.contact,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
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
          details: `Created supplier: ${formData.name} (converted from generated supplier)`,
          timestamp: new Date().toISOString(),
        })

        onSupplierUpdated(createdSupplier)
      } else {
        // Update existing supplier
        onSupplierUpdated(updatedSupplier)

        // Log the activity
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        await createActivityLog({
          user_name: user.name || "Unknown",
          action: "UPDATE",
          details: `Updated supplier: ${formData.name}`,
          timestamp: new Date().toISOString(),
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating supplier:", error)
      alert(`Failed to update supplier: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (!supplier) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Edit Supplier
          </DialogTitle>
          <DialogDescription>Update supplier information and contact details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Tea Suppliers"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Contact person name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(416) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@supplier.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full business address including city, province, and postal code"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this supplier..."
                rows={3}
              />
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

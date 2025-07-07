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

export interface SupplierInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  description: string
}

interface SupplierManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSupplierSaved: (supplier: SupplierInfo) => void
  editingSupplier?: SupplierInfo | null
  mode: "add" | "edit"
}

export function SupplierManagementDialog({
  open,
  onOpenChange,
  onSupplierSaved,
  editingSupplier,
  mode,
}: SupplierManagementDialogProps) {
  const [formData, setFormData] = useState<SupplierInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
  })

  useEffect(() => {
    if (editingSupplier && mode === "edit") {
      setFormData(editingSupplier)
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        description: "",
      })
    }
  }, [editingSupplier, mode, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    onSupplierSaved(formData)
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof SupplierInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {mode === "add" ? "Add New Supplier" : "Edit Supplier"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new supplier to your boba shop network with complete contact information."
              : "Update supplier information and contact details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Premium Tea Suppliers"
                required
                disabled={mode === "edit"} // Don't allow name changes in edit mode
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the supplier's business and specialties..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full business address including city, province, and postal code"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(416) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@supplier.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="www.supplier.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "add" ? "Add Supplier" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

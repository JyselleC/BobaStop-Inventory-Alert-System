"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, DollarSign, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react"
import { getSuppliers, getProducts, deleteSupplier, updateSupplier, type Supplier, type Product } from "@/lib/supabase"
import { AddSupplierDialog } from "./add-supplier-dialog"
import { EditSupplierDialog } from "./edit-supplier-dialog"

interface SupplierStats {
  supplier: Supplier
  productCount: number
  lowStockCount: number
  totalValue: number
  products: Product[]
}

interface SupplierAnalysisProps {
  products?: Product[]
  userPermissions?: string[]
  onSupplierAdded?: (supplier: any) => void
  onSupplierUpdated?: (supplier: any) => void
}

export function SupplierAnalysis({
  products: propProducts,
  userPermissions = [],
  onSupplierAdded,
  onSupplierUpdated,
}: SupplierAnalysisProps = {}) {
  const [supplierStats, setSupplierStats] = useState<SupplierStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const loadSupplierData = async () => {
    try {
      setLoading(true)
      setError(null)

      const products = propProducts || (await getProducts())

      // Always try to get suppliers from Supabase first
      let dbSuppliers: Supplier[] = []
      try {
        dbSuppliers = await getSuppliers()
      } catch (err) {
        console.warn("Could not fetch suppliers from database:", err)
      }

      // Get unique supplier names from products
      const productSupplierNames = [...new Set(products.map((p) => p.supplier))]

      // Create a map of existing database suppliers (case-insensitive)
      const dbSupplierMap = new Map(dbSuppliers.map((s) => [s.name.toLowerCase(), s]))

      // Generate missing suppliers from products that don't exist in database
      // Use case-insensitive matching to prevent duplicates
      const missingSupplierNames = productSupplierNames.filter((name) => !dbSupplierMap.has(name.toLowerCase()))

      const defaultSupplierInfo = {
        Kingeleke: {
          contact_person: "Supply Manager",
          email: "orders@kingeleke.com",
          phone: "(905) 947-9033",
          address: "3315 14th Ave Markham, ON L3R 0H3",
          notes: "Premium tea and ingredient supplier specializing in bubble tea products",
        },
        TAAS: {
          contact_person: "Customer Service",
          email: "info@tomenterprisesltd.com",
          phone: "(416) 754-4222",
          address: "1160 Bellamy Road North Scarborough ON M1H 1H2",
          notes: "Packaging and disposable supplies for food service industry",
        },
        QualiTea: {
          contact_person: "Sales Team",
          email: "sales@qualitea.com",
          phone: "(555) 345-6789",
          address: "789 Flavor Blvd, Burnaby, BC",
          notes: "Syrups and flavor supplier",
        },
      }

      const generatedSuppliers: Supplier[] = missingSupplierNames.map((name, index) => ({
        id: -(index + 1), // Negative IDs for generated suppliers
        name,
        contact_person:
          defaultSupplierInfo[name as keyof typeof defaultSupplierInfo]?.contact_person || "Contact Person",
        email:
          defaultSupplierInfo[name as keyof typeof defaultSupplierInfo]?.email || `contact@${name.toLowerCase()}.com`,
        phone: defaultSupplierInfo[name as keyof typeof defaultSupplierInfo]?.phone || "(555) 123-4567",
        address: defaultSupplierInfo[name as keyof typeof defaultSupplierInfo]?.address || "Address not available",
        notes: defaultSupplierInfo[name as keyof typeof defaultSupplierInfo]?.notes || `Supplier for ${name} products`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      // Combine database suppliers with generated ones (no duplicates now)
      const allSuppliers = [...dbSuppliers, ...generatedSuppliers]

      const stats: SupplierStats[] = allSuppliers.map((supplier) => {
        const supplierProducts = products.filter((p) => p.supplier === supplier.name)
        const lowStockProducts = supplierProducts.filter((p) => p.quantity <= p.restock_threshold)
        const totalValue = supplierProducts.reduce((sum, p) => sum + p.quantity * p.price, 0)

        return {
          supplier,
          productCount: supplierProducts.length,
          lowStockCount: lowStockProducts.length,
          totalValue,
          products: supplierProducts,
        }
      })

      setSupplierStats(stats)
    } catch (err) {
      console.error("Error loading supplier data:", err)
      setError("Failed to load supplier data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSupplierData()
  }, [])

  const handleDeleteSupplier = async (supplierId: number) => {
    const supplier = supplierStats.find((s) => s.supplier.id === supplierId)?.supplier
    if (!supplier) return

    if (!confirm(`Are you sure you want to delete "${supplier.name}"?`)) return

    try {
      if (supplierId > 0) {
        // Database supplier - delete from Supabase
        await deleteSupplier(supplierId)
      } else {
        // Generated supplier - just remove from local state
        console.log(`Removing generated supplier: ${supplier.name}`)
      }
      await loadSupplierData() // Refresh data
    } catch (err) {
      console.error("Error deleting supplier:", err)
      alert("Failed to delete supplier")
    }
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  const handleSupplierUpdated = async (updatedSupplier: Supplier) => {
    try {
      await updateSupplier(updatedSupplier.id, updatedSupplier)
      setIsEditDialogOpen(false)
      setEditingSupplier(null)
      await loadSupplierData() // Refresh data
      if (onSupplierUpdated) {
        onSupplierUpdated(updatedSupplier)
      }
    } catch (err) {
      console.error("Error updating supplier:", err)
      alert("Failed to update supplier")
    }
  }

  const handleSupplierAdded = (newSupplier: any) => {
    setIsAddDialogOpen(false)
    loadSupplierData() // Refresh data to include the new supplier
    if (onSupplierAdded) {
      onSupplierAdded(newSupplier)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading supplier data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supplier Analysis</h2>
          <p className="text-gray-600">Manage suppliers and analyze their performance</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Supplier</Button>
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supplierStats.map((stat) => (
          <Card key={stat.supplier.id || stat.supplier.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{stat.supplier.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  {/* Show edit button for all suppliers */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditSupplier(stat.supplier)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {/* Show delete button for both database suppliers AND generated suppliers */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteSupplier(stat.supplier.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2 text-sm">
                {stat.supplier.email && stat.supplier.email !== "Not available" && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{stat.supplier.email}</span>
                  </div>
                )}
                {stat.supplier.phone && stat.supplier.phone !== "Not available" && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{stat.supplier.phone}</span>
                  </div>
                )}
                {stat.supplier.address && stat.supplier.address !== "Not available" && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs truncate">{stat.supplier.address}</span>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Package className="h-3 w-3" />
                  </div>
                  <div className="text-lg font-semibold">{stat.productCount}</div>
                  <div className="text-xs text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                  <div className="text-lg font-semibold">{stat.lowStockCount}</div>
                  <div className="text-xs text-gray-500">Low Stock</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <div className="text-lg font-semibold">${stat.totalValue.toFixed(0)}</div>
                  <div className="text-xs text-gray-500">Inventory</div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {stat.lowStockCount > 0 && (
                <Badge variant="destructive" className="w-full justify-center">
                  {stat.lowStockCount} item{stat.lowStockCount > 1 ? "s" : ""} need restocking
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {supplierStats.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-600 mb-4">Add your first supplier to get started with supplier management.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Supplier</Button>
          </CardContent>
        </Card>
      )}

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSupplierAdded={handleSupplierAdded}
      />

      <EditSupplierDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        supplier={editingSupplier}
        onSupplierUpdated={handleSupplierUpdated}
      />
    </div>
  )
}

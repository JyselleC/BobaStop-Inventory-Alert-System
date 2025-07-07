"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Sample data based on your JSON fixture
const sampleProducts = [
  {
    id: 1,
    name: "Ceylon Black Tea",
    supplier: "Kingeleke",
    quantity: 10,
    restock_threshold: 2,
    price: 15.99,
    unit: "1kg bag",
    status: "In Stock",
    last_updated: "2025-05-31",
  },
  {
    id: 2,
    name: "Brown Sugar Mix Powder No. 1",
    supplier: "Kingeleke",
    quantity: 10,
    restock_threshold: 2,
    price: 22.5,
    unit: "2kg bag",
    status: "In Stock",
    last_updated: "2025-05-31",
  },
  {
    id: 3,
    name: "Lychee Coconut Jelly",
    supplier: "Kingeleke",
    quantity: 2,
    restock_threshold: 2,
    price: 8.75,
    unit: "500g container",
    status: "Low Stock",
    last_updated: "2025-05-31",
  },
  {
    id: 4,
    name: "Bubble Tea Wrapped-Plastic Straw",
    supplier: "Kingeleke",
    quantity: 2,
    restock_threshold: 2,
    price: 12.0,
    unit: "1000 pack",
    status: "Low Stock",
    last_updated: "2025-05-31",
  },
  {
    id: 5,
    name: "Clear Cup 16oz",
    supplier: "TAAS",
    quantity: 2,
    restock_threshold: 2,
    price: 45.0,
    unit: "1000 pack",
    status: "Low Stock",
    last_updated: "2025-05-31",
  },
  {
    id: 6,
    name: "Dome Lid for Paper Coffee (white)",
    supplier: "TAAS",
    quantity: 2,
    restock_threshold: 2,
    price: 2.5,
    unit: "50/sleeve",
    status: "Low Stock",
    last_updated: "2025-05-31",
  },
]

export default function InventoryDashboard() {
  const [products, setProducts] = useState(sampleProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Always redirect to login page on initial load
    router.push("/login")
  }, [router])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSupplier = supplierFilter === "all" || product.supplier === supplierFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesSupplier && matchesStatus
  })

  const lowStockItems = products.filter((p) => p.quantity <= p.restock_threshold)
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
  const suppliers = [...new Set(products.map((p) => p.supplier))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )
}

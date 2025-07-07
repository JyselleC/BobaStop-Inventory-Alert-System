"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Shield,
  Crown,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Minus,
} from "lucide-react"
import { InventoryOverview } from "@/components/inventory-overview"
import { SupplierAnalysis } from "@/components/supplier-analysis"
import { AlertsPanel } from "@/components/alerts-panel"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import Image from "next/image"
import { SimpleActivityLogs } from "@/components/simple-activity-logs"
import {
  getProducts,
  updateProduct as updateProductHelper,
  createProduct,
  deleteProductFromSupabase,
  createActivityLog,
  initializeDefaultProducts,
  isSupabaseConfigured,
  getCartItems,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} from "@/lib/supabase"
import { AddProductDialog } from "@/components/add-product-dialog"
import { EditProductDialog } from "@/components/edit-product-dialog"
import { InventoryTable } from "@/components/inventory-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { sendSMSAlert, formatLowStockAlert } from "@/lib/twilio"

// RESTORED ORIGINAL 34 PRODUCTS - Default product template
const getDefaultProducts = () => [
  {
    id: 1,
    name: "Ceylon Black Tea",
    supplier: "Kingeleke",
    quantity: 10,
    restock_threshold: 1,
    price: 15.99,
    unit: "1kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    name: "Brown Sugar Mix Powder No. 1",
    supplier: "Kingeleke",
    quantity: 10,
    restock_threshold: 1,
    price: 22.5,
    unit: "2kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 3,
    name: "Lychee Coconut Jelly",
    supplier: "Kingeleke",
    quantity: 2,
    restock_threshold: 1,
    price: 8.75,
    unit: "500g container",
    status: "Low Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 4,
    name: "Bubble Tea Wrapped-Plastic Straw",
    supplier: "Kingeleke",
    quantity: 2,
    restock_threshold: 1,
    price: 12.0,
    unit: "1000 pack",
    status: "Low Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 5,
    name: "Clear Cup 16oz",
    supplier: "TAAS",
    quantity: 2,
    restock_threshold: 1,
    price: 45.0,
    unit: "1000 pack",
    status: "Low Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 6,
    name: "Dome Lid for Paper Coffee (white)",
    supplier: "TAAS",
    quantity: 2,
    restock_threshold: 1,
    price: 2.5,
    unit: "50/sleeve",
    status: "Low Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 7,
    name: "Jasmine Green Tea",
    supplier: "Kingeleke",
    quantity: 8,
    restock_threshold: 1,
    price: 14.99,
    unit: "1kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 8,
    name: "Taro Powder",
    supplier: "Kingeleke",
    quantity: 5,
    restock_threshold: 1,
    price: 18.75,
    unit: "1kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 9,
    name: "Matcha Powder",
    supplier: "Kingeleke",
    quantity: 3,
    restock_threshold: 1,
    price: 25.99,
    unit: "500g container",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 10,
    name: "Honey Syrup",
    supplier: "QualiTea",
    quantity: 12,
    restock_threshold: 1,
    price: 8.99,
    unit: "750ml bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 11,
    name: "Brown Sugar Syrup",
    supplier: "QualiTea",
    quantity: 8,
    restock_threshold: 1,
    price: 16.99,
    unit: "2.5kg bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 12,
    name: "Vanilla Syrup",
    supplier: "QualiTea",
    quantity: 6,
    restock_threshold: 1,
    price: 9.99,
    unit: "750ml bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 13,
    name: "Strawberry Syrup",
    supplier: "QualiTea",
    quantity: 4,
    restock_threshold: 1,
    price: 11.99,
    unit: "750ml bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 14,
    name: "Mango Syrup",
    supplier: "QualiTea",
    quantity: 7,
    restock_threshold: 1,
    price: 12.99,
    unit: "750ml bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 15,
    name: "Passion Fruit Syrup",
    supplier: "QualiTea",
    quantity: 5,
    restock_threshold: 1,
    price: 13.99,
    unit: "750ml bottle",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 16,
    name: "Tapioca Pearls (Black)",
    supplier: "Kingeleke",
    quantity: 15,
    restock_threshold: 1,
    price: 14.99,
    unit: "3kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 17,
    name: "Tapioca Pearls (White)",
    supplier: "Kingeleke",
    quantity: 10,
    restock_threshold: 1,
    price: 14.99,
    unit: "3kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 18,
    name: "Popping Boba - Strawberry",
    supplier: "Kingeleke",
    quantity: 8,
    restock_threshold: 1,
    price: 16.99,
    unit: "3.2kg jar",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 19,
    name: "Popping Boba - Mango",
    supplier: "Kingeleke",
    quantity: 6,
    restock_threshold: 1,
    price: 16.99,
    unit: "3.2kg jar",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 20,
    name: "Popping Boba - Lychee",
    supplier: "Kingeleke",
    quantity: 4,
    restock_threshold: 1,
    price: 16.99,
    unit: "3.2kg jar",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 21,
    name: "Coconut Jelly",
    supplier: "Kingeleke",
    quantity: 12,
    restock_threshold: 1,
    price: 7.99,
    unit: "500g container",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 22,
    name: "Grass Jelly",
    supplier: "Kingeleke",
    quantity: 9,
    restock_threshold: 1,
    price: 6.99,
    unit: "500g container",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 23,
    name: "Aloe Vera Cubes",
    supplier: "Kingeleke",
    quantity: 7,
    restock_threshold: 1,
    price: 8.99,
    unit: "500g container",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 24,
    name: "Plastic Cup 20oz",
    supplier: "TAAS",
    quantity: 25,
    restock_threshold: 1,
    price: 52.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 25,
    name: "Plastic Cup 24oz",
    supplier: "TAAS",
    quantity: 20,
    restock_threshold: 1,
    price: 58.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 26,
    name: "Dome Lid for 20oz Cup",
    supplier: "TAAS",
    quantity: 30,
    restock_threshold: 1,
    price: 35.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 27,
    name: "Dome Lid for 24oz Cup",
    supplier: "TAAS",
    quantity: 25,
    restock_threshold: 1,
    price: 38.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 28,
    name: "Bubble Tea Straw (Colored)",
    supplier: "TAAS",
    quantity: 18,
    restock_threshold: 1,
    price: 15.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 29,
    name: "Sealing Film for Cups",
    supplier: "TAAS",
    quantity: 8,
    restock_threshold: 1,
    price: 45.0,
    unit: "2000 sheets",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 30,
    name: "Paper Napkins",
    supplier: "TAAS",
    quantity: 40,
    restock_threshold: 1,
    price: 12.0,
    unit: "5000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 31,
    name: "Disposable Spoons",
    supplier: "TAAS",
    quantity: 35,
    restock_threshold: 1,
    price: 8.0,
    unit: "1000 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 32,
    name: "Cup Carrier Trays",
    supplier: "TAAS",
    quantity: 22,
    restock_threshold: 1,
    price: 25.0,
    unit: "500 pack",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 33,
    name: "Cleaning Supplies Kit",
    supplier: "TAAS",
    quantity: 5,
    restock_threshold: 1,
    price: 35.0,
    unit: "1 kit",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
  {
    id: 34,
    name: "Non-Dairy Creamer",
    supplier: "QualiTea",
    quantity: 14,
    restock_threshold: 1,
    price: 19.99,
    unit: "1kg bag",
    status: "In Stock",
    last_updated: new Date().toISOString().split("T")[0],
  },
]

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [user, setUser] = useState(null)
  const [alerts, setAlerts] = useState([])
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("inventory")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [supabaseStatus, setSupabaseStatus] = useState("checking")
  const [alertedProducts, setAlertedProducts] = useState(new Set()) // Track which products have been alerted

  // Add refs to prevent duplicate alerts
  const alertInProgress = useRef(false)
  const lastAlertTime = useRef(0)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userData = localStorage.getItem("user")

    if (!isAuthenticated || isAuthenticated !== "true") {
      router.push("/login")
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load products
    loadProducts()
  }, [router])

  useEffect(() => {
    // Load cart items when user changes
    if (user) {
      loadCartItems()
    }
  }, [user])

  // FIXED: Auto-send SMS alerts when products reach low stock threshold
  useEffect(() => {
    if (products.length === 0) return

    const checkAndSendAlerts = async () => {
      // Prevent multiple simultaneous alert attempts
      if (alertInProgress.current) {
        console.log("🔄 Alert already in progress, skipping...")
        return
      }

      // Debounce: Don't send alerts more than once every 30 seconds
      const now = Date.now()
      if (now - lastAlertTime.current < 30000) {
        console.log("⏱️ Alert cooldown active, skipping...")
        return
      }

      const lowStockItems = products.filter((p) => p.quantity <= p.restock_threshold)

      // Find newly low stock items that haven't been alerted yet
      const newLowStockItems = lowStockItems.filter((item) => !alertedProducts.has(item.id))

      if (newLowStockItems.length > 0) {
        console.log(
          `🚨 Auto-sending SMS alert for ${newLowStockItems.length} newly low stock items:`,
          newLowStockItems.map((item) => `${item.name} (${item.quantity} left)`),
        )

        alertInProgress.current = true
        lastAlertTime.current = now

        try {
          const message = formatLowStockAlert(newLowStockItems)
          const result = await sendSMSAlert({
            message,
            recipients: [], // Recipients are handled in the API route
          })

          if (result && result.success) {
            // Mark these products as alerted
            setAlertedProducts((prev) => {
              const newSet = new Set(prev)
              newLowStockItems.forEach((item) => newSet.add(item.id))
              return newSet
            })

            // Log the automatic alert
            if (isSupabaseConfigured && supabaseStatus === "connected") {
              await createActivityLog({
                user_name: "System",
                action: "AUTO_ALERT",
                details: `Automatic SMS alert sent for ${newLowStockItems.length} low stock items: ${newLowStockItems.map((item) => item.name).join(", ")}`,
                timestamp: new Date().toISOString(),
              })
            }

            console.log(
              `✅ Auto SMS alert sent successfully for: ${newLowStockItems.map((item) => item.name).join(", ")}`,
            )
          }
        } catch (error) {
          console.error("❌ Failed to send automatic SMS alert:", error)
        } finally {
          alertInProgress.current = false
        }
      }

      // Remove products from alerted set if they're no longer low stock
      const currentLowStockIds = new Set(lowStockItems.map((item) => item.id))
      setAlertedProducts((prev) => {
        const newSet = new Set()
        prev.forEach((id) => {
          if (currentLowStockIds.has(id)) {
            newSet.add(id)
          }
        })
        return newSet
      })
    }

    // Check for alerts with a delay to avoid rapid firing
    const timeoutId = setTimeout(checkAndSendAlerts, 2000)
    return () => clearTimeout(timeoutId)
  }, [products, isSupabaseConfigured, supabaseStatus]) // REMOVED alertedProducts from dependencies

  const loadProducts = async () => {
    if (isSupabaseConfigured) {
      try {
        setSupabaseStatus("connecting")
        await initializeDefaultProducts()
        const supabaseProducts = await getProducts()
        if (supabaseProducts.length) {
          setProducts(supabaseProducts)
          setSupabaseStatus("connected")
          return
        }
      } catch (err) {
        console.error("Supabase error:", err)
        setSupabaseStatus("error")
      }
    } else {
      setSupabaseStatus("not-configured")
    }
    // Fallback to local data - NOW WITH ALL 34 PRODUCTS
    setProducts(getDefaultProducts())
  }

  const loadCartItems = async () => {
    if (!user) return

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const items = await getCartItems(user.name)
        setCartItems(items)
      } catch (error) {
        console.error("Failed to load cart items:", error)
      }
    }
  }

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "staff":
        return <Users className="w-4 h-4 text-green-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const updateProductQuantity = async (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const oldQuantity = product.quantity

    // Update local state immediately for responsive UI
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newQuantity,
              status: newQuantity <= 0 ? "Out of Stock" : newQuantity <= p.restock_threshold ? "Low Stock" : "In Stock",
              last_updated: new Date().toISOString().split("T")[0],
            }
          : p,
      ),
    )

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const updatedProduct = await updateProductHelper(productId, {
          quantity: newQuantity,
          status:
            newQuantity <= 0 ? "Out of Stock" : newQuantity <= product.restock_threshold ? "Low Stock" : "In Stock",
          last_updated: new Date().toISOString().split("T")[0],
        })

        if (updatedProduct) {
          await createActivityLog({
            user_name: user.name,
            action: "UPDATE",
            details: `Updated ${product.name} quantity from ${oldQuantity} to ${newQuantity}`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to update product in Supabase:", error)
      }
    }
  }

  const addProduct = async (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(), // Temporary ID for local state
      status:
        productData.quantity <= 0
          ? "Out of Stock"
          : productData.quantity <= productData.restock_threshold
            ? "Low Stock"
            : "In Stock",
      last_updated: new Date().toISOString().split("T")[0],
    }

    // Update local state immediately
    setProducts((prev) => [...prev, newProduct])

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const createdProduct = await createProduct(productData)
        if (createdProduct) {
          // Update with real ID from Supabase
          setProducts((prev) => prev.map((p) => (p.id === newProduct.id ? createdProduct : p)))

          await createActivityLog({
            user_name: user.name,
            action: "CREATE",
            details: `Added new product: ${productData.name} (${productData.supplier})`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to create product in Supabase:", error)
      }
    }
  }

  const deleteProduct = async (productId) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    // Update local state immediately
    setProducts((prev) => prev.filter((p) => p.id !== productId))

    // Remove from alerted products set
    setAlertedProducts((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const success = await deleteProductFromSupabase(productId)
        if (success) {
          await createActivityLog({
            user_name: user.name,
            action: "DELETE",
            details: `Deleted product: ${product.name} (${product.supplier})`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to delete product in Supabase:", error)
      }
    }
  }

  const editProduct = (product) => {
    setEditingProduct(product)
    setShowEditDialog(true)
  }

  const saveProductChanges = async (updatedProduct) => {
    // optimistic UI update
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const result = await updateProductHelper(updatedProduct.id, updatedProduct)
        if (result) {
          await createActivityLog({
            user_name: user.name,
            action: "UPDATE",
            details: `Updated product details: ${updatedProduct.name}`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to update product in Supabase:", error)
      }
    }
  }

  const handleAddToCart = async (product) => {
    // Create a stable temporary ID so we can find/replace this item later
    const tempId = Date.now()
    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      supplier: product.supplier,
      unit: product.unit,
      price: product.price,
      current_stock: product.quantity,
      restock_threshold: product.restock_threshold,
      needed_quantity: Math.max(1, product.restock_threshold - product.quantity + 5), // Suggest restocking to 5 above threshold
      added_at: new Date().toISOString(),
      user_name: user.name,
    }

    // Update local state immediately
    setCartItems((prev) => [...prev, { ...cartItem, id: tempId }])

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const createdItem = await addToCart(cartItem)
        if (createdItem) {
          // Replace the placeholder row (tempId) with the real row returned by Supabase
          setCartItems((prev) => prev.map((item) => (item.id === tempId ? createdItem : item)))

          await createActivityLog({
            user_name: user.name,
            action: "ADD_TO_CART",
            details: `Added ${product.name} to shopping cart`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to add to cart in Supabase:", error)
      }
    }
  }

  const handleRemoveFromCart = async (cartItemId) => {
    const item = cartItems.find((item) => item.id === cartItemId)
    if (!item) return

    // Update local state immediately
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const success = await removeFromCart(cartItemId)
        if (success) {
          await createActivityLog({
            user_name: user.name,
            action: "REMOVE_FROM_CART",
            details: `Removed ${item.product_name} from shopping cart`,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to remove from cart in Supabase:", error)
      }
    }
  }

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your entire shopping cart?")) return

    // Update local state immediately
    setCartItems([])

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        const success = await clearCart(user.name)
        if (success) {
          await createActivityLog({
            user_name: user.name,
            action: "CLEAR_CART",
            details: "Cleared shopping cart",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to clear cart in Supabase:", error)
      }
    }
  }

  const handleReceiveItem = async (cartItem) => {
    if (!confirm(`Mark ${cartItem.product_name} as received and add ${cartItem.needed_quantity} to inventory?`)) return

    // Find the product in inventory
    const product = products.find((p) => p.id === cartItem.product_id)
    if (!product) {
      alert("Product not found in inventory")
      return
    }

    const newQuantity = product.quantity + cartItem.needed_quantity

    // Update inventory quantity
    await updateProductQuantity(cartItem.product_id, newQuantity)

    // Remove from cart
    await handleRemoveFromCart(cartItem.id)

    // Log the receive activity
    if (isSupabaseConfigured && supabaseStatus === "connected") {
      await createActivityLog({
        user_name: user.name,
        action: "RECEIVE",
        details: `Received ${cartItem.needed_quantity} units of ${cartItem.product_name}. Updated inventory from ${product.quantity} to ${newQuantity}`,
        timestamp: new Date().toISOString(),
      })
    }

    alert(
      `✅ Received ${cartItem.needed_quantity} units of ${cartItem.product_name}!\nInventory updated from ${product.quantity} to ${newQuantity}`,
    )
  }

  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    // Update local state immediately
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, needed_quantity: newQuantity } : item)),
    )

    if (isSupabaseConfigured && supabaseStatus === "connected") {
      try {
        await updateCartItem(cartItemId, { needed_quantity: newQuantity })
      } catch (error) {
        console.error("Failed to update cart item quantity:", error)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleSupplierAdded = (newSupplier) => {
    // Refresh the suppliers list by reloading products
    loadProducts()
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSupplier = supplierFilter === "all" || product.supplier === supplierFilter
      const matchesStatus = statusFilter === "all" || product.status === statusFilter

      return matchesSearch && matchesSupplier && matchesStatus
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const lowStockItems = products.filter((p) => p.quantity <= p.restock_threshold)
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
  const suppliers = [...new Set(products.map((p) => p.supplier))].sort()
  const cartTotal = cartItems.reduce((sum, item) => sum + item.needed_quantity * item.price, 0)

  const getSupabaseStatusBadge = () => {
    switch (supabaseStatus) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected to Supabase
          </Badge>
        )
      case "connecting":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Connecting...
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Supabase Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Using Local Data
          </Badge>
        )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/boba-stop-logo.png"
              alt="Boba Stop Logo"
              width={80}
              height={80}
              className="sm:w-[120px] sm:h-[120px] rounded-full"
            />
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">Boba Stop</h1>
              <p className="text-sm sm:text-base text-gray-600">Inventory and Restock Alert System</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white rounded-lg shadow-sm text-xs sm:text-sm">
              {getRoleIcon(user.role)}
              <span className="font-medium">{user.name}</span>
            </div>
            {getSupabaseStatusBadge()}
            <Button variant="outline" size="sm" onClick={() => setActiveTab("alerts")} className="text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Alerts </span>({lowStockItems.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("shopping")} className="text-xs sm:text-sm">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Cart </span>({cartItems.length})
            </Button>
            {hasPermission("edit") && (
              <Button onClick={() => setShowAddDialog(true)} className="text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add Product
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm bg-transparent">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Supabase Status Alert */}
        {supabaseStatus === "error" && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Unable to connect to Supabase database. Using local data with all 34 products. Check your environment
              variables and database setup.
            </AlertDescription>
          </Alert>
        )}

        {supabaseStatus === "not-configured" && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Supabase is not configured. Using local data with all 34 products. Add your NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables to enable database sync.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <InventoryOverview
          totalProducts={products.length}
          lowStockItems={lowStockItems.length}
          totalValue={totalValue}
          suppliers={suppliers.length}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="inventory" className="text-xs sm:text-sm py-2">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs sm:text-sm py-2">
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="shopping" className="text-xs sm:text-sm py-2">
              Shopping ({cartItems.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs sm:text-sm py-2">
              Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm py-2">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Inventory ({products.length} items)</CardTitle>
                    <CardDescription>
                      Manage your boba tea ingredients and supplies.{" "}
                      {supabaseStatus === "connected" && "✓ Synced with Supabase"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="All Suppliers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Suppliers</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="In Stock">In Stock</SelectItem>
                          <SelectItem value="Low Stock">Low Stock</SelectItem>
                          <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <InventoryTable
                  products={filteredProducts}
                  onQuantityUpdate={updateProductQuantity}
                  onDeleteProduct={deleteProduct}
                  onEditProduct={editProduct}
                  onAddToCart={handleAddToCart}
                  userPermissions={user.permissions || ["edit"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            <SupplierAnalysis
              products={products}
              userPermissions={user.permissions || []}
              onSupplierAdded={() => {
                // Optionally reload products if needed
                loadProducts()
              }}
              onSupplierUpdated={() => {
                // Optionally reload products if needed
                loadProducts()
              }}
            />
          </TabsContent>

          <TabsContent value="shopping" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shopping Cart</CardTitle>
                    <CardDescription>Items added for restocking</CardDescription>
                  </div>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cart
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Your shopping cart is empty</p>
                    <p className="text-sm">Add items from the Inventory tab</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Needed Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cartItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.product_name}</div>
                                  <div className="text-sm text-gray-500">{item.unit}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.supplier}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{item.current_stock}</span>
                                  {item.current_stock <= item.restock_threshold && (
                                    <Badge variant="destructive" className="text-xs">
                                      Low
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateCartItemQuantity(item.id, Math.max(1, item.needed_quantity - 1))
                                    }
                                    className="h-7 w-7 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="font-medium w-8 text-center">{item.needed_quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateCartItemQuantity(item.id, item.needed_quantity + 1)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>${item.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <span className="font-medium">${(item.needed_quantity * item.price).toFixed(2)}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleReceiveItem(item)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                  >
                                    Received
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">Total: ${cartTotal.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertsPanel lowStockItems={lowStockItems} alerts={alerts} onClearAlerts={() => setAlerts([])} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard products={products} />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <SimpleActivityLogs userRole={user.role} userName={user.name} />
          </TabsContent>
        </Tabs>
        {/* Add Product Dialog */}
        <AddProductDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          suppliers={suppliers}
          onProductAdded={addProduct}
          onSupplierAdded={handleSupplierAdded}
        />

        {/* Edit Product Dialog */}
        <EditProductDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={editingProduct}
          suppliers={suppliers}
          onProductUpdated={saveProductChanges}
        />
      </div>
    </div>
  )
}

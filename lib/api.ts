// API functions to connect to your Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Product {
  id: number
  name: string
  supplier: string
  quantity: number
  restock_threshold: number
  price?: number
  unit?: string
  status: string
  last_updated: string
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/`)
    if (!response.ok) throw new Error("Failed to fetch products")
    return await response.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    // Return sample data as fallback
    return getSampleProducts()
  }
}

export async function updateProductQuantity(id: number, quantity: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) throw new Error("Failed to update product")
  return await response.json()
}

export async function createProduct(productData: Omit<Product, "id">): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) throw new Error("Failed to create product")
  return await response.json()
}

export async function sendLowStockAlert(productIds: number[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alerts/send-sms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_ids: productIds }),
  })

  if (!response.ok) throw new Error("Failed to send alert")
}

// Sample data for development/fallback
function getSampleProducts(): Product[] {
  return [
    {
      id: 1,
      name: "Ceylon Black Tea",
      supplier: "Kingeleke",
      quantity: 10,
      restock_threshold: 1, // Changed from 2 to 1
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
      restock_threshold: 1, // Changed from 2 to 1
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
      restock_threshold: 1, // Changed from 2 to 1
      price: 8.75,
      unit: "500g container",
      status: "Low Stock",
      last_updated: "2025-05-31",
    },
    // Add more sample products as needed
  ]
}

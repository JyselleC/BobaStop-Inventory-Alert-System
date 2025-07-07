import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured =
  !supabaseUrl.includes("your-project.supabase.co") && !supabaseAnonKey.startsWith("your-")

// Database types
export interface Product {
  id: number
  name: string
  supplier: string
  quantity: number
  restock_threshold: number
  price: number
  unit: string
  status: string
  last_updated: string
  created_at?: string
  updated_at?: string
}

export interface Supplier {
  id: number
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ActivityLog {
  id: number
  user_name: string
  action: string
  details: string
  timestamp: string
  created_at?: string
}

export interface CartItem {
  id: number
  product_id: number
  product_name: string
  supplier: string
  unit: string
  price: number
  current_stock: number
  restock_threshold: number
  needed_quantity: number
  added_at: string
  user_name: string
  created_at?: string
}

// Supplier functions
export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.from("suppliers").select("*").order("name")
  if (error) {
    // 42P01 = undefined_table.  Treat this exactly the same way we treat
    // an empty database: fall back to local data and keep the UI alive.
    if ((error as any).code === "42P01") {
      console.warn("Supabase: suppliers table not found – using local fallback")
      return []
    }

    // Any other error should still be logged, but must not crash the UI.
    console.error("Error fetching suppliers:", {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
    })
    return []
  }
  return data || []
}

export async function createSupplier(
  supplier: Omit<Supplier, "id" | "created_at" | "updated_at">,
): Promise<Supplier | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from("suppliers")
    .insert(
      [
        {
          ...supplier,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      { count: "exact" },
    )
    .select()

  // supabase-js v2 returns `data` as an array when using `insert().select()`
  const row = Array.isArray(data) ? data[0] : (data ?? null)

  if (error || !row) {
    console.error(
      "Supabase - createSupplier failed",
      JSON.stringify(
        {
          code: (error as any)?.code,
          message: error?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          row,
        },
        null,
        2,
      ),
    )
    return null
  }

  return row as Supplier
}

export async function updateSupplier(id: number, updates: Partial<Supplier>): Promise<Supplier | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from("suppliers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()
  if (error) {
    console.error("Error updating supplier:", error)
    return null
  }
  return data
}

export async function deleteSupplier(id: number): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from("suppliers").delete().eq("id", id)
  if (error) {
    console.error("Error deleting supplier:", error)
    return false
  }
  return true
}

// Product functions
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.from("products").select("*").order("name")
  if (error) {
    // 42P01 = undefined_table (PostgreSQL error code)
    if ((error as any).code === "42P01") {
      console.warn("Supabase: products table does not exist – skipping remote sync")
      throw new Error("SUPABASE_TABLE_NOT_FOUND")
    }
    console.error("Error fetching products:", error)
    throw error
  }
  return data || []
}

// Alias for backward compatibility
export const loadProductsAlias = getProducts

/**
 * Alias for getProducts() — kept for backward-compatibility with pages that
 * still import { loadProducts } from "@/lib/supabase".
 */
export async function loadProducts(): Promise<Product[]> {
  return getProducts()
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from("products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()
  if (error) {
    console.error(
      "Error updating product:",
      JSON.stringify(
        {
          code: (error as any).code,
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
        },
        null,
        2,
      ),
    )
    return null
  }
  if (!data) {
    console.warn(`Supabase: product id ${id} not updated – record not found or permission denied`)
    return null
  }
  return data
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()
  if (error) {
    console.error("Error creating product:", error)
    return null
  }
  return data
}

export async function deleteProductFromSupabase(id: number): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) {
    console.error("Error deleting product:", error)
    return false
  }
  return true
}

// Activity log functions
export async function getActivityLogs(): Promise<ActivityLog[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100)
  if (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }
  return data || []
}

export async function createActivityLog(log: Omit<ActivityLog, "id" | "created_at">): Promise<ActivityLog | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from("activity_logs")
    .insert([
      {
        ...log,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()
  if (error) {
    console.error("Error creating activity log:", error)
    return null
  }
  return data
}

// Shopping cart functions
export async function getCartItems(userName: string): Promise<CartItem[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_name", userName)
    .order("added_at", { ascending: false })
  if (error) {
    console.error("Error fetching cart items:", error)
    return []
  }
  return data || []
}

export async function addToCart(item: Omit<CartItem, "id" | "created_at">): Promise<CartItem | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from("cart_items")
    .insert([
      {
        ...item,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()
  if (error) {
    console.error("Error adding to cart:", error)
    return null
  }
  return data
}

// Update a cart row by primary-key. We use `.maybeSingle()` so the call
// succeeds even if Supabase returns 0 rows (e.g. when `returning` is
// set to `minimal` on the table or the record isn’t found).
export async function updateCartItem(id: number, updates: Partial<CartItem>): Promise<CartItem | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from("cart_items").update(updates).eq("id", id).select().maybeSingle()

  if (error) {
    console.error("Error updating cart item:", error)
    return null
  }
  // data will be `null` if Supabase returned 0 rows – treat as success
  return data ?? null
}

export async function removeFromCart(id: number): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from("cart_items").delete().eq("id", id)
  if (error) {
    console.error("Error removing from cart:", error)
    return false
  }
  return true
}

export async function clearCart(userName: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase.from("cart_items").delete().eq("user_name", userName)
  if (error) {
    console.error("Error clearing cart:", error)
    return false
  }
  return true
}

// Initialize default products if database is empty - RESTORED ORIGINAL 34 PRODUCTS
export async function initializeDefaultProducts(): Promise<void> {
  if (!isSupabaseConfigured) return
  try {
    const existing = await getProducts()
    if (existing.length) return
  } catch (err) {
    if ((err as Error).message === "SUPABASE_TABLE_NOT_FOUND") {
      return
    }
    throw err
  }

  const defaultProducts = [
    {
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

  for (const product of defaultProducts) {
    await createProduct(product)
  }
  console.log("Default products initialized in Supabase")
}

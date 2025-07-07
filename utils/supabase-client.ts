import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Minimal Product type for this utility
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
}

// Update product function with error handling
export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle() // Use maybeSingle() to avoid errors when no rows match

    if (error) {
      console.error("Error updating product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error updating product:", error)
    return null
  }
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching products:", error)
    return []
  }
}

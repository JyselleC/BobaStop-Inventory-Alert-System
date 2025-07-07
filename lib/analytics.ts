import { supabase, isSupabaseConfigured } from "./supabase"

// Types for analytics data
export interface InventorySnapshot {
  id?: number
  product_id: number
  product_name: string
  supplier: string
  quantity: number
  price: number
  total_value: number
  status: string
  snapshot_date: string
  created_at?: string
}

export interface StockMovement {
  id?: number
  product_id: number
  product_name: string
  movement_type: "IN" | "OUT" | "ADJUSTMENT" | "RECEIVED" | "SOLD"
  quantity_change: number
  quantity_before: number
  quantity_after: number
  unit_price?: number
  total_cost?: number
  reason?: string
  reference_id?: string
  user_name: string
  notes?: string
  movement_date: string
  created_at?: string
}

export interface SupplierMetric {
  id?: number
  supplier_name: string
  metric_date: string
  total_products: number
  total_inventory_value: number
  low_stock_items: number
  out_of_stock_items: number
  average_stock_level?: number
  restock_frequency?: number
  created_at?: string
}

export interface DailyMetric {
  id?: number
  metric_date: string
  total_products: number
  total_inventory_value: number
  low_stock_items: number
  out_of_stock_items: number
  total_suppliers: number
  average_stock_level?: number
  highest_value_product?: string
  most_critical_item?: string
  created_at?: string
}

// Create daily inventory snapshot
export async function createInventorySnapshot(products: any[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const today = new Date().toISOString().split("T")[0]

    // Check if snapshot already exists for today
    const { data: existing } = await supabase
      .from("inventory_snapshots")
      .select("id")
      .eq("snapshot_date", today)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log("Inventory snapshot already exists for today")
      return true
    }

    // Create snapshots for all products
    const snapshots: InventorySnapshot[] = products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      supplier: product.supplier,
      quantity: product.quantity,
      price: product.price,
      total_value: product.quantity * product.price,
      status: product.status,
      snapshot_date: today,
    }))

    const { error } = await supabase.from("inventory_snapshots").insert(snapshots)

    if (error) throw error

    console.log(`Created inventory snapshot for ${snapshots.length} products`)
    return true
  } catch (error) {
    console.error("Error creating inventory snapshot:", error)
    return false
  }
}

// Record stock movement
export async function recordStockMovement(movement: Omit<StockMovement, "id" | "created_at">): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase.from("stock_movements").insert([movement])

    if (error) throw error

    console.log("Stock movement recorded:", movement)
    return true
  } catch (error) {
    console.error("Error recording stock movement:", error)
    return false
  }
}

// Generate daily metrics
export async function generateDailyMetrics(products: any[], suppliers: string[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const today = new Date().toISOString().split("T")[0]

    // Check if metrics already exist for today
    const { data: existing } = await supabase.from("daily_metrics").select("id").eq("metric_date", today).limit(1)

    if (existing && existing.length > 0) {
      console.log("Daily metrics already exist for today")
      return true
    }

    const lowStockItems = products.filter((p) => p.quantity <= p.restock_threshold)
    const outOfStockItems = products.filter((p) => p.quantity === 0)
    const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
    const avgStockLevel = products.reduce((sum, p) => sum + p.quantity, 0) / products.length

    const highestValueProduct = products.sort((a, b) => b.quantity * b.price - a.quantity * a.price)[0]

    const mostCriticalItem = lowStockItems.sort(
      (a, b) => b.price * b.restock_threshold - a.price * a.restock_threshold,
    )[0]

    const metrics: DailyMetric = {
      metric_date: today,
      total_products: products.length,
      total_inventory_value: totalValue,
      low_stock_items: lowStockItems.length,
      out_of_stock_items: outOfStockItems.length,
      total_suppliers: suppliers.length,
      average_stock_level: Math.round(avgStockLevel * 100) / 100,
      highest_value_product: highestValueProduct?.name || null,
      most_critical_item: mostCriticalItem?.name || null,
    }

    const { error } = await supabase.from("daily_metrics").insert([metrics])

    if (error) throw error

    console.log("Daily metrics generated:", metrics)
    return true
  } catch (error) {
    console.error("Error generating daily metrics:", error)
    return false
  }
}

// Get historical data for analytics
export async function getHistoricalData(
  startDate: string,
  endDate: string,
  type: "snapshots" | "movements" | "metrics",
): Promise<any[]> {
  if (!isSupabaseConfigured) return []

  try {
    let query

    switch (type) {
      case "snapshots":
        query = supabase
          .from("inventory_snapshots")
          .select("*")
          .gte("snapshot_date", startDate)
          .lte("snapshot_date", endDate)
          .order("snapshot_date", { ascending: false })
        break

      case "movements":
        query = supabase
          .from("stock_movements")
          .select("*")
          .gte("movement_date", startDate)
          .lte("movement_date", endDate)
          .order("movement_date", { ascending: false })
        break

      case "metrics":
        query = supabase
          .from("daily_metrics")
          .select("*")
          .gte("metric_date", startDate)
          .lte("metric_date", endDate)
          .order("metric_date", { ascending: false })
        break

      default:
        return []
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error(`Error fetching historical ${type}:`, error)
    return []
  }
}

// Export historical data to CSV
export async function exportHistoricalCSV(
  startDate: string,
  endDate: string,
  type: "inventory" | "movements" | "metrics",
): Promise<string> {
  try {
    let data: any[] = []
    let headers: string[] = []
    let filename = ""

    switch (type) {
      case "inventory":
        data = await getHistoricalData(startDate, endDate, "snapshots")
        headers = ["Date", "Product", "Supplier", "Quantity", "Unit Price", "Total Value", "Status"]
        filename = `inventory-history-${startDate}-to-${endDate}.csv`
        break

      case "movements":
        data = await getHistoricalData(startDate, endDate, "movements")
        headers = ["Date", "Product", "Type", "Quantity Change", "Before", "After", "Reason", "User", "Notes"]
        filename = `stock-movements-${startDate}-to-${endDate}.csv`
        break

      case "metrics":
        data = await getHistoricalData(startDate, endDate, "metrics")
        headers = ["Date", "Total Products", "Total Value", "Low Stock", "Out of Stock", "Suppliers", "Avg Stock Level"]
        filename = `daily-metrics-${startDate}-to-${endDate}.csv`
        break
    }

    if (data.length === 0) {
      throw new Error("No data found for the selected date range")
    }

    // Generate CSV content
    let csvContent = headers.join(",") + "\n"

    data.forEach((row) => {
      let csvRow: string[] = []

      switch (type) {
        case "inventory":
          csvRow = [
            row.snapshot_date,
            `"${row.product_name}"`,
            `"${row.supplier}"`,
            row.quantity.toString(),
            row.price.toFixed(2),
            row.total_value.toFixed(2),
            `"${row.status}"`,
          ]
          break

        case "movements":
          csvRow = [
            new Date(row.movement_date).toISOString().split("T")[0],
            `"${row.product_name}"`,
            row.movement_type,
            row.quantity_change.toString(),
            row.quantity_before.toString(),
            row.quantity_after.toString(),
            `"${row.reason || ""}"`,
            `"${row.user_name}"`,
            `"${row.notes || ""}"`,
          ]
          break

        case "metrics":
          csvRow = [
            row.metric_date,
            row.total_products.toString(),
            row.total_inventory_value.toFixed(2),
            row.low_stock_items.toString(),
            row.out_of_stock_items.toString(),
            row.total_suppliers.toString(),
            (row.average_stock_level || 0).toFixed(2),
          ]
          break
      }

      csvContent += csvRow.join(",") + "\n"
    })

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return filename
  } catch (error) {
    console.error("Error exporting historical CSV:", error)
    throw error
  }
}

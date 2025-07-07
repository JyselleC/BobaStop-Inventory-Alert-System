-- Add these new tables to your existing Supabase setup

-- 1. Daily inventory snapshots for historical trends
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to products table
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Detailed stock movements for audit trail
CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  movement_type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'RECEIVED', 'SOLD'
  quantity_change INTEGER NOT NULL, -- positive for IN, negative for OUT
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT, -- 'RESTOCK', 'SALE', 'WASTE', 'CORRECTION', etc.
  reference_id TEXT, -- order number, receipt number, etc.
  user_name TEXT NOT NULL,
  notes TEXT,
  movement_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Supplier performance metrics
CREATE TABLE IF NOT EXISTS supplier_metrics (
  id BIGSERIAL PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  metric_date DATE NOT NULL,
  total_products INTEGER NOT NULL,
  total_inventory_value DECIMAL(10,2) NOT NULL,
  low_stock_items INTEGER NOT NULL,
  out_of_stock_items INTEGER NOT NULL,
  average_stock_level DECIMAL(5,2),
  restock_frequency INTEGER, -- days between restocks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(supplier_name, metric_date)
);

-- 4. System-wide daily metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  total_products INTEGER NOT NULL,
  total_inventory_value DECIMAL(10,2) NOT NULL,
  low_stock_items INTEGER NOT NULL,
  out_of_stock_items INTEGER NOT NULL,
  total_suppliers INTEGER NOT NULL,
  average_stock_level DECIMAL(5,2),
  highest_value_product TEXT,
  most_critical_item TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_product ON inventory_snapshots(product_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_metrics_date ON supplier_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_metrics_supplier ON supplier_metrics(supplier_name, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(metric_date DESC);

-- Enable RLS for all new tables
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Enable all access for inventory_snapshots" ON inventory_snapshots FOR ALL USING (true);
CREATE POLICY "Enable all access for stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Enable all access for supplier_metrics" ON supplier_metrics FOR ALL USING (true);
CREATE POLICY "Enable all access for daily_metrics" ON daily_metrics FOR ALL USING (true);

-- Create suppliers table (NEW)
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  restock_threshold INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'In Stock',
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  current_stock INTEGER NOT NULL,
  restock_threshold INTEGER NOT NULL,
  needed_quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_name);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable update access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON suppliers;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON activity_logs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON activity_logs;

DROP POLICY IF EXISTS "Enable read access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON cart_items;

-- Create policies for suppliers table
CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON suppliers FOR DELETE USING (true);

-- Create policies for products table
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

-- Create policies for activity_logs table
CREATE POLICY "Enable read access for all users" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON activity_logs FOR INSERT WITH CHECK (true);

-- Create policies for cart_items table
CREATE POLICY "Enable read access for all users" ON cart_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON cart_items FOR DELETE USING (true);

-- Insert default suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, notes) VALUES
('Kingeleke', 'Supply Manager', 'orders@kingeleke.com', '(555) 123-4567', '123 Tea Street, Vancouver, BC', 'Primary tea and boba supplier'),
('TAAS', 'Customer Service', 'info@taas.ca', '(555) 234-5678', '456 Supply Ave, Richmond, BC', 'Packaging and disposables supplier'),
('QualiTea', 'Sales Team', 'sales@qualitea.com', '(555) 345-6789', '789 Flavor Blvd, Burnaby, BC', 'Syrups and flavor supplier')
ON CONFLICT (name) DO NOTHING;

-- Supabase Database Schema for Al-Noor Cables Management System
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Raw Materials Table
CREATE TABLE IF NOT EXISTS raw_materials (
  id BIGINT PRIMARY KEY,
  "materialType" TEXT NOT NULL,
  supplier TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  quantity NUMERIC NOT NULL,
  "originalQuantity" NUMERIC NOT NULL,
  "batchId" TEXT NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Processed Materials Table
CREATE TABLE IF NOT EXISTS processed_materials (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  "materialType" TEXT NOT NULL,
  "inputQuantity" NUMERIC NOT NULL,
  "numberOfBundles" NUMERIC NOT NULL,
  "weightPerBundle" NUMERIC NOT NULL,
  "outputQuantity" NUMERIC NOT NULL,
  "usedQuantity" NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  "batchId" TEXT NOT NULL,
  notes TEXT,
  "rawMaterialBatchesUsed" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  "productName" TEXT NOT NULL,
  "productNumber" TEXT NOT NULL,
  "productTara" TEXT NOT NULL,
  "processedMaterialId" BIGINT,
  "processedMaterialBatchId" TEXT,
  "processedMaterialSnapshot" JSONB,
  "bundlesUsed" NUMERIC NOT NULL,
  "quantityFoot" NUMERIC NOT NULL,
  "quantityBundles" NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  "batchId" TEXT NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  details TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id BIGINT PRIMARY KEY,
  "customerId" BIGINT NOT NULL,
  "productProductionId" BIGINT NOT NULL,
  "productName" TEXT NOT NULL,
  "productNumber" TEXT NOT NULL,
  "productTara" TEXT NOT NULL,
  "quantityBundles" NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  "categoryId" BIGINT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  "salaryDate" TIMESTAMPTZ NOT NULL,
  "totalSalary" NUMERIC NOT NULL,
  "dailyPayouts" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_date ON raw_materials(date);
CREATE INDEX IF NOT EXISTS idx_raw_materials_type ON raw_materials("materialType");
CREATE INDEX IF NOT EXISTS idx_processed_materials_date ON processed_materials(date);
CREATE INDEX IF NOT EXISTS idx_products_date ON products(date);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases("customerId");
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_employees_salary_date ON employees("salaryDate");

-- Enable Row Level Security (RLS) - Optional but recommended for production
-- Uncomment these if you want to add authentication later

-- ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processed_materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
-- CREATE POLICY "Allow all operations" ON raw_materials FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON processed_materials FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON purchases FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON expenses FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON employees FOR ALL USING (true);

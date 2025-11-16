-- ============================================
-- Al Noor Cable House - Complete Database Schema
-- ============================================
-- This schema matches all functionality in the application
-- Compatible with Supabase (PostgreSQL)

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  sku VARCHAR(255),
  description TEXT,
  cost_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  category_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Only run if products table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    
    -- Add category_id if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id BIGINT;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add sku if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add cost_price if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add selling_price if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2) DEFAULT 0;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add quantity if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add reorder_level if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 5;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add is_active if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add is_deleted if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add created_at if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add updated_at if missing
    BEGIN
      ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add foreign key constraint for category_id
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    WHEN OTHERS THEN
      NULL;
    END;
    
    -- Add unique constraints
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    WHEN OTHERS THEN
      NULL;
    END;
    
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_sku_key UNIQUE (sku);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    WHEN OTHERS THEN
      NULL;
    END;
    
  END IF;
END $$;

-- Create indexes
DO $$
BEGIN
  -- Create index on category_id
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Create index on sku
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Create index on is_active
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- ============================================
-- 4. SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  sale_no VARCHAR(255) UNIQUE NOT NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_sale_no ON sales(sale_no);

-- ============================================
-- 5. EXPENSE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  category_id BIGINT REFERENCES expense_categories(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- ============================================
-- 7. RAW MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS raw_materials (
  id BIGSERIAL PRIMARY KEY,
  material_type VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL, -- in kgs (available/remaining quantity)
  original_quantity DECIMAL(10, 3) NOT NULL, -- in kgs (original quantity when added)
  batch_id VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_materials_batch_id ON raw_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_raw_materials_date ON raw_materials(date);
CREATE INDEX IF NOT EXISTS idx_raw_materials_material_type ON raw_materials(material_type);

-- ============================================
-- 8. PROCESSED RAW MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS processed_materials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- e.g., "7/12", "7/15", "7/64", "7/52" or custom
  material_type VARCHAR(100) NOT NULL, -- Copper or Silver
  input_quantity DECIMAL(10, 3) NOT NULL, -- in kgs (from raw material)
  number_of_bundles DECIMAL(10, 2) NOT NULL,
  weight_per_bundle DECIMAL(10, 3), -- in kgs - actual processed material weight (net weight)
  gross_weight_per_bundle DECIMAL(10, 3), -- in kgs - weight with tool/attachment (gross weight)
  weight DECIMAL(10, 3), -- in kgs - additional weight field
  output_quantity DECIMAL(10, 3) NOT NULL, -- numberOfBundles × weightPerBundle (in kgs)
  used_quantity DECIMAL(10, 3) DEFAULT 0, -- in kgs - amount used in products
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  batch_id VARCHAR(255) NOT NULL,
  notes TEXT,
  raw_material_batches_used JSONB, -- Array of RawMaterialBatchUsed objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processed_materials_batch_id ON processed_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_processed_materials_date ON processed_materials(date);
CREATE INDEX IF NOT EXISTS idx_processed_materials_material_type ON processed_materials(material_type);

-- ============================================
-- 9. PRODUCT PRODUCTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_productions (
  id BIGSERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_number VARCHAR(255) NOT NULL,
  product_tara VARCHAR(255) NOT NULL,
  processed_material_id BIGINT, -- Link to processed raw material (may be deleted)
  processed_material_batch_id VARCHAR(255),
  processed_material_snapshot JSONB, -- Snapshot of processed material when used
  bundles_used DECIMAL(10, 2) NOT NULL, -- Number of bundles from processed raw material used
  quantity_foot DECIMAL(10, 2) NOT NULL, -- in foot
  quantity_bundles DECIMAL(10, 2) NOT NULL, -- in bundles
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  batch_id VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_productions_batch_id ON product_productions(batch_id);
CREATE INDEX IF NOT EXISTS idx_product_productions_date ON product_productions(date);
CREATE INDEX IF NOT EXISTS idx_product_productions_product_name ON product_productions(product_name);

-- ============================================
-- 10. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- ============================================
-- 11. CUSTOMER PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  product_production_id BIGINT REFERENCES product_productions(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL, -- For display
  product_number VARCHAR(255) NOT NULL, -- For display
  product_tara VARCHAR(255) NOT NULL, -- For display
  quantity_bundles DECIMAL(10, 2) NOT NULL, -- Quantity in bundles
  price DECIMAL(10, 2) NOT NULL, -- Price per transaction
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_production_id ON purchases(product_production_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);

-- ============================================
-- 12. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  salary_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Date when salary is due/paid
  total_salary DECIMAL(10, 2) NOT NULL, -- Fixed salary amount
  daily_payouts JSONB, -- Array of DailyPayout objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_salary_date ON employees(salary_date);

-- ============================================
-- 13. SCRAP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scrap (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10, 3) NOT NULL, -- Amount of scrap in kgs
  material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('Copper', 'Silver')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrap_date ON scrap(date);
CREATE INDEX IF NOT EXISTS idx_scrap_material_type ON scrap(material_type);

-- ============================================
-- 14. BILLS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
  id BIGSERIAL PRIMARY KEY,
  bill_number VARCHAR(255) NOT NULL, -- Document number (e.g., "No.002")
  customer_name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  items JSONB NOT NULL, -- Array of BillItem objects
  total DECIMAL(10, 2) NOT NULL, -- Total amount in rupees
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_customer_name ON bills(customer_name);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);

-- ============================================
-- 15. CUSTOM PROCESSED RAW MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_processed_materials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL, -- Custom processed material name
  prior_raw_material VARCHAR(100) NOT NULL, -- Prior raw material type (e.g., "Copper", "Silver")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_processed_materials_name ON custom_processed_materials(name);

-- ============================================
-- 16. CUSTOM PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL, -- Custom product name
  product_number VARCHAR(255) NOT NULL, -- Product number
  product_tara VARCHAR(255) NOT NULL, -- Product Tara
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_products_name ON custom_products(name);

-- ============================================
-- 17. PVC MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pvc_materials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Custom PVC material name
  quantity DECIMAL(10, 3) NOT NULL, -- in kgs
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  batch_id VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pvc_materials_batch_id ON pvc_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_pvc_materials_date ON pvc_materials(date);
CREATE INDEX IF NOT EXISTS idx_pvc_materials_name ON pvc_materials(name);

-- ============================================
-- 18. CUSTOM PVC MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_pvc_materials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL, -- Custom PVC material name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_pvc_materials_name ON custom_pvc_materials(name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_processed_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvc_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pvc_materials ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
-- Note: Adjust these policies based on your authentication requirements

-- Users table policies
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users are insertable by authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users are updatable by authenticated users" ON users FOR UPDATE USING (true);
CREATE POLICY "Users are deletable by authenticated users" ON users FOR DELETE USING (true);

-- Categories table policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by authenticated users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Categories are updatable by authenticated users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Categories are deletable by authenticated users" ON categories FOR DELETE USING (true);

-- Products table policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by authenticated users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products are updatable by authenticated users" ON products FOR UPDATE USING (true);
CREATE POLICY "Products are deletable by authenticated users" ON products FOR DELETE USING (true);

-- Sales table policies
CREATE POLICY "Sales are viewable by everyone" ON sales FOR SELECT USING (true);
CREATE POLICY "Sales are insertable by authenticated users" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Sales are updatable by authenticated users" ON sales FOR UPDATE USING (true);
CREATE POLICY "Sales are deletable by authenticated users" ON sales FOR DELETE USING (true);

-- Expense categories table policies
CREATE POLICY "Expense categories are viewable by everyone" ON expense_categories FOR SELECT USING (true);
CREATE POLICY "Expense categories are insertable by authenticated users" ON expense_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Expense categories are updatable by authenticated users" ON expense_categories FOR UPDATE USING (true);
CREATE POLICY "Expense categories are deletable by authenticated users" ON expense_categories FOR DELETE USING (true);

-- Expenses table policies
CREATE POLICY "Expenses are viewable by everyone" ON expenses FOR SELECT USING (true);
CREATE POLICY "Expenses are insertable by authenticated users" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Expenses are updatable by authenticated users" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Expenses are deletable by authenticated users" ON expenses FOR DELETE USING (true);

-- Raw materials table policies
CREATE POLICY "Raw materials are viewable by everyone" ON raw_materials FOR SELECT USING (true);
CREATE POLICY "Raw materials are insertable by authenticated users" ON raw_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Raw materials are updatable by authenticated users" ON raw_materials FOR UPDATE USING (true);
CREATE POLICY "Raw materials are deletable by authenticated users" ON raw_materials FOR DELETE USING (true);

-- Processed materials table policies
CREATE POLICY "Processed materials are viewable by everyone" ON processed_materials FOR SELECT USING (true);
CREATE POLICY "Processed materials are insertable by authenticated users" ON processed_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Processed materials are updatable by authenticated users" ON processed_materials FOR UPDATE USING (true);
CREATE POLICY "Processed materials are deletable by authenticated users" ON processed_materials FOR DELETE USING (true);

-- Product productions table policies
CREATE POLICY "Product productions are viewable by everyone" ON product_productions FOR SELECT USING (true);
CREATE POLICY "Product productions are insertable by authenticated users" ON product_productions FOR INSERT WITH CHECK (true);
CREATE POLICY "Product productions are updatable by authenticated users" ON product_productions FOR UPDATE USING (true);
CREATE POLICY "Product productions are deletable by authenticated users" ON product_productions FOR DELETE USING (true);

-- Customers table policies
CREATE POLICY "Customers are viewable by everyone" ON customers FOR SELECT USING (true);
CREATE POLICY "Customers are insertable by authenticated users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers are updatable by authenticated users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Customers are deletable by authenticated users" ON customers FOR DELETE USING (true);

-- Purchases table policies
CREATE POLICY "Purchases are viewable by everyone" ON purchases FOR SELECT USING (true);
CREATE POLICY "Purchases are insertable by authenticated users" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Purchases are updatable by authenticated users" ON purchases FOR UPDATE USING (true);
CREATE POLICY "Purchases are deletable by authenticated users" ON purchases FOR DELETE USING (true);

-- Employees table policies
CREATE POLICY "Employees are viewable by everyone" ON employees FOR SELECT USING (true);
CREATE POLICY "Employees are insertable by authenticated users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees are updatable by authenticated users" ON employees FOR UPDATE USING (true);
CREATE POLICY "Employees are deletable by authenticated users" ON employees FOR DELETE USING (true);

-- Scrap table policies
CREATE POLICY "Scrap is viewable by everyone" ON scrap FOR SELECT USING (true);
CREATE POLICY "Scrap is insertable by authenticated users" ON scrap FOR INSERT WITH CHECK (true);
CREATE POLICY "Scrap is updatable by authenticated users" ON scrap FOR UPDATE USING (true);
CREATE POLICY "Scrap is deletable by authenticated users" ON scrap FOR DELETE USING (true);

-- Bills table policies
CREATE POLICY "Bills are viewable by everyone" ON bills FOR SELECT USING (true);
CREATE POLICY "Bills are insertable by authenticated users" ON bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Bills are updatable by authenticated users" ON bills FOR UPDATE USING (true);
CREATE POLICY "Bills are deletable by authenticated users" ON bills FOR DELETE USING (true);

-- Custom processed materials table policies
CREATE POLICY "Custom processed materials are viewable by everyone" ON custom_processed_materials FOR SELECT USING (true);
CREATE POLICY "Custom processed materials are insertable by authenticated users" ON custom_processed_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Custom processed materials are updatable by authenticated users" ON custom_processed_materials FOR UPDATE USING (true);
CREATE POLICY "Custom processed materials are deletable by authenticated users" ON custom_processed_materials FOR DELETE USING (true);

-- Custom products table policies
CREATE POLICY "Custom products are viewable by everyone" ON custom_products FOR SELECT USING (true);
CREATE POLICY "Custom products are insertable by authenticated users" ON custom_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Custom products are updatable by authenticated users" ON custom_products FOR UPDATE USING (true);
CREATE POLICY "Custom products are deletable by authenticated users" ON custom_products FOR DELETE USING (true);

-- PVC materials table policies
CREATE POLICY "PVC materials are viewable by everyone" ON pvc_materials FOR SELECT USING (true);
CREATE POLICY "PVC materials are insertable by authenticated users" ON pvc_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "PVC materials are updatable by authenticated users" ON pvc_materials FOR UPDATE USING (true);
CREATE POLICY "PVC materials are deletable by authenticated users" ON pvc_materials FOR DELETE USING (true);

-- Custom PVC materials table policies
CREATE POLICY "Custom PVC materials are viewable by everyone" ON custom_pvc_materials FOR SELECT USING (true);
CREATE POLICY "Custom PVC materials are insertable by authenticated users" ON custom_pvc_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Custom PVC materials are updatable by authenticated users" ON custom_pvc_materials FOR UPDATE USING (true);
CREATE POLICY "Custom PVC materials are deletable by authenticated users" ON custom_pvc_materials FOR DELETE USING (true);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE bills IS 'Stores billing information with nested bill items in JSONB format';
COMMENT ON COLUMN bills.items IS 'JSONB array of BillItem objects: {bundle, name, wire, feet, totalFeet, price}';
COMMENT ON COLUMN processed_materials.raw_material_batches_used IS 'JSONB array of RawMaterialBatchUsed objects: {rawMaterialId, batchId, quantityUsed, materialType}';
COMMENT ON COLUMN product_productions.processed_material_snapshot IS 'JSONB snapshot of ProcessedRawMaterial when used in production';
COMMENT ON COLUMN employees.daily_payouts IS 'JSONB array of DailyPayout objects: {id, employeeId, amount, date, notes, createdAt}';

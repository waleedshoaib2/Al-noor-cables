export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  categoryId: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Sale {
  id: number;
  saleNo: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  customerName?: string;
  customerPhone?: string;
  saleDate: Date;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  categoryId: number;
  date: Date;
  createdAt: Date;
}

export interface RawMaterial {
  id: number;
  materialType: string;
  supplier: string;
  date: Date;
  quantity: number; // in kgs (available/remaining quantity - gets reduced when used)
  originalQuantity: number; // in kgs (original quantity when added - never changes)
  batchId: string;
  notes?: string;
  createdAt: Date;
}

export interface ProcessedRawMaterial {
  id: number;
  name: string; // e.g., "7/12", "7/15", "7/64", "7/52" or custom
  materialType: string; // Copper or Silver
  inputQuantity: number; // in kgs (from raw material)
  numberOfBundles: number;
  weightPerBundle: number; // in kgs - actual processed material weight (net weight)
  grossWeightPerBundle?: number; // in kgs - weight with tool/attachment (gross weight)
  outputQuantity: number; // numberOfBundles × weightPerBundle (in kgs) - original output
  usedQuantity: number; // in kgs - amount used in products (gets deducted from outputQuantity for stock calculation)
  date: Date;
  batchId: string;
  notes?: string;
  rawMaterialBatchesUsed: RawMaterialBatchUsed[]; // History of which raw material batches were used
  createdAt: Date;
}

export interface RawMaterialBatchUsed {
  rawMaterialId: number;
  batchId: string;
  quantityUsed: number; // in kgs
  materialType: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  details?: string;
  createdAt: Date;
}

export interface CustomerPurchase {
  id: number;
  customerId: number;
  productProductionId: number; // Link to specific product production entry
  productName: string; // Product name (for display)
  productNumber: string; // Product number (for display)
  productTara: string; // Product Tara (for display)
  quantityBundles: number; // Quantity in bundles
  price: number; // Price per transaction
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface ProductProduction {
  id: number;
  productName: string; // Product name
  productNumber: string; // Product number
  productTara: string; // Product Tara
  processedMaterialId: number; // Link to processed raw material used (for reference, may be deleted)
  processedMaterialBatchId: string;
  processedMaterialSnapshot?: ProcessedRawMaterial; // Snapshot of processed material when used (for restoration)
  bundlesUsed: number; // Number of bundles from processed raw material that were actually used
  quantityFoot: number; // in foot
  quantityBundles: number; // in bundles
  date: Date;
  batchId: string;
  notes?: string;
  createdAt: Date;
}

export interface ProductSale {
  id: number;
  saleNo: string;
  productId: number; // Link to product production
  customerId: number; // Link to customer
  quantity: number; // in foot or bundles
  unit: 'foot' | 'bundles';
  unitPrice: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  purchaseDate: Date;
  address?: string;
  details?: string;
  notes?: string;
  createdAt: Date;
}

export interface DailyPayout {
  id: number;
  employeeId: number;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface Employee {
  id: number;
  name: string;
  salaryDate: Date; // Date when salary is due/paid
  totalSalary: number; // Fixed salary amount
  dailyPayouts: DailyPayout[]; // Array of daily payouts
  createdAt: Date;
}

export interface Scrap {
  id: number;
  amount: number; // Amount of scrap in kgs
  materialType: 'Copper' | 'Silver'; // Kind of scrap
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface CustomProcessedRawMaterial {
  id: number;
  name: string; // Custom processed material name
  priorRawMaterial: string; // Prior raw material type (e.g., "Copper", "Silver")
  createdAt: Date;
}

export interface CustomProduct {
  id: number;
  name: string; // Custom product name
  productNumber: string; // Product number
  productTara: string; // Product Tara
  createdAt: Date;
}
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
  quantity: number; // in kgs
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
  weightPerBundle: number; // in kgs
  outputQuantity: number; // numberOfBundles × weightPerBundle (in kgs)
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
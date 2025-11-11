import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'Cost must be positive'),
  sellingPrice: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be positive'),
  reorderLevel: z.number().int().min(0, 'Reorder level must be positive'),
  categoryId: z.number().int(),
});

// Expense validation schema
export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  categoryId: z.number().int(),
  date: z.date(),
});

// Sale validation schema
export const saleSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  discount: z.number().min(0).default(0),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});


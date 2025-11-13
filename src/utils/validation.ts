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

// Expense validation schema - validates form inputs as strings, converts on submit
export const expenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  amount: z.union([
    z.string().trim().min(1, 'Amount is required').refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be greater than 0' }
    ),
    z.number().min(0.01, 'Amount must be greater than 0'),
  ]).transform((val) => typeof val === 'string' ? Number(val) : val),
  categoryId: z.union([
    z.string(),
    z.number(),
  ]).transform((val) => typeof val === 'string' ? Number(val) : val),
  date: z.union([
    z.string().trim().min(1, 'Date is required').refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date' }
    ),
    z.date(),
  ]).transform((val) => typeof val === 'string' ? new Date(val) : val),
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


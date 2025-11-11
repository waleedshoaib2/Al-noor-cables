import { IPC } from '@/utils/ipc';
import type {
  User,
  ProductWithCategory,
  SaleWithProduct,
  ExpenseWithUser,
  ExpenseStats,
  LoginCredentials,
  CreateProductData,
  UpdateProductData,
  CreateSaleData,
  CreateExpenseData,
  UpdateExpenseData,
  SaleFilters,
  ExpenseFilters,
} from '@/types';

export interface ElectronAPI {
  // Auth
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;

  // Stock
  getAllProducts: () => Promise<ProductWithCategory[]>;
  getProductById: (id: number) => Promise<ProductWithCategory | null>;
  addProduct: (data: CreateProductData) => Promise<ProductWithCategory>;
  updateProduct: (data: UpdateProductData) => Promise<ProductWithCategory>;
  deleteProduct: (id: number) => Promise<void>;
  getLowStockAlerts: () => Promise<ProductWithCategory[]>;
  recordSale: (data: CreateSaleData) => Promise<SaleWithProduct>;
  getSales: (filters?: SaleFilters) => Promise<SaleWithProduct[]>;

  // Expense
  getAllExpenses: (filters?: ExpenseFilters) => Promise<ExpenseWithUser[]>;
  addExpense: (data: CreateExpenseData) => Promise<ExpenseWithUser>;
  updateExpense: (data: UpdateExpenseData) => Promise<ExpenseWithUser>;
  deleteExpense: (id: number) => Promise<void>;
  getExpenseStats: (startDate?: Date, endDate?: Date) => Promise<ExpenseStats>;

  // Category
  getAllCategories: () => Promise<Array<{ id: number; name: string; description: string | null }>>;
  getExpenseCategories: () => Promise<Array<{ id: number; name: string; description: string | null; color: string | null }>>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

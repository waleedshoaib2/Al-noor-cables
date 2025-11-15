import { create } from 'zustand';
import type { Category, ExpenseCategory } from '@/types';

interface CategoryState {
  categories: Category[];
  expenseCategories: ExpenseCategory[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  getCategories: () => Category[];
  getExpenseCategories: () => ExpenseCategory[];
}

// Seed default categories
const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Cables - Power', description: 'Power cables and cords' },
  { id: 2, name: 'Cables - Network', description: 'Network and ethernet cables' },
  { id: 3, name: 'Cables - Audio/Video', description: 'Audio and video cables' },
  { id: 4, name: 'Connectors', description: 'Various connectors and adapters' },
  { id: 5, name: 'Accessories', description: 'Cable accessories and tools' },
];

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 1, name: 'Bills', description: 'Utility bills and payments', color: '#EF4444' },
  { id: 2, name: 'Factory Expenses', description: 'Factory operational expenses', color: '#3B82F6' },
  { id: 3, name: 'Stationary', description: 'Stationery and office supplies', color: '#8B5CF6' },
  { id: 4, name: 'Maintenance', description: 'Equipment and facility maintenance', color: '#EC4899' },
  { id: 5, name: 'Office Expenses', description: 'Office operational expenses', color: '#10B981' },
];

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: INITIAL_CATEGORIES,
  expenseCategories: INITIAL_EXPENSE_CATEGORIES,
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: Date.now(),
    };
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },
  getCategories: () => get().categories,
  getExpenseCategories: () => get().expenseCategories,
}));


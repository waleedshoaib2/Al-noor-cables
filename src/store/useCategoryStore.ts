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
  { id: 1, name: 'Utilities', description: 'Electricity, water, internet', color: '#EF4444' },
  { id: 2, name: 'Rent', description: 'Office and warehouse rent', color: '#3B82F6' },
  { id: 3, name: 'Salaries', description: 'Employee salaries', color: '#10B981' },
  { id: 4, name: 'Transportation', description: 'Shipping and delivery', color: '#F59E0B' },
  { id: 5, name: 'Supplies', description: 'Office and warehouse supplies', color: '#8B5CF6' },
  { id: 6, name: 'Maintenance', description: 'Equipment and facility maintenance', color: '#EC4899' },
  { id: 7, name: 'Marketing', description: 'Marketing and advertising', color: '#14B8A6' },
  { id: 8, name: 'Other', description: 'Miscellaneous expenses', color: '#6B7280' },
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


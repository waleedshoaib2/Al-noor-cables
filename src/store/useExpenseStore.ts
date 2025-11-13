import { create } from 'zustand';
import type { Expense } from '@/types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: number, expense: Partial<Expense>) => void;
  deleteExpense: (id: number) => void;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getTotalByCategory: (categoryId: number) => number;
  getTotalByPeriod: (startDate: Date, endDate: Date) => number;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// Seed sample expenses
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 1,
    title: 'Electricity Bill',
    description: 'Monthly electricity bill',
    amount: 5000,
    categoryId: 1,
    date: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    title: 'Store Rent',
    description: 'Monthly store rent payment',
    amount: 30000,
    categoryId: 2,
    date: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 3,
    title: 'Office Supplies',
    description: 'Stationery and office supplies',
    amount: 2500,
    categoryId: 5,
    date: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 4,
    title: 'Vehicle Fuel',
    description: 'Fuel for delivery vehicle',
    amount: 8000,
    categoryId: 4,
    date: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 5,
    title: 'Internet Bill',
    description: 'Monthly internet subscription',
    amount: 3000,
    categoryId: 1,
    date: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
  },
];

const STORAGE_KEY = 'alnoor_expenses';

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: INITIAL_EXPENSES,
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { expenses: [...state.expenses, newExpense] };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.expenses.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving expenses to storage:', error);
      }
      return updated;
    });
  },
  updateExpense: (id, expense) => {
    set((state) => {
      const updated = {
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.expenses.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving expenses to storage:', error);
      }
      return updated;
    });
  },
  deleteExpense: (id) => {
    set((state) => {
      const updated = { expenses: state.expenses.filter((e) => e.id !== id) };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.expenses.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving expenses to storage:', error);
      }
      return updated;
    });
  },
  getExpensesByDateRange: (startDate, endDate) => {
    return get().expenses.filter(
      (e) => e.date >= startDate && e.date <= endDate
    );
  },
  getTotalByCategory: (categoryId) => {
    return get()
      .expenses.filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
  },
  getTotalByPeriod: (startDate, endDate) => {
    return get()
      .getExpensesByDateRange(startDate, endDate)
      .reduce((sum, e) => sum + e.amount, 0);
  },
  saveToStorage: () => {
    try {
      const expenses = get().expenses;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses.map(e => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }))));
    } catch (error) {
      console.error('Error saving expenses to storage:', error);
    }
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expenses: Expense[] = parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        }));
        set({ expenses });
      }
    } catch (error) {
      console.error('Error loading expenses from storage:', error);
    }
  },
}));

// Load from storage on initialization
if (typeof window !== 'undefined') {
  useExpenseStore.getState().loadFromStorage();
}


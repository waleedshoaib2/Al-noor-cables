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

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: INITIAL_EXPENSES,
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => ({
      expenses: [...state.expenses, newExpense],
    }));
  },
  updateExpense: (id, expense) => {
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
    }));
  },
  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
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
}));


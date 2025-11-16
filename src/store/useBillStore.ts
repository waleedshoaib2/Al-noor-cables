import { create } from 'zustand';
import type { Bill } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface BillState {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBill: (id: number, bill: Partial<Bill>) => void;
  deleteBill: (id: number) => void;
  getBillById: (id: number) => Bill | undefined;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'bill-storage';

// Helper functions for localStorage
const loadFromStorage = (): Bill[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.bills?.map((b: any) => ({
        ...b,
        date: new Date(b.date),
        createdAt: new Date(b.createdAt),
        items: (b.items || []).map((item: any) => {
          // Migration: convert old rate/rupees to price
          const price = item.price !== undefined ? item.price : (item.rupees || 0);
          return {
            bundle: item.bundle || 0,
            name: item.name || '',
            wire: item.wire || '',
            feet: item.feet || 0,
            totalFeet: item.totalFeet || 0,
            price: price,
          };
        }),
        total: b.total || 0,
      })) || [];
    }
  } catch (error) {
    console.error('Error loading bills from storage:', error);
  }
  return [];
};

const saveToStorage = (bills: Bill[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bills: bills.map((b) => ({
          ...b,
          date: b.date.toISOString(),
          createdAt: b.createdAt.toISOString(),
        })),
      })
    );
  } catch (error) {
    console.error('Error saving bills to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useBillStore = create<BillState>((set, get) => ({
  bills: initialData,

  addBill: (bill) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now(),
      createdAt: new Date(),
    };

    set((state) => {
      const newState = {
        bills: [newBill, ...state.bills],
      };
      saveToStorage(newState.bills);
      supabaseSyncService.markPending('bills');
      return newState;
    });
  },

  updateBill: (id, bill) => {
    set((state) => {
      const updated = state.bills.map((b) =>
        b.id === id ? { ...b, ...bill } : b
      );
      saveToStorage(updated);
      supabaseSyncService.markPending('bills');
      return { bills: updated };
    });
  },

  deleteBill: (id) => {
    set((state) => {
      const newState = {
        bills: state.bills.filter((b) => b.id !== id),
      };
      saveToStorage(newState.bills);
      supabaseSyncService.markPending('bills');
      return newState;
    });
  },

  getBillById: (id) => {
    return get().bills.find((b) => b.id === id);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ bills: data });
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.bills);
  },
}));


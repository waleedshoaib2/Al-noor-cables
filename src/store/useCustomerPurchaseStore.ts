import { create } from 'zustand';
import type { CustomerPurchase } from '@/types';

interface CustomerPurchaseState {
  purchases: CustomerPurchase[];
  addPurchase: (purchase: Omit<CustomerPurchase, 'id' | 'createdAt'>) => void;
  updatePurchase: (id: number, purchase: Partial<CustomerPurchase>) => void;
  deletePurchase: (id: number) => void;
  getPurchasesByCustomerId: (customerId: number) => CustomerPurchase[];
  getPurchaseById: (id: number) => CustomerPurchase | undefined;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'customer-purchase-storage';

// Helper functions for localStorage
const loadFromStorage = (): CustomerPurchase[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.purchases?.map((p: any) => ({
        ...p,
        date: new Date(p.date),
        createdAt: new Date(p.createdAt),
        // Migration: add productProductionId if missing (old purchases only had productName)
        productProductionId: p.productProductionId ?? 0,
        productNumber: p.productNumber ?? '',
        productTara: p.productTara ?? '',
        price: p.price ?? 0,
      })) || [];
    }
  } catch (error) {
    console.error('Error loading customer purchases from storage:', error);
  }
  return [];
};

const saveToStorage = (purchases: CustomerPurchase[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        purchases: purchases.map((p) => ({
          ...p,
          date: p.date.toISOString(),
          createdAt: p.createdAt.toISOString(),
        })),
      })
    );
  } catch (error) {
    console.error('Error saving customer purchases to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useCustomerPurchaseStore = create<CustomerPurchaseState>((set, get) => ({
  purchases: initialData,

  addPurchase: (purchase) => {
    const newPurchase: CustomerPurchase = {
      ...purchase,
      id: Date.now(),
      createdAt: new Date(),
    };

    set((state) => {
      const newState = {
        purchases: [newPurchase, ...state.purchases],
      };
      saveToStorage(newState.purchases);
      return newState;
    });
  },

  updatePurchase: (id, purchase) => {
    set((state) => {
      const updated = state.purchases.map((p) =>
        p.id === id ? { ...p, ...purchase } : p
      );
      saveToStorage(updated);
      return { purchases: updated };
    });
  },

  deletePurchase: (id) => {
    set((state) => {
      const newState = {
        purchases: state.purchases.filter((p) => p.id !== id),
      };
      saveToStorage(newState.purchases);
      return newState;
    });
  },

  getPurchasesByCustomerId: (customerId) => {
    return get().purchases.filter((p) => p.customerId === customerId);
  },

  getPurchaseById: (id) => {
    return get().purchases.find((p) => p.id === id);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ purchases: data });
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.purchases);
  },
}));


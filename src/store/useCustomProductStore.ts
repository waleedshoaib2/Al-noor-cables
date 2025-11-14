import { create } from 'zustand';
import type { CustomProduct } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface CustomProductState {
  customProducts: CustomProduct[];
  addCustomProduct: (product: Omit<CustomProduct, 'id' | 'createdAt'>) => void;
  updateCustomProduct: (id: number, product: Partial<CustomProduct>) => void;
  deleteCustomProduct: (id: number) => void;
  getCustomProductById: (id: number) => CustomProduct | undefined;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'custom-product-storage';

// Helper functions for localStorage
const loadFromStorage = (): CustomProduct[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading custom products from storage:', error);
  }
  return [];
};

const saveToStorage = (products: CustomProduct[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        products.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))
      )
    );
  } catch (error) {
    console.error('Error saving custom products to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useCustomProductStore = create<CustomProductState>((set, get) => ({
  customProducts: initialData,
  addCustomProduct: (product) => {
    const newProduct: CustomProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { customProducts: [...state.customProducts, newProduct] };
      saveToStorage(updated.customProducts);
      supabaseSyncService.markPending('customProducts');
      return updated;
    });
  },
  updateCustomProduct: (id, product) => {
    set((state) => {
      const updated = {
        customProducts: state.customProducts.map((p) => (p.id === id ? { ...p, ...product } : p)),
      };
      saveToStorage(updated.customProducts);
      supabaseSyncService.markPending('customProducts');
      return updated;
    });
  },
  deleteCustomProduct: (id) => {
    set((state) => {
      const updated = { customProducts: state.customProducts.filter((p) => p.id !== id) };
      saveToStorage(updated.customProducts);
      supabaseSyncService.markPending('customProducts');
      return updated;
    });
  },
  getCustomProductById: (id) => {
    return get().customProducts.find((p) => p.id === id);
  },
  saveToStorage: () => {
    const state = get();
    saveToStorage(state.customProducts);
  },
  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ customProducts: data });
  },
}));


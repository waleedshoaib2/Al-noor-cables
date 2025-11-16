import { create } from 'zustand';
import type { CustomerPurchase } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

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

// Helper function to update product stock
const updateProductStock = (productName: string, bundlesDelta: number, footDelta: number = 0) => {
  try {
    const productStorage = localStorage.getItem('product-storage');
    if (productStorage) {
      const productData = JSON.parse(productStorage);
      if (productData.stock && productData.stock[productName]) {
        productData.stock[productName].bundles += bundlesDelta;
        productData.stock[productName].foot += footDelta;
        
        // Ensure stock doesn't go negative
        productData.stock[productName].bundles = Math.max(0, productData.stock[productName].bundles);
        productData.stock[productName].foot = Math.max(0, productData.stock[productName].foot);
        
        localStorage.setItem('product-storage', JSON.stringify(productData));
        
        // Trigger a custom event to notify ProductStore to reload
        window.dispatchEvent(new CustomEvent('product-stock-updated'));
      }
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
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

    // Update product stock (decrease by purchase quantity)
    updateProductStock(purchase.productName, -purchase.quantityBundles);

    set((state) => {
      const newState = {
        purchases: [newPurchase, ...state.purchases],
      };
      saveToStorage(newState.purchases);
      supabaseSyncService.markPending('purchases');
      return newState;
    });
  },

  updatePurchase: (id, purchase) => {
    set((state) => {
      const existingPurchase = state.purchases.find(p => p.id === id);
      
      // If quantity changed, adjust stock
      if (existingPurchase && purchase.quantityBundles !== undefined) {
        const quantityDelta = existingPurchase.quantityBundles - purchase.quantityBundles;
        updateProductStock(existingPurchase.productName, quantityDelta);
      }
      
      const updated = state.purchases.map((p) =>
        p.id === id ? { ...p, ...purchase } : p
      );
      saveToStorage(updated);
      supabaseSyncService.markPending('purchases');
      return { purchases: updated };
    });
  },

  deletePurchase: (id) => {
    set((state) => {
      const purchase = state.purchases.find(p => p.id === id);
      
      // Restore stock when deleting purchase
      if (purchase) {
        updateProductStock(purchase.productName, purchase.quantityBundles);
      }
      
      const newState = {
        purchases: state.purchases.filter((p) => p.id !== id),
      };
      saveToStorage(newState.purchases);
      supabaseSyncService.markPending('purchases');
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


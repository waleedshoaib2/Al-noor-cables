import { create } from 'zustand';
import type { ProductProduction, ProductSale } from '@/types';
import { generateBatchId, generateSaleNumber } from '@/utils/constants';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface ProductState {
  productions: ProductProduction[];
  sales: ProductSale[];
  productNames: string[]; // Pre-defined product names (22 products)
  stock: Record<string, { foot: number; bundles: number }>; // Stock by product name
  addProduction: (production: Omit<ProductProduction, 'id' | 'createdAt' | 'batchId'>) => void;
  updateProduction: (id: number, production: Partial<ProductProduction>) => void;
  deleteProduction: (id: number) => void;
  getProductionById: (id: number) => ProductProduction | undefined;
  addSale: (sale: Omit<ProductSale, 'id' | 'saleNo' | 'createdAt' | 'totalAmount' | 'finalAmount'>) => void;
  updateSale: (id: number, sale: Partial<ProductSale>) => void;
  deleteSale: (id: number) => void;
  getSaleById: (id: number) => ProductSale | undefined;
  getStockByName: (name: string) => { foot: number; bundles: number };
  getTotalStock: () => { foot: number; bundles: number };
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'product-storage';

// Pre-defined product names (22 products)
const PREDEFINED_PRODUCT_NAMES = [
  '1 mm', '2 mm', '3 mm', '4 mm', '5 mm',
  '6 mm', '7 mm', '8 mm', '9 mm', '10 mm',
  '11 mm', '12 mm', '13 mm', '14 mm', '15 mm',
  '16 mm', '17 mm', '18 mm', '19 mm', '20 mm',
  '21 mm', '22 mm',
];

// Helper functions for localStorage
const loadFromStorage = (): {
  productions: ProductProduction[];
  sales: ProductSale[];
  productNames: string[];
  stock: Record<string, { foot: number; bundles: number }>;
} => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        productions: parsed.productions?.map((p: any) => ({
          ...p,
          date: new Date(p.date),
          createdAt: new Date(p.createdAt),
          // Migration: convert old quantity/unit to quantityFoot/quantityBundles
          quantityFoot: p.quantityFoot ?? (p.unit === 'foot' ? p.quantity : 0),
          quantityBundles: p.quantityBundles ?? (p.unit === 'bundles' ? p.quantity : 0),
          // Migration: add productNumber and productTara if missing
          productNumber: p.productNumber ?? '',
          productTara: p.productTara ?? '',
          // Migration: add bundlesUsed if missing (default to 0 for old entries)
          bundlesUsed: p.bundlesUsed ?? 0,
          // Migration: handle processedMaterialSnapshot dates
          processedMaterialSnapshot: p.processedMaterialSnapshot ? {
            ...p.processedMaterialSnapshot,
            date: new Date(p.processedMaterialSnapshot.date),
            createdAt: new Date(p.processedMaterialSnapshot.createdAt),
          } : undefined,
        })) || [],
        sales: parsed.sales?.map((s: any) => ({
          ...s,
          purchaseDate: new Date(s.purchaseDate),
          createdAt: new Date(s.createdAt),
        })) || [],
        // Always use the new predefined product names
        productNames: PREDEFINED_PRODUCT_NAMES,
        stock: parsed.stock || {},
      };
    }
  } catch (error) {
    console.error('Error loading products from storage:', error);
  }
  return {
    productions: [],
    sales: [],
    productNames: PREDEFINED_PRODUCT_NAMES,
    stock: {},
  };
};

const saveToStorage = (
  productions: ProductProduction[],
  sales: ProductSale[],
  productNames: string[],
  stock: Record<string, { foot: number; bundles: number }>
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        productions,
        sales,
        productNames,
        stock,
      })
    );
  } catch (error) {
    console.error('Error saving products to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useProductStore = create<ProductState>((set, get) => ({
  productions: initialData.productions,
  sales: initialData.sales,
  productNames: initialData.productNames,
  stock: initialData.stock,

  addProduction: (production) => {
    const newProduction: ProductProduction = {
      ...production,
      id: Date.now(),
      batchId: generateBatchId(production.date),
      createdAt: new Date(),
    };

    set((state) => {
      // Update stock
      const stock = { ...state.stock };
      if (!stock[production.productName]) {
        stock[production.productName] = { foot: 0, bundles: 0 };
      }
      stock[production.productName].foot += production.quantityFoot || 0;
      stock[production.productName].bundles += production.quantityBundles || 0;

      // Always use predefined product names (don't add custom ones to the list)
      // Custom names can still be used in productions, but dropdown will show predefined names
      const productNames = PREDEFINED_PRODUCT_NAMES;

      const newState = {
        productions: [newProduction, ...state.productions],
        sales: state.sales,
        productNames,
        stock,
      };

      saveToStorage(newState.productions, newState.sales, productNames, stock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  updateProduction: (id, production) => {
    set((state) => {
      const existing = state.productions.find((p) => p.id === id);
      if (!existing) return state;

      const updated = state.productions.map((p) =>
        p.id === id ? { ...p, ...production } : p
      );

      // Update stock if quantities changed
      let stock = { ...state.stock };
      if (production.quantityFoot !== undefined || production.quantityBundles !== undefined) {
        const updatedProduction = updated.find((p) => p.id === id);
        if (updatedProduction) {
          // Remove old stock
          stock[existing.productName].foot -= existing.quantityFoot || 0;
          stock[existing.productName].bundles -= existing.quantityBundles || 0;
          // Add new stock
          stock[updatedProduction.productName].foot += updatedProduction.quantityFoot || 0;
          stock[updatedProduction.productName].bundles += updatedProduction.quantityBundles || 0;
        }
      }

      const newState = {
        productions: updated,
        sales: state.sales,
        productNames: state.productNames,
        stock,
      };

      saveToStorage(updated, newState.sales, newState.productNames, stock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  deleteProduction: (id) => {
    set((state) => {
      const production = state.productions.find((p) => p.id === id);
      if (!production) return state;

      // Reduce stock
      const stock = { ...state.stock };
      stock[production.productName].foot = Math.max(
        0,
        (stock[production.productName].foot || 0) - (production.quantityFoot || 0)
      );
      stock[production.productName].bundles = Math.max(
        0,
        (stock[production.productName].bundles || 0) - (production.quantityBundles || 0)
      );

      const newState = {
        productions: state.productions.filter((p) => p.id !== id),
        sales: state.sales,
        productNames: state.productNames,
        stock,
      };

      saveToStorage(newState.productions, newState.sales, newState.productNames, stock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  getProductionById: (id) => {
    return get().productions.find((p) => p.id === id);
  },

  addSale: (sale) => {
    const production = get().getProductionById(sale.productId);
    if (!production) {
      throw new Error('Product production not found');
    }

    // Check stock
    const stock = get().getStockByName(production.productName);
    const availableStock = sale.unit === 'foot' ? stock.foot : stock.bundles;
    if (sale.quantity > availableStock) {
      throw new Error(`Insufficient stock. Available: ${availableStock} ${sale.unit}`);
    }

    const totalAmount = sale.quantity * sale.unitPrice;
    const finalAmount = totalAmount - sale.discount;

    const newSale: ProductSale = {
      ...sale,
      id: Date.now(),
      saleNo: generateSaleNumber(),
      totalAmount,
      finalAmount,
      createdAt: new Date(),
    };

    set((state) => {
      // Update stock
      const updatedStock = { ...state.stock };
      if (sale.unit === 'foot') {
        updatedStock[production.productName].foot -= sale.quantity;
      } else {
        updatedStock[production.productName].bundles -= sale.quantity;
      }

      const newState = {
        productions: state.productions,
        sales: [newSale, ...state.sales],
        productNames: state.productNames,
        stock: updatedStock,
      };

      saveToStorage(newState.productions, newState.sales, newState.productNames, updatedStock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  updateSale: (id, sale) => {
    set((state) => {
      const updated = state.sales.map((s) =>
        s.id === id ? { ...s, ...sale } : s
      );

      // Recalculate amounts if needed
      const updatedSale = updated.find((s) => s.id === id);
      if (updatedSale && (sale.quantity !== undefined || sale.unitPrice !== undefined || sale.discount !== undefined)) {
        updatedSale.totalAmount = updatedSale.quantity * updatedSale.unitPrice;
        updatedSale.finalAmount = updatedSale.totalAmount - updatedSale.discount;
      }

      const newState = {
        productions: state.productions,
        sales: updated,
        productNames: state.productNames,
        stock: state.stock,
      };

      saveToStorage(newState.productions, updated, newState.productNames, newState.stock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  deleteSale: (id) => {
    set((state) => {
      const sale = state.sales.find((s) => s.id === id);
      if (!sale) return state;

      const production = get().getProductionById(sale.productId);
      if (production) {
        // Restore stock
        const stock = { ...state.stock };
        if (sale.unit === 'foot') {
          stock[production.productName].foot += sale.quantity;
        } else {
          stock[production.productName].bundles += sale.quantity;
        }

        const newState = {
          productions: state.productions,
          sales: state.sales.filter((s) => s.id !== id),
          productNames: state.productNames,
          stock,
        };

        saveToStorage(newState.productions, newState.sales, newState.productNames, stock);
        supabaseSyncService.markPending('products');
        return newState;
      }

      const newState = {
        productions: state.productions,
        sales: state.sales.filter((s) => s.id !== id),
        productNames: state.productNames,
        stock: state.stock,
      };

      saveToStorage(newState.productions, newState.sales, newState.productNames, newState.stock);
      supabaseSyncService.markPending('products');
      return newState;
    });
  },

  getSaleById: (id) => {
    return get().sales.find((s) => s.id === id);
  },

  getStockByName: (name: string) => {
    return get().stock[name] || { foot: 0, bundles: 0 };
  },

  getTotalStock: () => {
    const stock = get().stock;
    return Object.values(stock).reduce(
      (total, s) => ({
        foot: total.foot + s.foot,
        bundles: total.bundles + s.bundles,
      }),
      { foot: 0, bundles: 0 }
    );
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({
      productions: data.productions,
      sales: data.sales,
      productNames: PREDEFINED_PRODUCT_NAMES, // Always use predefined names
      stock: data.stock,
    });
  },

  saveToStorage: () => {
    const state = get();
    // Always save predefined product names
    saveToStorage(state.productions, state.sales, PREDEFINED_PRODUCT_NAMES, state.stock);
  },
}));


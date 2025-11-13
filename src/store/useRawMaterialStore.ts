import { create } from 'zustand';
import type { RawMaterial, RawMaterialBatchUsed } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface RawMaterialState {
  rawMaterials: RawMaterial[];
  materialTypes: string[];
  suppliers: string[];
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'createdAt'>) => void;
  updateRawMaterial: (id: number, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: number) => void;
  getRawMaterialById: (id: number) => RawMaterial | undefined;
  getTotalByMaterialType: (materialType: string) => number;
  getRecentMaterials: (limit?: number) => RawMaterial[];
  loadFromStorage: () => void;
  saveToStorage: () => void;
  // Stock management for processing
  getAvailableStockByType: (materialType: string) => number;
  deductStock: (materialType: string, quantity: number) => RawMaterialBatchUsed[];
  getAvailableBatches: (materialType: string) => RawMaterial[];
  restoreStock: (batchesUsed: RawMaterialBatchUsed[]) => void;
}

const STORAGE_KEY = 'raw-material-storage';

// Helper functions for localStorage
const loadFromStorage = (): { rawMaterials: RawMaterial[]; materialTypes: string[]; suppliers: string[] } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        rawMaterials: parsed.rawMaterials?.map((m: any) => ({
          ...m,
          date: new Date(m.date),
          createdAt: new Date(m.createdAt),
          // Migration: if originalQuantity doesn't exist, set it to quantity
          originalQuantity: m.originalQuantity ?? m.quantity,
        })) || [],
        materialTypes: parsed.materialTypes || ['Copper', 'Silver'],
        suppliers: parsed.suppliers || [],
      };
    }
  } catch (error) {
    console.error('Error loading raw materials from storage:', error);
  }
  return {
    rawMaterials: [],
    materialTypes: ['Copper', 'Silver'],
    suppliers: [],
  };
};

const saveToStorage = (rawMaterials: RawMaterial[], materialTypes: string[], suppliers: string[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rawMaterials,
        materialTypes,
        suppliers,
      })
    );
  } catch (error) {
    console.error('Error saving raw materials to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useRawMaterialStore = create<RawMaterialState>((set, get) => ({
  rawMaterials: initialData.rawMaterials,
  materialTypes: initialData.materialTypes,
  suppliers: initialData.suppliers,

  addRawMaterial: (material) => {
    const newMaterial: RawMaterial = {
      ...material,
      id: Date.now(),
      createdAt: new Date(),
      // Set originalQuantity to the initial quantity
      originalQuantity: material.quantity,
    };

    set((state) => {
      // Add material type if not exists
      const materialTypes = state.materialTypes.includes(material.materialType)
        ? state.materialTypes
        : [...state.materialTypes, material.materialType];

      // Add supplier if not exists
      const suppliers = state.suppliers.includes(material.supplier)
        ? state.suppliers
        : [...state.suppliers, material.supplier];

      const newState = {
        rawMaterials: [newMaterial, ...state.rawMaterials],
        materialTypes,
        suppliers,
      };

      saveToStorage(newState.rawMaterials, materialTypes, suppliers);
      supabaseSyncService.markPending('rawMaterials');
      return newState;
    });
  },

  updateRawMaterial: (id, material) => {
    set((state) => {
      const updated = state.rawMaterials.map((m) => {
        if (m.id === id) {
          const updatedMaterial = { ...m, ...material };
          // If quantity is being updated, also update originalQuantity (only for unused materials)
          // This allows correcting entries before they're used
          if (material.quantity !== undefined) {
            updatedMaterial.originalQuantity = material.quantity;
          } else {
            // Preserve originalQuantity if quantity is not being updated
            updatedMaterial.originalQuantity = m.originalQuantity;
          }
          return updatedMaterial;
        }
        return m;
      });

      // Update material types and suppliers if changed
      let materialTypes = state.materialTypes;
      let suppliers = state.suppliers;

      if (material.materialType && !materialTypes.includes(material.materialType)) {
        materialTypes = [...materialTypes, material.materialType];
      }

      if (material.supplier && !suppliers.includes(material.supplier)) {
        suppliers = [...suppliers, material.supplier];
      }

      const newState = {
        rawMaterials: updated,
        materialTypes,
        suppliers,
      };

      saveToStorage(updated, materialTypes, suppliers);
      supabaseSyncService.markPending('rawMaterials');
      return newState;
    });
  },

  deleteRawMaterial: (id) => {
    set((state) => {
      const newState = {
        rawMaterials: state.rawMaterials.filter((m) => m.id !== id),
        materialTypes: state.materialTypes,
        suppliers: state.suppliers,
      };

      saveToStorage(newState.rawMaterials, newState.materialTypes, newState.suppliers);
      supabaseSyncService.markPending('rawMaterials');
      return newState;
    });
  },

  getRawMaterialById: (id) => {
    return get().rawMaterials.find((m) => m.id === id);
  },

  getTotalByMaterialType: (materialType: string) => {
    return get().rawMaterials
      .filter((m) => m.materialType.toLowerCase() === materialType.toLowerCase())
      .reduce((sum, m) => sum + m.quantity, 0);
  },

  getRecentMaterials: (limit = 10) => {
    return get()
      .rawMaterials.slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({
      rawMaterials: data.rawMaterials,
      materialTypes: data.materialTypes,
      suppliers: data.suppliers,
    });
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.rawMaterials, state.materialTypes, state.suppliers);
  },

  // Get available stock by material type (considering deductions)
  getAvailableStockByType: (materialType: string) => {
    return get().rawMaterials
      .filter((m) => m.materialType.toLowerCase() === materialType.toLowerCase())
      .reduce((sum, m) => sum + m.quantity, 0);
  },

  // Get available batches sorted by date (FIFO)
  getAvailableBatches: (materialType: string) => {
    return get()
      .rawMaterials.filter(
        (m) =>
          m.materialType.toLowerCase() === materialType.toLowerCase() &&
          m.quantity > 0
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  },

  // Deduct stock using FIFO (First In First Out)
  deductStock: (materialType: string, quantity: number): RawMaterialBatchUsed[] => {
    const batchesUsed: RawMaterialBatchUsed[] = [];
    let remainingQuantity = quantity;

    set((state) => {
      const updatedMaterials = [...state.rawMaterials];
      const availableBatches = updatedMaterials
        .filter(
          (m) =>
            m.materialType.toLowerCase() === materialType.toLowerCase() &&
            m.quantity > 0
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const batch of availableBatches) {
        if (remainingQuantity <= 0) break;

        const quantityToUse = Math.min(batch.quantity, remainingQuantity);
        const batchIndex = updatedMaterials.findIndex((m) => m.id === batch.id);

        if (batchIndex !== -1) {
          updatedMaterials[batchIndex] = {
            ...updatedMaterials[batchIndex],
            quantity: updatedMaterials[batchIndex].quantity - quantityToUse,
          };

          batchesUsed.push({
            rawMaterialId: batch.id,
            batchId: batch.batchId,
            quantityUsed: quantityToUse,
            materialType: batch.materialType,
          });

          remainingQuantity -= quantityToUse;
        }
      }

      if (remainingQuantity > 0) {
        throw new Error(
          `Insufficient stock. Available: ${quantity - remainingQuantity} kgs, Required: ${quantity} kgs`
        );
      }

      const newState = {
        rawMaterials: updatedMaterials,
        materialTypes: state.materialTypes,
        suppliers: state.suppliers,
      };

      saveToStorage(updatedMaterials, state.materialTypes, state.suppliers);
      return newState;
    });

    return batchesUsed;
  },

  // Restore stock when processed material is deleted
  restoreStock: (batchesUsed: RawMaterialBatchUsed[]) => {
    set((state) => {
      const updatedMaterials = [...state.rawMaterials];

      for (const batchUsed of batchesUsed) {
        const batchIndex = updatedMaterials.findIndex((m) => m.id === batchUsed.rawMaterialId);
        if (batchIndex !== -1) {
          updatedMaterials[batchIndex] = {
            ...updatedMaterials[batchIndex],
            quantity: updatedMaterials[batchIndex].quantity + batchUsed.quantityUsed,
          };
        }
      }

      const newState = {
        rawMaterials: updatedMaterials,
        materialTypes: state.materialTypes,
        suppliers: state.suppliers,
      };

      saveToStorage(updatedMaterials, state.materialTypes, state.suppliers);
      return newState;
    });
  },
}));


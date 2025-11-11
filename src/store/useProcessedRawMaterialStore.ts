import { create } from 'zustand';
import type { ProcessedRawMaterial } from '@/types';
import { generateBatchId } from '@/utils/constants';

interface ProcessedRawMaterialState {
  processedMaterials: ProcessedRawMaterial[];
  processedMaterialNames: string[]; // Predefined + custom names
  stock: Record<string, number>; // Stock by processed material name (in kgs)
  addProcessedMaterial: (material: Omit<ProcessedRawMaterial, 'id' | 'createdAt' | 'outputQuantity'>) => void;
  updateProcessedMaterial: (id: number, material: Partial<ProcessedRawMaterial>) => void;
  deleteProcessedMaterial: (id: number) => void;
  getProcessedMaterialById: (id: number) => ProcessedRawMaterial | undefined;
  getStockByName: (name: string) => number;
  getTotalStock: () => number;
  getRecentProcessedMaterials: (limit?: number) => ProcessedRawMaterial[];
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'processed-raw-material-storage';

// Predefined processed material names
const PREDEFINED_NAMES = ['7/12', '7/15', '7/64', '7/52'];

// Helper functions for localStorage
const loadFromStorage = (): {
  processedMaterials: ProcessedRawMaterial[];
  processedMaterialNames: string[];
  stock: Record<string, number>;
} => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        processedMaterials: parsed.processedMaterials?.map((m: any) => ({
          ...m,
          date: new Date(m.date),
          createdAt: new Date(m.createdAt),
          rawMaterialBatchesUsed: m.rawMaterialBatchesUsed || [],
        })) || [],
        processedMaterialNames: parsed.processedMaterialNames || PREDEFINED_NAMES,
        stock: parsed.stock || {},
      };
    }
  } catch (error) {
    console.error('Error loading processed materials from storage:', error);
  }
  return {
    processedMaterials: [],
    processedMaterialNames: PREDEFINED_NAMES,
    stock: {},
  };
};

const saveToStorage = (
  processedMaterials: ProcessedRawMaterial[],
  processedMaterialNames: string[],
  stock: Record<string, number>
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        processedMaterials,
        processedMaterialNames,
        stock,
      })
    );
  } catch (error) {
    console.error('Error saving processed materials to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useProcessedRawMaterialStore = create<ProcessedRawMaterialState>((set, get) => ({
  processedMaterials: initialData.processedMaterials,
  processedMaterialNames: initialData.processedMaterialNames,
  stock: initialData.stock,

  addProcessedMaterial: (material) => {
    const outputQuantity = material.numberOfBundles * material.weightPerBundle;
    const newMaterial: ProcessedRawMaterial = {
      ...material,
      outputQuantity,
      id: Date.now(),
      batchId: generateBatchId(material.date),
      createdAt: new Date(),
    };

    set((state) => {
      // Add processed material name if not exists
      const processedMaterialNames = state.processedMaterialNames.includes(material.name)
        ? state.processedMaterialNames
        : [...state.processedMaterialNames, material.name];

      // Update stock
      const stock = { ...state.stock };
      stock[material.name] = (stock[material.name] || 0) + outputQuantity;

      const newState = {
        processedMaterials: [newMaterial, ...state.processedMaterials],
        processedMaterialNames,
        stock,
      };

      saveToStorage(newState.processedMaterials, processedMaterialNames, stock);
      return newState;
    });
  },

  updateProcessedMaterial: (id, material) => {
    set((state) => {
      const existing = state.processedMaterials.find((m) => m.id === id);
      if (!existing) return state;

      const updated = state.processedMaterials.map((m) =>
        m.id === id ? { ...m, ...material } : m
      );

      // Update stock if output quantity changed
      let stock = { ...state.stock };
      if (material.numberOfBundles !== undefined || material.weightPerBundle !== undefined) {
        const updatedMaterial = updated.find((m) => m.id === id);
        if (updatedMaterial) {
          const oldOutput = existing.outputQuantity;
          const newOutput = updatedMaterial.numberOfBundles * updatedMaterial.weightPerBundle;
          const diff = newOutput - oldOutput;
          stock[updatedMaterial.name] = (stock[updatedMaterial.name] || 0) + diff;
        }
      }

      // Update processed material names if name changed
      let processedMaterialNames = state.processedMaterialNames;
      if (material.name && !processedMaterialNames.includes(material.name)) {
        processedMaterialNames = [...processedMaterialNames, material.name];
      }

      const newState = {
        processedMaterials: updated,
        processedMaterialNames,
        stock,
      };

      saveToStorage(updated, processedMaterialNames, stock);
      return newState;
    });
  },

  deleteProcessedMaterial: (id) => {
    set((state) => {
      const material = state.processedMaterials.find((m) => m.id === id);
      if (!material) return state;

      // Reduce stock
      const stock = { ...state.stock };
      stock[material.name] = Math.max(0, (stock[material.name] || 0) - material.outputQuantity);

      const newState = {
        processedMaterials: state.processedMaterials.filter((m) => m.id !== id),
        processedMaterialNames: state.processedMaterialNames,
        stock,
      };

      saveToStorage(newState.processedMaterials, newState.processedMaterialNames, stock);
      return newState;
    });
  },

  getProcessedMaterialById: (id) => {
    return get().processedMaterials.find((m) => m.id === id);
  },

  getStockByName: (name: string) => {
    return get().stock[name] || 0;
  },

  getTotalStock: () => {
    return Object.values(get().stock).reduce((sum, qty) => sum + qty, 0);
  },

  getRecentProcessedMaterials: (limit = 10) => {
    return get()
      .processedMaterials.slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({
      processedMaterials: data.processedMaterials,
      processedMaterialNames: data.processedMaterialNames,
      stock: data.stock,
    });
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.processedMaterials, state.processedMaterialNames, state.stock);
  },
}));


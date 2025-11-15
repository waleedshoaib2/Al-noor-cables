import { create } from 'zustand';
import type { ProcessedRawMaterial } from '@/types';
import { generateBatchId } from '@/utils/constants';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface ProcessedMaterialBatchData {
  materialType: string;
  inputQuantity: number;
  date: Date;
  batchId: string;
  notes?: string;
  rawMaterialBatchesUsed: any[];
  processedMaterials: Array<{
    name: string;
    numberOfBundles: number;
    weightPerBundle: number;
    grossWeightPerBundle?: number;
    weight?: number;
  }>;
}

interface ProcessedRawMaterialState {
  processedMaterials: ProcessedRawMaterial[];
  processedMaterialNames: string[]; // Predefined + custom names
  stock: Record<string, number>; // Stock by processed material name (in kgs)
  addProcessedMaterial: (material: Omit<ProcessedRawMaterial, 'id' | 'createdAt' | 'outputQuantity'>) => void;
  addProcessedMaterialBatch: (batch: ProcessedMaterialBatchData) => void;
  updateProcessedMaterial: (id: number, material: Partial<ProcessedRawMaterial>) => void;
  deleteProcessedMaterial: (id: number) => void;
  getProcessedMaterialById: (id: number) => ProcessedRawMaterial | undefined;
  getStockByName: (name: string) => number;
  getTotalStock: () => number;
  getRecentProcessedMaterials: (limit?: number) => ProcessedRawMaterial[];
  deductStockForProduct: (processedMaterialId: number, quantity: number) => void;
  restoreProcessedMaterialForProduct: (processedMaterial: ProcessedRawMaterial) => void;
  getAllProcessedMaterialNames: () => string[]; // Get all names including custom ones
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
          usedQuantity: m.usedQuantity ?? 0, // Migration: add usedQuantity if missing
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
        usedQuantity: 0, // Initialize as unused
        id: Date.now(),
        batchId: generateBatchId(material.date),
        createdAt: new Date(),
        grossWeightPerBundle: material.grossWeightPerBundle,
      };

    set((state) => {
      // Add processed material name if not exists
      const processedMaterialNames = state.processedMaterialNames.includes(material.name)
        ? state.processedMaterialNames
        : [...state.processedMaterialNames, material.name];

      // Update stock - recalculate based on all materials with this name
      const stock = { ...state.stock };
      const materialsWithName = [newMaterial, ...state.processedMaterials].filter((m) => m.name === material.name);
      stock[material.name] = materialsWithName.reduce(
        (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
        0
      );

      const newState = {
        processedMaterials: [newMaterial, ...state.processedMaterials],
        processedMaterialNames,
        stock,
      };

      saveToStorage(newState.processedMaterials, processedMaterialNames, stock);
      supabaseSyncService.markPending('processedMaterials');
      return newState;
    });
  },

  addProcessedMaterialBatch: (batch) => {
    const newMaterials: ProcessedRawMaterial[] = [];
    const processedMaterialNames = new Set<string>(get().processedMaterialNames);
    const stock = { ...get().stock };
    const baseId = Date.now();

    // Create an entry for each processed material
    batch.processedMaterials.forEach((pm, index) => {
      const outputQuantity = pm.numberOfBundles * pm.weightPerBundle;
      const newMaterial: ProcessedRawMaterial = {
        id: baseId + index, // Unique ID for each material in batch
        name: pm.name,
        materialType: batch.materialType,
        inputQuantity: batch.inputQuantity, // Shared input quantity
        numberOfBundles: pm.numberOfBundles,
        weightPerBundle: pm.weightPerBundle,
        grossWeightPerBundle: pm.grossWeightPerBundle,
        weight: pm.weight,
        outputQuantity,
        usedQuantity: 0, // Initialize as unused
        date: batch.date,
        batchId: batch.batchId, // Shared batch ID
        notes: batch.notes,
        rawMaterialBatchesUsed: batch.rawMaterialBatchesUsed, // Shared batches used
        createdAt: new Date(),
      };

      newMaterials.push(newMaterial);

      // Add processed material name if not exists
      if (!processedMaterialNames.has(pm.name)) {
        processedMaterialNames.add(pm.name);
      }

      // Stock will be recalculated after all materials are added
    });

    set((state) => {
      // Recalculate stock for all affected material names
      const allMaterials = [...newMaterials, ...state.processedMaterials];
      const affectedNames = new Set(newMaterials.map((m) => m.name));
      affectedNames.forEach((name) => {
        const materialsWithName = allMaterials.filter((m) => m.name === name);
        stock[name] = materialsWithName.reduce(
          (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
          0
        );
      });

      const newState = {
        processedMaterials: allMaterials,
        processedMaterialNames: Array.from(processedMaterialNames),
        stock,
      };

      saveToStorage(newState.processedMaterials, newState.processedMaterialNames, stock);
      supabaseSyncService.markPending('processedMaterials');
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

      // Recalculate stock for affected material names
      let stock = { ...state.stock };
      const affectedNames = new Set<string>();
      if (material.name) {
        affectedNames.add(material.name);
        affectedNames.add(existing.name);
      } else {
        affectedNames.add(existing.name);
      }
      if (material.numberOfBundles !== undefined || material.weightPerBundle !== undefined) {
        const updatedMaterial = updated.find((m) => m.id === id);
        if (updatedMaterial) {
          affectedNames.add(updatedMaterial.name);
        }
      }
      // Recalculate stock for all affected names
      affectedNames.forEach((name) => {
        const materialsWithName = updated.filter((m) => m.name === name);
        stock[name] = materialsWithName.reduce(
          (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
          0
        );
      });

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
      supabaseSyncService.markPending('processedMaterials');
      return newState;
    });
  },

  deleteProcessedMaterial: (id) => {
    set((state) => {
      const material = state.processedMaterials.find((m) => m.id === id);
      if (!material) return state;

      // Recalculate stock for the affected material name
      const updated = state.processedMaterials.filter((m) => m.id !== id);
      const stock = { ...state.stock };
      const materialsWithName = updated.filter((m) => m.name === material.name);
      stock[material.name] = materialsWithName.reduce(
        (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
        0
      );

      const newState = {
        processedMaterials: updated,
        processedMaterialNames: state.processedMaterialNames,
        stock,
      };

      saveToStorage(newState.processedMaterials, newState.processedMaterialNames, stock);
      supabaseSyncService.markPending('processedMaterials');
      return newState;
    });
  },

  getProcessedMaterialById: (id) => {
    return get().processedMaterials.find((m) => m.id === id);
  },

  getStockByName: (name: string) => {
    // Calculate available stock: sum of (outputQuantity - usedQuantity) for all materials with this name
    const materials = get().processedMaterials.filter((m) => m.name === name);
    return materials.reduce((sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)), 0);
  },

  getTotalStock: () => {
    return Object.values(get().stock).reduce((sum, qty) => sum + qty, 0);
  },

  deductStockForProduct: (processedMaterialId: number, quantity: number) => {
    set((state) => {
      const material = state.processedMaterials.find((m) => m.id === processedMaterialId);
      if (!material) return state;

      // Update the material to mark it as used (increase usedQuantity)
      const updatedMaterials = state.processedMaterials.map((m) =>
        m.id === processedMaterialId
          ? { ...m, usedQuantity: (m.usedQuantity || 0) + quantity }
          : m
      );

      // Recalculate stock based on available quantity (outputQuantity - usedQuantity)
      const stock = { ...state.stock };
      const materialsWithName = updatedMaterials.filter((m) => m.name === material.name);
      stock[material.name] = materialsWithName.reduce(
        (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
        0
      );

      const newState = {
        processedMaterials: updatedMaterials,
        processedMaterialNames: state.processedMaterialNames,
        stock,
      };

      saveToStorage(updatedMaterials, newState.processedMaterialNames, stock);
      supabaseSyncService.markPending('processedMaterials');
      return newState;
    });
  },

  restoreProcessedMaterialForProduct: (processedMaterial: ProcessedRawMaterial) => {
    set((state) => {
      // Find the material by ID and restore its usedQuantity
      const material = state.processedMaterials.find((m) => m.id === processedMaterial.id);
      if (!material) return state; // Material not found, nothing to restore

      // Reduce usedQuantity by the outputQuantity that was used
      const updatedMaterials = state.processedMaterials.map((m) =>
        m.id === processedMaterial.id
          ? { ...m, usedQuantity: Math.max(0, (m.usedQuantity || 0) - processedMaterial.outputQuantity) }
          : m
      );

      // Recalculate stock based on available quantity (outputQuantity - usedQuantity)
      const stock = { ...state.stock };
      const materialsWithName = updatedMaterials.filter((m) => m.name === processedMaterial.name);
      stock[processedMaterial.name] = materialsWithName.reduce(
        (sum, m) => sum + (m.outputQuantity - (m.usedQuantity || 0)),
        0
      );

      const newState = {
        processedMaterials: updatedMaterials,
        processedMaterialNames: state.processedMaterialNames,
        stock,
      };

      saveToStorage(updatedMaterials, newState.processedMaterialNames, stock);
      return newState;
    });
  },

  getRecentProcessedMaterials: (limit = 10) => {
    return get()
      .processedMaterials.slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  },

  getAllProcessedMaterialNames: () => {
    // Only get custom processed material names
    try {
      const customMaterials = JSON.parse(localStorage.getItem('custom-processed-material-storage') || '[]');
      const customNames = customMaterials.map((m: any) => m.name);
      return customNames;
    } catch {
      return [];
    }
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


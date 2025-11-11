import { create } from 'zustand';
import type { RawMaterial } from '@/types';

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
      return newState;
    });
  },

  updateRawMaterial: (id, material) => {
    set((state) => {
      const updated = state.rawMaterials.map((m) =>
        m.id === id ? { ...m, ...material } : m
      );

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
}));


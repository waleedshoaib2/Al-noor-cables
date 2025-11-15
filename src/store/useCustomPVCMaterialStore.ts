import { create } from 'zustand';
import type { CustomPVCMaterial } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface CustomPVCMaterialState {
  customPVCMaterials: CustomPVCMaterial[];
  addCustomPVCMaterial: (material: Omit<CustomPVCMaterial, 'id' | 'createdAt'>) => void;
  updateCustomPVCMaterial: (id: number, material: Partial<CustomPVCMaterial>) => void;
  deleteCustomPVCMaterial: (id: number) => void;
  getCustomPVCMaterialById: (id: number) => CustomPVCMaterial | undefined;
  getAllNames: () => string[];
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'custom-pvc-material-storage';

// Helper functions for localStorage
const loadFromStorage = (): CustomPVCMaterial[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading custom PVC materials from storage:', error);
  }
  return [];
};

const saveToStorage = (materials: CustomPVCMaterial[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        materials.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))
      )
    );
  } catch (error) {
    console.error('Error saving custom PVC materials to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useCustomPVCMaterialStore = create<CustomPVCMaterialState>((set, get) => ({
  customPVCMaterials: initialData,

  addCustomPVCMaterial: (material) => {
    const newMaterial: CustomPVCMaterial = {
      ...material,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { customPVCMaterials: [...state.customPVCMaterials, newMaterial] };
      saveToStorage(updated.customPVCMaterials);
      supabaseSyncService.markPending('customPVCMaterials');
      return updated;
    });
  },

  updateCustomPVCMaterial: (id, material) => {
    set((state) => {
      const updated = {
        customPVCMaterials: state.customPVCMaterials.map((m) =>
          m.id === id ? { ...m, ...material } : m
        ),
      };
      saveToStorage(updated.customPVCMaterials);
      supabaseSyncService.markPending('customPVCMaterials');
      return updated;
    });
  },

  deleteCustomPVCMaterial: (id) => {
    set((state) => {
      const updated = { customPVCMaterials: state.customPVCMaterials.filter((m) => m.id !== id) };
      saveToStorage(updated.customPVCMaterials);
      supabaseSyncService.markPending('customPVCMaterials');
      return updated;
    });
  },

  getCustomPVCMaterialById: (id) => {
    return get().customPVCMaterials.find((m) => m.id === id);
  },

  getAllNames: () => {
    return get().customPVCMaterials.map((m) => m.name).sort();
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.customPVCMaterials);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ customPVCMaterials: data });
  },
}));

// Load from storage on initialization
if (typeof window !== 'undefined') {
  useCustomPVCMaterialStore.getState().loadFromStorage();
}


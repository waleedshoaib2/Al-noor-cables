import { create } from 'zustand';
import type { CustomProcessedRawMaterial } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface CustomProcessedRawMaterialState {
  customProcessedMaterials: CustomProcessedRawMaterial[];
  addCustomProcessedMaterial: (material: Omit<CustomProcessedRawMaterial, 'id' | 'createdAt'>) => void;
  updateCustomProcessedMaterial: (id: number, material: Partial<CustomProcessedRawMaterial>) => void;
  deleteCustomProcessedMaterial: (id: number) => void;
  getCustomProcessedMaterialById: (id: number) => CustomProcessedRawMaterial | undefined;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'custom-processed-material-storage';

// Helper functions for localStorage
const loadFromStorage = (): CustomProcessedRawMaterial[] => {
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
    console.error('Error loading custom processed materials from storage:', error);
  }
  return [];
};

const saveToStorage = (materials: CustomProcessedRawMaterial[]) => {
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
    console.error('Error saving custom processed materials to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useCustomProcessedRawMaterialStore = create<CustomProcessedRawMaterialState>((set, get) => ({
  customProcessedMaterials: initialData,
  addCustomProcessedMaterial: (material) => {
    const newMaterial: CustomProcessedRawMaterial = {
      ...material,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { customProcessedMaterials: [...state.customProcessedMaterials, newMaterial] };
      saveToStorage(updated.customProcessedMaterials);
      supabaseSyncService.markPending('customProcessedMaterials');
      return updated;
    });
  },
  updateCustomProcessedMaterial: (id, material) => {
    set((state) => {
      const updated = {
        customProcessedMaterials: state.customProcessedMaterials.map((m) =>
          m.id === id ? { ...m, ...material } : m
        ),
      };
      saveToStorage(updated.customProcessedMaterials);
      supabaseSyncService.markPending('customProcessedMaterials');
      return updated;
    });
  },
  deleteCustomProcessedMaterial: (id) => {
    set((state) => {
      const updated = { customProcessedMaterials: state.customProcessedMaterials.filter((m) => m.id !== id) };
      saveToStorage(updated.customProcessedMaterials);
      supabaseSyncService.markPending('customProcessedMaterials');
      return updated;
    });
  },
  getCustomProcessedMaterialById: (id) => {
    return get().customProcessedMaterials.find((m) => m.id === id);
  },
  saveToStorage: () => {
    const state = get();
    saveToStorage(state.customProcessedMaterials);
  },
  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ customProcessedMaterials: data });
  },
}));


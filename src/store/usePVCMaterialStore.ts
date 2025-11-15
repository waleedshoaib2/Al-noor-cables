import { create } from 'zustand';
import type { PVCMaterial } from '@/types';
import { generateBatchId } from '@/utils/constants';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface PVCMaterialState {
  pvcMaterials: PVCMaterial[];
  addPVCMaterial: (material: Omit<PVCMaterial, 'id' | 'createdAt'>) => void;
  updatePVCMaterial: (id: number, material: Partial<PVCMaterial>) => void;
  deletePVCMaterial: (id: number) => void;
  getPVCMaterialById: (id: number) => PVCMaterial | undefined;
  getTotalQuantity: () => number;
  getRecentMaterials: (limit?: number) => PVCMaterial[];
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'pvc-material-storage';

// Helper functions for localStorage
const loadFromStorage = (): PVCMaterial[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.materials?.map((m: any) => ({
        ...m,
        date: new Date(m.date),
        createdAt: new Date(m.createdAt),
      })) || [];
    }
  } catch (error) {
    console.error('Error loading PVC materials from storage:', error);
  }
  return [];
};

const saveToStorage = (materials: PVCMaterial[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        materials: materials.map((m) => ({
          ...m,
          date: m.date.toISOString(),
          createdAt: m.createdAt.toISOString(),
        })),
      })
    );
  } catch (error) {
    console.error('Error saving PVC materials to storage:', error);
  }
};

const initialData = loadFromStorage();

export const usePVCMaterialStore = create<PVCMaterialState>((set, get) => ({
  pvcMaterials: initialData,

  addPVCMaterial: (material) => {
    const newMaterial: PVCMaterial = {
      ...material,
      id: Date.now(),
      createdAt: new Date(),
    };

    set((state) => {
      const newState = {
        pvcMaterials: [newMaterial, ...state.pvcMaterials],
      };
      saveToStorage(newState.pvcMaterials);
      supabaseSyncService.markPending('pvcMaterials');
      return newState;
    });
  },

  updatePVCMaterial: (id, material) => {
    set((state) => {
      const updated = state.pvcMaterials.map((m) =>
        m.id === id ? { ...m, ...material } : m
      );
      saveToStorage(updated);
      supabaseSyncService.markPending('pvcMaterials');
      return { pvcMaterials: updated };
    });
  },

  deletePVCMaterial: (id) => {
    set((state) => {
      const filtered = state.pvcMaterials.filter((m) => m.id !== id);
      saveToStorage(filtered);
      supabaseSyncService.markPending('pvcMaterials');
      return { pvcMaterials: filtered };
    });
  },

  getPVCMaterialById: (id) => {
    return get().pvcMaterials.find((m) => m.id === id);
  },

  getTotalQuantity: () => {
    return get().pvcMaterials.reduce((sum, m) => sum + m.quantity, 0);
  },

  getRecentMaterials: (limit = 10) => {
    return get()
      .pvcMaterials.sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ pvcMaterials: data });
  },

  saveToStorage: () => {
    saveToStorage(get().pvcMaterials);
  },
}));

// Load from storage on initialization
if (typeof window !== 'undefined') {
  usePVCMaterialStore.getState().loadFromStorage();
}


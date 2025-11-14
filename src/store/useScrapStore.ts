import { create } from 'zustand';
import type { Scrap } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface ScrapState {
  scraps: Scrap[];
  addScrap: (scrap: Omit<Scrap, 'id' | 'createdAt'>) => void;
  updateScrap: (id: number, scrap: Partial<Scrap>) => void;
  deleteScrap: (id: number) => void;
  getScrapsByDateRange: (startDate: Date, endDate: Date) => Scrap[];
  getTotalByMaterialType: (materialType: 'Copper' | 'Silver') => number;
  getTotalByPeriod: (startDate: Date, endDate: Date) => number;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'alnoor_scrap';

// Helper functions for localStorage
const loadFromStorage = (): Scrap[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        date: new Date(s.date),
        createdAt: new Date(s.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading scrap from storage:', error);
  }
  return [];
};

const saveToStorage = (scraps: Scrap[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        scraps.map((s) => ({
          ...s,
          date: s.date.toISOString(),
          createdAt: s.createdAt.toISOString(),
        }))
      )
    );
  } catch (error) {
    console.error('Error saving scrap to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useScrapStore = create<ScrapState>((set, get) => ({
  scraps: initialData,
  addScrap: (scrap) => {
    const newScrap: Scrap = {
      ...scrap,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { scraps: [...state.scraps, newScrap] };
      saveToStorage(updated.scraps);
      supabaseSyncService.markPending('scrap');
      return updated;
    });
  },
  updateScrap: (id, scrap) => {
    set((state) => {
      const updated = {
        scraps: state.scraps.map((s) => (s.id === id ? { ...s, ...scrap } : s)),
      };
      saveToStorage(updated.scraps);
      supabaseSyncService.markPending('scrap');
      return updated;
    });
  },
  deleteScrap: (id) => {
    set((state) => {
      const updated = { scraps: state.scraps.filter((s) => s.id !== id) };
      saveToStorage(updated.scraps);
      supabaseSyncService.markPending('scrap');
      return updated;
    });
  },
  getScrapsByDateRange: (startDate, endDate) => {
    return get().scraps.filter((s) => {
      const scrapDate = new Date(s.date);
      return scrapDate >= startDate && scrapDate <= endDate;
    });
  },
  getTotalByMaterialType: (materialType) => {
    return get()
      .scraps.filter((s) => s.materialType === materialType)
      .reduce((sum, s) => sum + s.amount, 0);
  },
  getTotalByPeriod: (startDate, endDate) => {
    return get()
      .getScrapsByDateRange(startDate, endDate)
      .reduce((sum, s) => sum + s.amount, 0);
  },
  saveToStorage: () => {
    const state = get();
    saveToStorage(state.scraps);
  },
  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ scraps: data });
  },
}));


import { create } from 'zustand';
import type { CustomKhata } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface CustomKhataState {
  entries: CustomKhata[];
  addEntry: (entry: Omit<CustomKhata, 'id' | 'createdAt'>) => void;
  updateEntry: (id: number, entry: Partial<CustomKhata>) => void;
  deleteEntry: (id: number) => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'alnoor_custom_khata';

export const useCustomKhataStore = create<CustomKhataState>((set, get) => ({
  entries: [],
  addEntry: (entry) => {
    const newEntry: CustomKhata = {
      ...entry,
      id: Date.now(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { entries: [...state.entries, newEntry] };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.entries.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving custom khata to storage:', error);
      }
      supabaseSyncService.markPending('custom_khata');
      return updated;
    });
  },
  updateEntry: (id, entry) => {
    set((state) => {
      const updated = {
        entries: state.entries.map((e) => (e.id === id ? { ...e, ...entry } : e)),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.entries.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving custom khata to storage:', error);
      }
      supabaseSyncService.markPending('custom_khata');
      return updated;
    });
  },
  deleteEntry: (id) => {
    set((state) => {
      const updated = { entries: state.entries.filter((e) => e.id !== id) };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.entries.map(e => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }))));
      } catch (error) {
        console.error('Error saving custom khata to storage:', error);
      }
      supabaseSyncService.markPending('custom_khata');
      return updated;
    });
  },
  saveToStorage: () => {
    try {
      const entries = get().entries;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map(e => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }))));
    } catch (error) {
      console.error('Error saving custom khata to storage:', error);
    }
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const entries: CustomKhata[] = parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        }));
        set({ entries });
      }
    } catch (error) {
      console.error('Error loading custom khata from storage:', error);
    }
  },
}));

// Load from storage on initialization
if (typeof window !== 'undefined') {
  useCustomKhataStore.getState().loadFromStorage();
}


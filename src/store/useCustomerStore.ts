import { create } from 'zustand';
import type { Customer } from '@/types';
import { supabaseSyncService } from '@/services/supabaseSyncService';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: number, customer: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  getCustomerById: (id: number) => Customer | undefined;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'customer-storage';

// Pre-defined customers (around 50)
const PREDEFINED_CUSTOMERS: Omit<Customer, 'id' | 'createdAt'>[] = [
  { name: 'Customer 1', phone: '0300-0000001', address: 'Address 1', details: 'Details 1' },
  { name: 'Customer 2', phone: '0300-0000002', address: 'Address 2', details: 'Details 2' },
  { name: 'Customer 3', phone: '0300-0000003', address: 'Address 3', details: 'Details 3' },
  { name: 'Customer 4', phone: '0300-0000004', address: 'Address 4', details: 'Details 4' },
  { name: 'Customer 5', phone: '0300-0000005', address: 'Address 5', details: 'Details 5' },
  // Add more predefined customers as needed
];

// Helper functions for localStorage
const loadFromStorage = (): Customer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.customers?.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      })) || [];
    }
  } catch (error) {
    console.error('Error loading customers from storage:', error);
  }
  // Initialize with predefined customers if storage is empty
  return PREDEFINED_CUSTOMERS.map((c, index) => ({
    ...c,
    id: index + 1,
    createdAt: new Date(),
  }));
};

const saveToStorage = (customers: Customer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers }));
  } catch (error) {
    console.error('Error saving customers to storage:', error);
  }
};

const initialData = loadFromStorage();

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: initialData,

  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now(),
      createdAt: new Date(),
    };

    set((state) => {
      const newState = {
        customers: [newCustomer, ...state.customers],
      };
      saveToStorage(newState.customers);
      supabaseSyncService.markPending('customers');
      return newState;
    });
  },

  updateCustomer: (id, customer) => {
    set((state) => {
      const updated = state.customers.map((c) =>
        c.id === id ? { ...c, ...customer } : c
      );
      saveToStorage(updated);
      supabaseSyncService.markPending('customers');
      return { customers: updated };
    });
  },

  deleteCustomer: (id) => {
    set((state) => {
      const newState = {
        customers: state.customers.filter((c) => c.id !== id),
      };
      saveToStorage(newState.customers);
      supabaseSyncService.markPending('customers');
      return newState;
    });
  },

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id);
  },

  loadFromStorage: () => {
    const data = loadFromStorage();
    set({ customers: data });
  },

  saveToStorage: () => {
    const state = get();
    saveToStorage(state.customers);
  },
}));


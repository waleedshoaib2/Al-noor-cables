import { supabase } from './supabaseClient';
import type { 
  RawMaterial, 
  ProcessedRawMaterial, 
  ProductProduction, 
  Customer, 
  CustomerPurchase, 
  Expense, 
  Employee 
} from '@/types';

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingChanges: {
    rawMaterials: number;
    processedMaterials: number;
    products: number;
    customers: number;
    purchases: number;
    expenses: number;
    employees: number;
  };
  isSyncing: boolean;
  error: string | null;
}

class SupabaseSyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingChanges: {
      rawMaterials: 0,
      processedMaterials: 0,
      products: 0,
      customers: 0,
      purchases: 0,
      expenses: 0,
      employees: 0,
    },
    isSyncing: false,
    error: null,
  };

  constructor() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.saveSyncStatus();
    });
    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.saveSyncStatus();
    });
    this.loadSyncStatus();
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  markPending(collection: keyof SyncStatus['pendingChanges']) {
    this.syncStatus.pendingChanges[collection]++;
    this.saveSyncStatus();
  }

  clearPending(collection: keyof SyncStatus['pendingChanges']) {
    this.syncStatus.pendingChanges[collection] = 0;
    this.saveSyncStatus();
  }

  private saveSyncStatus() {
    try {
      localStorage.setItem('sync-status', JSON.stringify({
        ...this.syncStatus,
        lastSyncTime: this.syncStatus.lastSyncTime?.toISOString() || null,
      }));
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }

  private loadSyncStatus() {
    try {
      const stored = localStorage.getItem('sync-status');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.syncStatus = {
          ...parsed,
          lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
        };
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }

  // Sync all data to Supabase
  async syncToCloud(): Promise<{ success: boolean; error?: string }> {
    console.log('🔄 Starting sync to cloud...');
    
    if (!this.isOnline()) {
      this.syncStatus.error = 'No internet connection';
      this.saveSyncStatus();
      return { success: false, error: 'No internet connection' };
    }

    if (this.syncStatus.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔑 Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file' };
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.saveSyncStatus();

    try {
      // Load all data from localStorage
      console.log('📦 Loading data from localStorage...');
      const rawMaterials = this.loadFromStorage<RawMaterial>('raw-material-storage');
      const processedMaterials = this.loadFromStorage<ProcessedRawMaterial>('processed-material-storage');
      const products = this.loadFromStorage<any>('product-storage');
      const customers = this.loadFromStorage<Customer>('customer-storage');
      const purchases = this.loadFromStorage<CustomerPurchase>('customer-purchase-storage');
      const expenses = this.loadFromStorage<Expense>('alnoor_expenses');
      const employees = this.loadFromStorage<Employee>('alnoor_employees');
      
      console.log('📊 Data loaded:', {
        rawMaterials: rawMaterials.length,
        processedMaterials: processedMaterials.length,
        products: products.length,
        customers: customers.length,
        purchases: purchases.length,
        expenses: expenses.length,
        employees: employees.length,
      });

      // Sync each collection
      console.log('☁️ Syncing collections to Supabase...');
      await this.syncCollection('raw_materials', rawMaterials);
      await this.syncCollection('processed_materials', processedMaterials);
      await this.syncCollection('products', products);
      await this.syncCollection('customers', customers);
      await this.syncCollection('purchases', purchases);
      await this.syncCollection('expenses', expenses);
      await this.syncCollection('employees', employees);
      console.log('✅ All collections synced successfully!');

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = {
        rawMaterials: 0,
        processedMaterials: 0,
        products: 0,
        customers: 0,
        purchases: 0,
        expenses: 0,
        employees: 0,
      };
      this.saveSyncStatus();

      return { success: true };
    } catch (error: any) {
      console.error('Sync error:', error);
      this.syncStatus.error = error.message || 'Sync failed';
      this.saveSyncStatus();
      return { success: false, error: error.message || 'Sync failed' };
    } finally {
      this.syncStatus.isSyncing = false;
      this.saveSyncStatus();
    }
  }

  // Load data from localStorage
  private loadFromStorage<T>(key: string): T[] {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log(`No data found for key: ${key}`);
        return [];
      }
      
      const parsed = JSON.parse(stored);
      
      // Handle different storage formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.purchases) {
        return parsed.purchases;
      } else if (parsed.productions) {
        return parsed.productions;
      } else if (parsed.customers) {
        return parsed.customers;
      } else if (parsed.expenses) {
        return parsed.expenses;
      } else if (parsed.employees) {
        return parsed.employees;
      } else if (parsed.rawMaterials) {
        return parsed.rawMaterials;
      } else if (parsed.processedMaterials) {
        return parsed.processedMaterials;
      }
      
      console.log(`Unknown format for key ${key}:`, parsed);
      return [];
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return [];
    }
  }

  // Sync a collection to Supabase
  private async syncCollection(collectionName: string, data: any[]): Promise<void> {
    if (!data || data.length === 0) {
      console.log(`⏭️ Skipping ${collectionName} - no data`);
      return;
    }
    
    console.log(`📤 Syncing ${collectionName} (${data.length} items)...`);

    // Convert dates to ISO strings and handle nested objects for Supabase
    const normalizedData = data.map(item => {
      const normalized: any = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        if (value instanceof Date) {
          normalized[key] = value.toISOString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects (like processedMaterialSnapshot)
          normalized[key] = JSON.parse(JSON.stringify(value, (k, v) => {
            if (v instanceof Date) return v.toISOString();
            return v;
          }));
        } else if (Array.isArray(value)) {
          // Handle arrays (like dailyPayouts, rawMaterialBatchesUsed)
          normalized[key] = value.map(v => {
            if (v instanceof Date) return v.toISOString();
            if (v && typeof v === 'object') {
              return JSON.parse(JSON.stringify(v, (k, val) => {
                if (val instanceof Date) return val.toISOString();
                return val;
              }));
            }
            return v;
          });
        } else {
          normalized[key] = value;
        }
      });
      return normalized;
    });

    // Use upsert to handle conflicts (update if exists, insert if not)
    const { data: result, error } = await supabase
      .from(collectionName)
      .upsert(normalizedData, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`❌ Error syncing ${collectionName}:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully synced ${collectionName}`);
  }

  // Pull data from Supabase (optional - for multi-device sync)
  async pullFromCloud(): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!this.isOnline()) {
      return { success: false, error: 'No internet connection' };
    }

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const collections = [
        'raw_materials',
        'processed_materials',
        'products',
        'customers',
        'purchases',
        'expenses',
        'employees',
      ];

      const cloudData: Record<string, any[]> = {};

      for (const collection of collections) {
        const { data, error } = await supabase
          .from(collection)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        cloudData[collection] = data || [];
      }

      return { success: true, data: cloudData };
    } catch (error: any) {
      return { success: false, error: error.message || 'Pull failed' };
    }
  }

  // Check connection to Supabase
  async checkConnection(): Promise<boolean> {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return false;
    }

    try {
      const { error } = await supabase.from('raw_materials').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();


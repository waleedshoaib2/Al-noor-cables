import { create } from 'zustand';
import type { Employee, DailyPayout } from '@/types';

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'dailyPayouts'>) => void;
  updateEmployee: (id: number, employee: Partial<Omit<Employee, 'id' | 'createdAt' | 'dailyPayouts'>>) => void;
  deleteEmployee: (id: number) => void;
  addDailyPayout: (employeeId: number, payout: Omit<DailyPayout, 'id' | 'employeeId' | 'createdAt'>) => void;
  updateDailyPayout: (employeeId: number, payoutId: number, payout: Partial<Omit<DailyPayout, 'id' | 'employeeId' | 'createdAt'>>) => void;
  deleteDailyPayout: (employeeId: number, payoutId: number) => void;
  getRemainingSalary: (employeeId: number) => number;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'alnoor_employees';

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  addEmployee: (employee) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now(),
      dailyPayouts: [],
      createdAt: new Date(),
    };
    set((state) => {
      const updated = { employees: [...state.employees, newEmployee] };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  updateEmployee: (id, employee) => {
    set((state) => {
      const updated = {
        employees: state.employees.map((e) => 
          e.id === id 
            ? { 
                ...e, 
                ...employee,
                salaryDate: employee.salaryDate || e.salaryDate,
                totalSalary: employee.totalSalary !== undefined ? employee.totalSalary : e.totalSalary,
              } 
            : e
        ),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  deleteEmployee: (id) => {
    set((state) => {
      const updated = { employees: state.employees.filter((e) => e.id !== id) };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  addDailyPayout: (employeeId, payout) => {
    const newPayout: DailyPayout = {
      ...payout,
      id: Date.now(),
      employeeId,
      createdAt: new Date(),
    };
    set((state) => {
      const updated = {
        employees: state.employees.map((e) =>
          e.id === employeeId
            ? { ...e, dailyPayouts: [...e.dailyPayouts, newPayout] }
            : e
        ),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  updateDailyPayout: (employeeId, payoutId, payout) => {
    set((state) => {
      const updated = {
        employees: state.employees.map((e) =>
          e.id === employeeId
            ? {
                ...e,
                dailyPayouts: e.dailyPayouts.map((p) =>
                  p.id === payoutId ? { ...p, ...payout } : p
                ),
              }
            : e
        ),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  deleteDailyPayout: (employeeId, payoutId) => {
    set((state) => {
      const updated = {
        employees: state.employees.map((e) =>
          e.id === employeeId
            ? { ...e, dailyPayouts: e.dailyPayouts.filter((p) => p.id !== payoutId) }
            : e
        ),
      };
      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.employees.map(e => ({
          ...e,
          salaryDate: e.salaryDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          dailyPayouts: e.dailyPayouts.map(p => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        }))));
      } catch (error) {
        console.error('Error saving employees to storage:', error);
      }
      return updated;
    });
  },
  getRemainingSalary: (employeeId) => {
    const employee = get().employees.find((e) => e.id === employeeId);
    if (!employee) return 0;
    const totalPayouts = employee.dailyPayouts.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, employee.totalSalary - totalPayouts);
  },
  saveToStorage: () => {
    try {
      const employees = get().employees;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees.map(e => ({
        ...e,
        salaryDate: e.salaryDate.toISOString(),
        createdAt: e.createdAt.toISOString(),
        dailyPayouts: e.dailyPayouts.map(p => ({
          ...p,
          date: p.date.toISOString(),
          createdAt: p.createdAt.toISOString(),
        })),
      }))));
    } catch (error) {
      console.error('Error saving employees to storage:', error);
    }
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const employees: Employee[] = parsed.map((e: any) => ({
          ...e,
          salaryDate: new Date(e.salaryDate),
          createdAt: new Date(e.createdAt),
          dailyPayouts: e.dailyPayouts.map((p: any) => ({
            ...p,
            date: new Date(p.date),
            createdAt: new Date(p.createdAt),
          })),
        }));
        set({ employees });
      }
    } catch (error) {
      console.error('Error loading employees from storage:', error);
    }
  },
}));

// Load from storage on initialization
if (typeof window !== 'undefined') {
  useEmployeeStore.getState().loadFromStorage();
}


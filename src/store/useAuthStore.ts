import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Hardcoded users
const USERS: User[] = [
  { id: 1, username: 'admin', fullName: 'Admin User', role: 'admin' },
  { id: 2, username: 'user', fullName: 'Regular User', role: 'user' },
];

// Hardcoded passwords (simple check)
const PASSWORDS: Record<string, string> = {
  admin: 'alnoor',
  user: 'alnoor',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (username: string, password: string) => {
    const user = USERS.find((u) => u.username === username);
    if (user && PASSWORDS[username] === password) {
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));


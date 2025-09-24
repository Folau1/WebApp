import { create } from 'zustand';
import type { AdminUser } from '../types/api';

interface AdminStore {
  user: AdminUser | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser | null) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ user: null, isAuthenticated: false });
  }
}));








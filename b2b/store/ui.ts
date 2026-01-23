// UI state store using Zustand with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIState } from '@/types/ui';

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebarCollapsed: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'b2b-ui-storage',
    }
  )
);

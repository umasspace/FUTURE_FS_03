import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewType = 'dashboard' | 'contacts' | 'companies' | 'deals' | 'tasks' | 'analytics';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CrmState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  dashboardSearch: string;
  setDashboardSearch: (query: string) => void;
  // Auth state
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useCrmStore = create<CrmState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view, sidebarOpen: false }),
      selectedContactId: null,
      setSelectedContactId: (id) => set({ selectedContactId: id }),
      selectedDealId: null,
      setSelectedDealId: (id) => set({ selectedDealId: id }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      dashboardSearch: '',
      setDashboardSearch: (query) => set({ dashboardSearch: query }),
      // Auth
      user: null,
      login: (user) => {
        set({ user });
        // Auto-seed database in background on first login
        fetch('/api/seed', { method: 'POST' }).catch(() => {});
      },
      logout: () => set({ user: null, currentView: 'dashboard' }),
    }),
    {
      name: 'umas-crm-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
